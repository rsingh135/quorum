from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter

from models.api import CaseExposure, PortfolioScanRequest, PortfolioTickerResult
from services.cases import load_all_cases

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

IMPACT_SCORE = {"HIGH": 0.9, "MEDIUM": 0.5, "LOW": 0.2}


@router.post("/scan")
def scan_portfolio(body: PortfolioScanRequest) -> Dict[str, Any]:
    cases = load_all_cases()
    want = {t.strip().upper() for t in body.tickers if t.strip()}
    results: List[PortfolioTickerResult] = []

    for t in sorted(want):
        exposures: List[CaseExposure] = []
        for c in cases:
            tickers = [x.upper() for x in (c.get("tickers_at_risk") or [])]
            if t not in tickers:
                continue
            lvl = c.get("market_impact_level") or "LOW"
            exposures.append(
                CaseExposure(
                    docket=c["docket"],
                    name=c["name"],
                    market_impact_level=lvl,
                    risk_score=IMPACT_SCORE.get(lvl, 0.2),
                )
            )
        max_r = max((e.risk_score for e in exposures), default=0.0)
        portfolio_risk = min(100.0, max_r * 100.0 * (1.0 + 0.15 * max(0, len(exposures) - 1)))
        results.append(
            PortfolioTickerResult(ticker=t, cases=exposures, risk_score=round(portfolio_risk, 1))
        )

    overall = sum(r.risk_score for r in results) / max(1, len(results))
    return {
        "tickers": [r.model_dump() for r in results],
        "portfolio_scotus_risk": round(overall, 1),
    }
