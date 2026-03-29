#!/usr/bin/env python3
import sys
import asyncio
import json
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from agents.deliberation_graph import build_deliberation_graph  # noqa: E402
from models.schemas import CaseInput  # noqa: E402


async def main():
    data_root = Path(__file__).resolve().parents[2] / "data"
    case_path = data_root / "cases" / "24-1234.json"
    case = CaseInput(**json.loads(case_path.read_text(encoding="utf-8")))

    graph = build_deliberation_graph()
    state = {
        "case": case,
        "justice_analyses": {},
        "coalition_map": None,
        "verdict": None,
    }

    out = await graph.ainvoke(state)
    print("=== VERDICT ===")
    print(out["verdict"].model_dump_json(indent=2))
    print("=== COALITION ===")
    print(out["coalition_map"].model_dump_json(indent=2))
    print("=== MARKET ===")
    if out.get("market_implications") is not None:
        print(out["market_implications"].model_dump_json(indent=2))
    else:
        print("null")
    print("=== JUSTICES ===")
    for jid, analysis in out["justice_analyses"].items():
        print(jid, analysis.vote, f"{analysis.confidence:.2f}", "-", analysis.key_concern[:80])


if __name__ == "__main__":
    asyncio.run(main())

