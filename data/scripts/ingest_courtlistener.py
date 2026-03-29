#!/usr/bin/env python3
import argparse
import json
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

import requests

try:
    import tiktoken  # type: ignore

    _ENC = tiktoken.get_encoding("cl100k_base")
except Exception:
    _ENC = None


API_BASE = "https://www.courtlistener.com/api/rest/v4"


@dataclass(frozen=True)
class OpinionChunk:
    text: str
    chunk_index: int
    case_name: str
    year: Optional[int]
    vote_type: Optional[str]
    docket_number: Optional[str]
    topics: List[str]


def _safe_filename(s: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9._-]+", "_", s).strip("_")
    return s[:180] if len(s) > 180 else s


def _token_len(text: str) -> int:
    if _ENC is None:
        # TODO: REAL DATA - use a proper tokenizer consistently (tiktoken) across ingestion + retrieval.
        return max(1, len(text.split()))
    return len(_ENC.encode(text))


def chunk_text(text: str, chunk_tokens: int = 512, overlap_tokens: int = 128) -> List[str]:
    if not text.strip():
        return []

    if _ENC is None:
        # TODO: REAL DATA - fallback is word-based, approximate tokens.
        words = text.split()
        step = max(1, chunk_tokens - overlap_tokens)
        chunks = []
        for i in range(0, len(words), step):
            w = words[i : i + chunk_tokens]
            if not w:
                continue
            chunks.append(" ".join(w))
        return chunks

    ids = _ENC.encode(text)
    step = max(1, chunk_tokens - overlap_tokens)
    out: List[str] = []
    for start in range(0, len(ids), step):
        window = ids[start : start + chunk_tokens]
        if not window:
            continue
        out.append(_ENC.decode(window))
    return out


def _get(session: requests.Session, url: str, params: Dict[str, Any]) -> Dict[str, Any]:
    r = session.get(url, params=params, timeout=60)
    r.raise_for_status()
    return r.json()


def fetch_last_opinions_for_author(
    session: requests.Session, author_name: str, limit: int = 50
) -> List[Dict[str, Any]]:
    """
    CourtListener schema varies; for Phase 2 we do a best-effort search for SCOTUS opinions
    where the author string matches the Justice's last name. This is refined in later phases.
    """
    # NOTE: API endpoints and filters can evolve; this is intentionally robust to minor changes.
    # We use /opinions/ and query string search. See: https://www.courtlistener.com/api/rest/v4/
    url = f"{API_BASE}/opinions/"
    params = {
        "q": author_name,
        "page_size": min(100, limit),
        "order_by": "-date_filed",
    }
    data = _get(session, url, params)
    results = data.get("results", [])
    return results[:limit]


def extract_opinion_fields(op: Dict[str, Any]) -> Tuple[str, Optional[str], Optional[str], Optional[int], List[str]]:
    case_name = op.get("case_name") or op.get("caseName") or op.get("case") or "Unknown Case"
    docket_number = op.get("docket_number") or op.get("docket") or op.get("docketNumber")

    vote_type = op.get("type") or op.get("opinion_type") or op.get("opinionType")
    date_filed = op.get("date_filed") or op.get("dateFiled")
    year = None
    if isinstance(date_filed, str) and len(date_filed) >= 4:
        try:
            year = int(date_filed[:4])
        except Exception:
            year = None

    topics = op.get("topics") or op.get("topic_tags") or []
    if isinstance(topics, str):
        topics = [topics]
    if not isinstance(topics, list):
        topics = []
    topics = [str(t) for t in topics if t]

    text = op.get("plain_text") or op.get("html") or op.get("text") or ""
    if isinstance(text, str) and text.startswith("<"):
        # crude HTML strip for Phase 2
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text).strip()

    return text, case_name, docket_number, year, topics, vote_type


def load_justice_metadata(meta_path: Path) -> Dict[str, Dict[str, Any]]:
    data = json.loads(meta_path.read_text(encoding="utf-8"))
    return {j["id"]: j for j in data}


def ingest_for_justice(
    justice_id: str,
    justice_name: str,
    out_dir: Path,
    limit: int,
    chunk_tokens: int,
    overlap_tokens: int,
    sleep_s: float,
) -> Tuple[int, int]:
    out_dir.mkdir(parents=True, exist_ok=True)

    session = requests.Session()
    author_key = justice_name.split()[-1]  # last name
    opinions = fetch_last_opinions_for_author(session, author_key, limit=limit)

    opinion_count = 0
    chunk_count = 0

    for op in opinions:
        text, case_name, docket_number, year, topics, vote_type = extract_opinion_fields(op)
        if _token_len(text) < 100:
            continue

        chunks = chunk_text(text, chunk_tokens=chunk_tokens, overlap_tokens=overlap_tokens)
        if not chunks:
            continue

        opinion_count += 1
        chunk_count += len(chunks)

        slug = _safe_filename(f"{year or 'unknown'}_{case_name}_{docket_number or ''}".strip("_"))
        payload = {
            "justice_id": justice_id,
            "case_name": case_name,
            "year": year,
            "docket_number": docket_number,
            "vote_type": vote_type,
            "topics": topics,
            "chunk_tokens": chunk_tokens,
            "overlap_tokens": overlap_tokens,
            "chunks": [{"chunk_index": i, "text": c} for i, c in enumerate(chunks)],
            "source": "courtlistener",
        }

        (out_dir / f"{slug}.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
        time.sleep(sleep_s)

    return opinion_count, chunk_count


def main() -> None:
    ap = argparse.ArgumentParser(description="Ingest SCOTUS opinions from CourtListener by Justice.")
    ap.add_argument("--justice", help="Justice id (e.g., roberts). If omitted, ingests all.")
    ap.add_argument("--limit", type=int, default=50)
    ap.add_argument("--chunk-tokens", type=int, default=512)
    ap.add_argument("--overlap-tokens", type=int, default=128)
    ap.add_argument("--sleep", type=float, default=0.25, help="Sleep between requests (seconds).")
    ap.add_argument(
        "--data-root",
        default=str(Path(__file__).resolve().parents[1]),
        help="Path to data/ directory (defaults to repo data/).",
    )

    args = ap.parse_args()
    data_root = Path(args.data_root)
    meta_path = data_root / "justices" / "metadata.json"

    meta = load_justice_metadata(meta_path)
    targets: Iterable[Tuple[str, Dict[str, Any]]]
    if args.justice:
        if args.justice not in meta:
            raise SystemExit(f"Unknown justice id: {args.justice}")
        targets = [(args.justice, meta[args.justice])]
    else:
        targets = list(meta.items())

    print(f"Using tokenizer: {'tiktoken' if _ENC is not None else 'fallback'}")
    print(f"Data root: {data_root}")

    total_ops = 0
    total_chunks = 0

    for justice_id, jmeta in targets:
        out_dir = data_root / "justices" / justice_id / "opinions"
        ops, ch = ingest_for_justice(
            justice_id=justice_id,
            justice_name=jmeta["name"],
            out_dir=out_dir,
            limit=args.limit,
            chunk_tokens=args.chunk_tokens,
            overlap_tokens=args.overlap_tokens,
            sleep_s=args.sleep,
        )
        total_ops += ops
        total_chunks += ch
        print(f"{justice_id}: opinions={ops} chunks={ch} (written to {out_dir})")

    print(f"TOTAL: opinions={total_ops} chunks={total_chunks}")


if __name__ == "__main__":
    main()

