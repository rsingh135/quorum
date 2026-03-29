from __future__ import annotations

import asyncio
import os
from typing import Any, Dict, Optional

from langgraph.graph import END, START, StateGraph

from agents.agent_factory import get_all_agents
from models.schemas import CaseInput, CoalitionMap, JusticeAnalysis, MarketImplications, VerdictSynthesis
from services.llm import Llm

try:
    import yfinance as yf  # type: ignore
except Exception:  # pragma: no cover
    yf = None  # type: ignore


class DeliberationState(Dict[str, Any]):
    case: CaseInput
    justice_analyses: Dict[str, JusticeAnalysis]
    coalition_map: Optional[CoalitionMap]
    verdict: Optional[VerdictSynthesis]
    market_implications: Optional[MarketImplications]


async def case_preparation_node(state: DeliberationState) -> DeliberationState:
    # Phase 3: validate shape (pydantic already does most)
    state["justice_analyses"] = {}
    state["coalition_map"] = None
    state["verdict"] = None
    state["market_implications"] = None
    return state


async def parallel_justice_node(state: DeliberationState) -> DeliberationState:
    agents = get_all_agents()

    async def run_one(agent):
        analysis = await agent.analyze_case(state["case"])
        return agent.justice_id, analysis

    results = await asyncio.gather(*[run_one(a) for a in agents])
    state["justice_analyses"] = {jid: analysis for jid, analysis in results}
    return state


async def coalition_detection_node(state: DeliberationState) -> DeliberationState:
    # If we don't have votes yet (e.g., missing API key), fall back immediately.
    affirm = [jid for jid, a in state["justice_analyses"].items() if a.vote == "AFFIRM"]
    reverse = [jid for jid, a in state["justice_analyses"].items() if a.vote == "REVERSE"]
    if not affirm and not reverse:
        state["coalition_map"] = CoalitionMap(
            majority=[],
            minority=[],
            swing_justices=list(state["justice_analyses"].keys()),
            predicted_margin="unknown",
            majority_author=None,
        )
        return state

    llm = Llm()
    model = os.getenv("ANTHROPIC_SYNTHESIS_MODEL", "claude-sonnet-4-20250514")
    system = """
You are a Supreme Court term clerk. Your job is to infer coalitions from nine justices' individual analyses.
Return ONLY valid JSON with:
{
  "majority": ["justice_id", ...],
  "minority": ["justice_id", ...],
  "swing_justices": ["justice_id", ...],
  "predicted_margin": "5-4" | "6-3" | "7-2" | "unanimous" | "unknown",
  "majority_author": "<justice_id or null>"
}
Use the provided justice_ids exactly.
""".strip()
    payload = {
        "case": state["case"].model_dump(),
        "justice_analyses": {jid: a.model_dump() for jid, a in state["justice_analyses"].items()},
    }
    res = await llm.complete_json(model=model, system=system, user=str(payload), max_tokens=900, temperature=0.2)

    # Validate/clean
    majority = [str(x) for x in (res.get("majority") or [])]
    minority = [str(x) for x in (res.get("minority") or [])]
    swing = [str(x) for x in (res.get("swing_justices") or [])]
    predicted_margin = res.get("predicted_margin") or "unknown"
    majority_author = res.get("majority_author")
    majority_author = str(majority_author) if majority_author else None

    state["coalition_map"] = CoalitionMap(
        majority=majority,
        minority=minority,
        swing_justices=swing,
        predicted_margin=predicted_margin,  # type: ignore[arg-type]
        majority_author=majority_author,
    )
    return state


