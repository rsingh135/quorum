from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Dict, List

from agents.justice_agent import JusticeAgent
from services.vector_store import VectorStore


DATA_ROOT = Path(__file__).resolve().parents[2] / "data"


@lru_cache(maxsize=1)
def _load_metadata() -> Dict[str, dict]:
    meta_path = DATA_ROOT / "justices" / "metadata.json"
    data = json.loads(meta_path.read_text(encoding="utf-8"))
    return {j["id"]: j for j in data}


@lru_cache(maxsize=1)
def _vector_store() -> VectorStore:
    return VectorStore()


@lru_cache(maxsize=1)
def _agents() -> Dict[str, JusticeAgent]:
    meta = _load_metadata()
    vs = _vector_store()
    return {jid: JusticeAgent(jid, m, vs) for jid, m in meta.items()}


def get_agent(justice_id: str) -> JusticeAgent:
    return _agents()[justice_id]


def get_all_agents() -> List[JusticeAgent]:
    return list(_agents().values())


def load_justice_metadata_public() -> Dict[str, dict]:
    """Public read-only justice metadata (no corpus)."""
    return _load_metadata()

