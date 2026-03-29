from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from agents.agent_factory import get_agent, load_justice_metadata_public
from models.api import JusticeQueryRequest

router = APIRouter(prefix="/justices", tags=["justices"])


@router.get("")
def list_justices() -> List[Dict[str, Any]]:
    meta = load_justice_metadata_public()
    out = []
    for jid, m in meta.items():
        out.append(
            {
                "id": jid,
                "name": m.get("name"),
                "title": m.get("title"),
                "year_appointed": m.get("year_appointed"),
                "philosophy": m.get("philosophy"),
                "interpretive_method": m.get("interpretive_method"),
            }
        )
    return sorted(out, key=lambda x: x["id"])


@router.post("/{justice_id}/query")
async def query_justice(justice_id: str, body: JusticeQueryRequest) -> Dict[str, Any]:
    meta = load_justice_metadata_public()
    if justice_id not in meta:
        raise HTTPException(status_code=404, detail="Unknown justice_id")
    agent = get_agent(justice_id)
    result = await agent.answer_question(body.question)
    return {"justice_id": justice_id, **result}
