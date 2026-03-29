from __future__ import annotations

import asyncio
from typing import Any, Awaitable, Callable, Dict

from agents.agent_factory import get_all_agents
from agents.deliberation_graph import (
    case_preparation_node,
    coalition_detection_node,
    market_mapping_node,
    verdict_synthesis_node,
)
from models.schemas import CaseInput, CoalitionMap, JusticeAnalysis, MarketImplications, VerdictSynthesis

EmitFn = Callable[[str, Any], Awaitable[None]]


class DeliberationState(Dict[str, Any]):
    case: CaseInput
    justice_analyses: Dict[str, JusticeAnalysis]
    coalition_map: CoalitionMap | None
    verdict: VerdictSynthesis | None
    market_implications: MarketImplications | None


async def run_justices_streaming(
    state: DeliberationState,
    on_justice: Callable[[str, JusticeAnalysis], Awaitable[None]],
) -> DeliberationState:
    agents = get_all_agents()
    tasks: Dict[asyncio.Task, str] = {}
    for agent in agents:
        t = asyncio.create_task(agent.analyze_case(state["case"]))
        tasks[t] = agent.justice_id

    while tasks:
        done, _ = await asyncio.wait(tasks.keys(), return_when=asyncio.FIRST_COMPLETED)
        for task in done:
            jid = tasks.pop(task)
            try:
                analysis = await task
            except Exception as e:
                analysis = JusticeAnalysis(
                    vote="ABSTAINED",
                    confidence=0.0,
                    primary_reasoning=f"Agent error: {e}",
                    key_concern="N/A",
                    analogous_cases=[],
                    uncertainty_factors=[str(e)],
                    likely_opinion_type="concurring",
                )
            state["justice_analyses"][jid] = analysis
            await on_justice(jid, analysis)

    return state


async def run_deliberation_with_streaming(case: CaseInput, emit: EmitFn) -> Dict[str, Any]:
    state: DeliberationState = {
        "case": case,
        "justice_analyses": {},
        "coalition_map": None,
        "verdict": None,
        "market_implications": None,
    }

    state = await case_preparation_node(state)
    await emit("case_ready", {"docket": case.docket})

    async def on_justice(jid: str, analysis: JusticeAnalysis) -> None:
        await emit(
            "justice_complete",
            {"justice_id": jid, "analysis": analysis.model_dump()},
        )

    state = await run_justices_streaming(state, on_justice)

    state = await coalition_detection_node(state)
    if state.get("coalition_map"):
        await emit("coalition_detected", state["coalition_map"].model_dump())

    state = await verdict_synthesis_node(state)
    if state.get("verdict"):
        await emit("verdict_ready", state["verdict"].model_dump())

    state = await market_mapping_node(state)
    if state.get("market_implications"):
        await emit("market_mapped", state["market_implications"].model_dump())

    await emit("complete", None)

    return {
        "case": case.model_dump(),
        "justice_analyses": {k: v.model_dump() for k, v in state["justice_analyses"].items()},
        "coalition_map": state["coalition_map"].model_dump() if state.get("coalition_map") else None,
        "verdict": state["verdict"].model_dump() if state.get("verdict") else None,
        "market_implications": state["market_implications"].model_dump()
        if state.get("market_implications")
        else None,
    }
