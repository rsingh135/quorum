from __future__ import annotations

import asyncio
import json
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, Optional

from models.schemas import CaseInput


@dataclass
class AnalysisSession:
    session_id: str
    status: str = "pending"  # pending | running | complete | error
    error: Optional[str] = None
    case: Optional[CaseInput] = None
    result: Optional[Dict[str, Any]] = None
    queue: asyncio.Queue = field(default_factory=asyncio.Queue)


_sessions: Dict[str, AnalysisSession] = {}


def create_session(case: CaseInput) -> AnalysisSession:
    sid = str(uuid.uuid4())
    sess = AnalysisSession(session_id=sid, status="pending", case=case)
    _sessions[sid] = sess
    return sess


def get_session(session_id: str) -> Optional[AnalysisSession]:
    return _sessions.get(session_id)


def sse_line(event: str, data: Any) -> str:
    payload = {"event": event, "data": data}
    return f"data: {json.dumps(payload, default=str)}\n\n"
