from __future__ import annotations

import asyncio
from typing import Any, AsyncIterator, Dict

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.api import AnalysisRunRequest
from models.schemas import CaseInput
from services.analysis_sessions import AnalysisSession, create_session, get_session, sse_line
from services.cases import load_case_by_docket
from services.deliberation_runner import run_deliberation_with_streaming

router = APIRouter(prefix="/analysis", tags=["analysis"])


def _case_from_request(body: AnalysisRunRequest) -> CaseInput:
    if body.docket_id:
        raw = load_case_by_docket(body.docket_id)
        if not raw:
            raise HTTPException(status_code=404, detail=f"Unknown docket: {body.docket_id}")
        return CaseInput(**raw)
    if body.case_text:
        return CaseInput(
            docket="CUSTOM",
            name="Custom matter",
            legal_question=body.case_text,
            short_description=body.case_text[:500],
        )
    raise HTTPException(status_code=400, detail="Provide docket_id or case_text")


async def _run_pipeline(session: AnalysisSession) -> None:
    session.status = "running"
    assert session.case is not None

    async def emit(event: str, data: Any) -> None:
        await session.queue.put(sse_line(event, data))

    try:
        result = await run_deliberation_with_streaming(session.case, emit)
        session.result = result
        session.status = "complete"
    except Exception as e:
        session.error = str(e)
        session.status = "error"
        await session.queue.put(sse_line("error", {"message": str(e)}))
        await session.queue.put(sse_line("complete", None))
    finally:
        await session.queue.put(None)


@router.post("/run")
async def start_analysis(body: AnalysisRunRequest) -> Dict[str, str]:
    case = _case_from_request(body)
    session = create_session(case)
    asyncio.create_task(_run_pipeline(session))
    return {"session_id": session.session_id}


@router.get("/stream/{session_id}")
async def stream_analysis(session_id: str) -> StreamingResponse:
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Unknown session")

    async def gen() -> AsyncIterator[bytes]:
        while True:
            item = await session.queue.get()
            if item is None:
                break
            yield item.encode("utf-8")

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/{session_id}")
def get_analysis(session_id: str) -> Dict[str, Any]:
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Unknown session")
    if session.status != "complete" or not session.result:
        return {
            "session_id": session_id,
            "status": session.status,
            "error": session.error,
            "result": None,
        }
    return {
        "session_id": session_id,
        "status": session.status,
        "result": session.result,
    }
