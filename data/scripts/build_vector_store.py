#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path
from typing import List

# Allow running from repo root without installing as a package
REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.services.vector_store import VectorStore, VectorStoreChunk  # type: ignore  # noqa: E402


def _iter_chunk_files(justice_dir: Path) -> List[Path]:
    opinions_dir = justice_dir / "opinions"
    if not opinions_dir.exists():
        return []
    return sorted([p for p in opinions_dir.glob("*.json") if p.is_file()])


def _load_chunks(file_path: Path) -> List[VectorStoreChunk]:
    payload = json.loads(file_path.read_text(encoding="utf-8"))
    justice_id = payload.get("justice_id", "unknown")
    case_name = payload.get("case_name")
    year = payload.get("year")
    vote_type = payload.get("vote_type")
    docket_number = payload.get("docket_number")

    chunks = []
    for ch in payload.get("chunks", []):
        idx = int(ch.get("chunk_index", 0))
        text = ch.get("text", "")
        chunk_id = f"{justice_id}:{file_path.stem}:{idx}"
        chunks.append(
            VectorStoreChunk(
                id=chunk_id,
                text=text,
                metadata={
                    "justice_id": justice_id,
                    "case_name": case_name,
                    "year": year,
                    "chunk_index": idx,
                    "vote_type": vote_type,
                    "docket_number": docket_number,
                    "text": text,  # convenient for retrieval display
                },
            )
        )
    return chunks


def main() -> None:
    ap = argparse.ArgumentParser(description="Build Pinecone vector store for Quorum justice corpus.")
    ap.add_argument("--justice", help="Justice id to process (optional).")
    ap.add_argument(
        "--data-root",
        default=str(Path(__file__).resolve().parents[1]),
        help="Path to data/ directory (defaults to repo data/).",
    )

    args = ap.parse_args()
    data_root = Path(args.data_root)
    justices_root = data_root / "justices"

    store = VectorStore()

    justice_ids = [args.justice] if args.justice else [p.name for p in justices_root.iterdir() if p.is_dir()]
    justice_ids = [j for j in justice_ids if j not in {"opinions"}]

    total_upserted = 0
    for justice_id in sorted(justice_ids):
        jdir = justices_root / justice_id
        files = _iter_chunk_files(jdir)
        chunks: List[VectorStoreChunk] = []
        for f in files:
            chunks.extend(_load_chunks(f))

        upserted = store.upsert_justice_corpus(justice_id, chunks)
        total_upserted += upserted
        print(f"{justice_id}: files={len(files)} chunks={len(chunks)} upserted={upserted}")

    print(f"TOTAL upserted: {total_upserted}")


if __name__ == "__main__":
    main()