async def verdict_synthesis_node(state: DeliberationState) -> DeliberationState:
    affirm_ct = sum(1 for a in state["justice_analyses"].values() if a.vote == "AFFIRM")
    reverse_ct = sum(1 for a in state["justice_analyses"].values() if a.vote == "REVERSE")
    if affirm_ct + reverse_ct == 0:
        state["verdict"] = VerdictSynthesis(
            outcome="AFFIRM",
            probability=0.5,
            confidence_interval=(0.35, 0.65),
            vote_count={"affirm": 0, "reverse": 0},
            swing_justices=state["coalition_map"].swing_justices if state.get("coalition_map") else [],
            majority_author=None,
            key_holding_prediction="No votes returned (likely missing ANTHROPIC_API_KEY).",
            uncertainty_level="HIGH",
        )
        return state

    llm = Llm()
    model = os.getenv("ANTHROPIC_SYNTHESIS_MODEL", "claude-sonnet-4-20250514")
    system = """
You are synthesizing a predicted Supreme Court outcome from nine justice analyses.
Return ONLY valid JSON with:
{
  "outcome": "AFFIRM" | "REVERSE",
  "probability": <float 0.0-1.0>,
  "confidence_interval": [<low>, <high>],
  "vote_count": { "affirm": <int>, "reverse": <int> },
  "swing_justices": ["justice_id", ...],
  "majority_author": "<justice_id or null>",
  "key_holding_prediction": "<1-2 sentences>",
  "uncertainty_level": "LOW" | "MEDIUM" | "HIGH"
}
Use provided justice_ids exactly.
""".strip()
    payload = {
        "case": state["case"].model_dump(),
        "justice_analyses": {jid: a.model_dump() for jid, a in state["justice_analyses"].items()},
        "coalition_map": state["coalition_map"].model_dump() if state.get("coalition_map") else None,
    }
    res = await llm.complete_json(model=model, system=system, user=str(payload), max_tokens=1100, temperature=0.2)

    # Minimal sanity defaults
    outcome = res.get("outcome") if res.get("outcome") in {"AFFIRM", "REVERSE"} else ("AFFIRM" if affirm_ct >= reverse_ct else "REVERSE")
    probability = float(res.get("probability") or 0.55)
    ci = res.get("confidence_interval") or [max(0.0, probability - 0.15), min(1.0, probability + 0.15)]
    vc = res.get("vote_count") or {"affirm": affirm_ct, "reverse": reverse_ct}
    swing = [str(x) for x in (res.get("swing_justices") or [])]
    majority_author = res.get("majority_author")
    majority_author = str(majority_author) if majority_author else None
    key_holding = str(res.get("key_holding_prediction") or "")
    uncertainty = res.get("uncertainty_level") or "MEDIUM"

    state["verdict"] = VerdictSynthesis(
        outcome=outcome,  # type: ignore[arg-type]
        probability=max(0.0, min(1.0, probability)),
        confidence_interval=(float(ci[0]), float(ci[1])),
        vote_count={"affirm": int(vc.get("affirm", affirm_ct)), "reverse": int(vc.get("reverse", reverse_ct))},
        swing_justices=swing,
        majority_author=majority_author,
        key_holding_prediction=key_holding[:600],
        uncertainty_level=uncertainty,  # type: ignore[arg-type]
    )
    return state


async def market_mapping_node(state: DeliberationState) -> DeliberationState:
    case: CaseInput = state["case"]
    verdict: Optional[VerdictSynthesis] = state.get("verdict")
    if verdict is None:
        state["market_implications"] = MarketImplications(
            tickers=[],
            sector_exposure=[],
            historical_comparable=None,
        )
        return state

    tickers = case.tickers_at_risk or []

    prices: Dict[str, Any] = {}
    if yf is not None and tickers:
        try:
            def _fetch():
                out = {}
                for t in tickers:
                    info = yf.Ticker(t).fast_info
                    out[t] = {"last_price": info.get("last_price"), "currency": info.get("currency")}
                return out

            prices = await asyncio.to_thread(_fetch)
        except Exception:
            prices = {}

    # LLM directional mapping (safe fallback if key missing)
    llm = Llm()
    model = os.getenv("ANTHROPIC_MARKET_MODEL", "claude-haiku-4-5")
    system = """
You are a markets analyst translating a Supreme Court outcome into immediate equity impacts.
Return ONLY JSON:
{
  "tickers": [
    { "ticker": "X", "direction": "UP"|"DOWN"|"FLAT", "rationale": "<short>", "price": <number|null> }
  ],
  "sector_exposure": [
    { "sector": "<sector>", "intensity": 0.0-1.0 }
  ],
  "historical_comparable": { "case": "<name>", "year": <int|null>, "move_30d": "<string>" } | null
}
""".strip()
    user = str(
        {
            "case": case.model_dump(),
            "verdict": verdict.model_dump(),
            "prices": prices,
        }
    )
    res = await llm.complete_json(model=model, system=system, user=user, max_tokens=900, temperature=0.3)

    # If LLM failed, fall back to a deterministic stub.
    if res.get("error"):
        state["market_implications"] = MarketImplications(
            tickers=[
                {
                    "ticker": t,
                    "direction": "FLAT",
                    "rationale": "Market mapping unavailable (missing API key or upstream error).",
                    "price": prices.get(t, {}).get("last_price") if prices else None,
                }
                for t in tickers
            ],
            sector_exposure=[{"sector": s, "intensity": 0.5} for s in (case.sectors_affected or [])],
            historical_comparable=None,
        )
        return state

    enriched = []
    for row in res.get("tickers") or []:
        t = str(row.get("ticker", "")).upper()
        if not t:
            continue
        enriched.append(
            {
                "ticker": t,
                "direction": row.get("direction", "FLAT"),
                "rationale": row.get("rationale", ""),
                "price": (prices.get(t, {}) or {}).get("last_price"),
            }
        )

    state["market_implications"] = MarketImplications(
        tickers=enriched,
        sector_exposure=res.get("sector_exposure") or [],
        historical_comparable=res.get("historical_comparable"),
    )
    return state


def build_deliberation_graph():
    g = StateGraph(DeliberationState)
    g.add_node("case_prep", case_preparation_node)
    g.add_node("parallel_justice", parallel_justice_node)
    g.add_node("coalition", coalition_detection_node)
    g.add_node("verdict", verdict_synthesis_node)
    g.add_node("market", market_mapping_node)

    g.add_edge(START, "case_prep")
    g.add_edge("case_prep", "parallel_justice")
    g.add_edge("parallel_justice", "coalition")
    g.add_edge("coalition", "verdict")
    g.add_edge("verdict", "market")
    g.add_edge("market", END)
    return g.compile()

