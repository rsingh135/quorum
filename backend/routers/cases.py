from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from models.api import CaseSearchRequest
from services.cases import load_all_cases, load_case_by_docket
from services.courtlistener import search_scotus_cases

router = APIRouter(prefix="/cases", tags=["cases"])


@router.get("")
def list_cases() -> List[Dict[str, Any]]:
    cases = load_all_cases()
    out = []
    for c in cases:
        out.append(
            {
                "docket": c.get("docket"),
                "name": c.get("name"),
                "oral_argument_date": c.get("oral_argument_date"),
                "market_impact_level": c.get("market_impact_level"),
                "sectors_affected": c.get("sectors_affected", []),
                "tickers_at_risk": c.get("tickers_at_risk", []),
            }
        )
    return out


@router.get("/{docket_id}")
def get_case(docket_id: str) -> Dict[str, Any]:
    c = load_case_by_docket(docket_id)
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")
    return c


@router.post("/search")
def search_cases(body: CaseSearchRequest) -> Dict[str, Any]:
    try:
        results = search_scotus_cases(body.query)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"CourtListener error: {e}") from e
    return {"query": body.query, "results": results}
