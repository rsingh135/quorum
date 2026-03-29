from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

from models.schemas import CaseInput

DATA_ROOT = Path(__file__).resolve().parents[2] / "data"


@lru_cache(maxsize=1)
def _cases_dir() -> Path:
    return DATA_ROOT / "cases"


def load_all_cases() -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    d = _cases_dir()
    if not d.exists():
        return out
    for p in sorted(d.glob("*.json")):
        try:
            out.append(json.loads(p.read_text(encoding="utf-8")))
        except Exception:
            continue
    return out


def load_case_by_docket(docket: str) -> Optional[Dict[str, Any]]:
    p = _cases_dir() / f"{docket}.json"
    if not p.exists():
        return None
    return json.loads(p.read_text(encoding="utf-8"))


def case_to_input(case_dict: Dict[str, Any]) -> CaseInput:
    return CaseInput(**case_dict)
