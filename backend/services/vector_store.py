from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class VectorStoreChunk:
    id: str
    text: str
    metadata: Dict[str, Any]


class VectorStore:
    """
    Phase 2: Pinecone-backed vector store with a safe fallback.

    If Pinecone credentials are missing, this runs in stub mode so the pipeline
    can still work end-to-end.
    """

    def __init__(self) -> None:
        self.index_name = os.getenv("PINECONE_INDEX", "scotus-alpha")
        self.api_key = os.getenv("PINECONE_API_KEY")

        self._pc = None
        self._index = None
        self._embedder = None

        if self.api_key:
            try:
                # TODO: REAL DATA - wire Pinecone + embedder in production.
                from pinecone import Pinecone  # type: ignore
                from sentence_transformers import SentenceTransformer  # type: ignore

                self._pc = Pinecone(api_key=self.api_key)
                self._index = self._pc.Index(self.index_name)
                self._embedder = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception:
                # Fallback to stub mode
                self._pc = None
                self._index = None
                self._embedder = None

    def _is_live(self) -> bool:
        return self._index is not None and self._embedder is not None

    def upsert_justice_corpus(self, justice_id: str, chunks: List[VectorStoreChunk]) -> int:
        if not chunks:
            return 0

        if not self._is_live():
            # TODO: REAL DATA - upsert to Pinecone.
            return len(chunks)

        vectors = []
        texts = [c.text for c in chunks]
        embeddings = self._embedder.encode(texts, normalize_embeddings=True).tolist()
        for c, emb in zip(chunks, embeddings):
            meta = dict(c.metadata)
            meta["justice_id"] = justice_id
            vectors.append({"id": c.id, "values": emb, "metadata": meta})

        self._index.upsert(vectors=vectors, namespace=justice_id)
        return len(vectors)

    def query_justice(self, justice_id: str, query_text: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if not self._is_live():
            # TODO: REAL DATA - query Pinecone filtered by namespace.
            return [
                {
                    "text": f"[stub precedent] {justice_id} would cite prior reasoning relevant to: {query_text[:120]}",
                    "score": 0.0,
                    "metadata": {"justice_id": justice_id},
                }
            ][:top_k]

        q = self._embedder.encode([query_text], normalize_embeddings=True).tolist()[0]
        res = self._index.query(vector=q, top_k=top_k, include_metadata=True, namespace=justice_id)
        matches = getattr(res, "matches", []) or res.get("matches", [])
        out: List[Dict[str, Any]] = []
        for m in matches:
            meta = getattr(m, "metadata", None) or m.get("metadata", {})  # type: ignore[union-attr]
            out.append({"text": meta.get("text", ""), "score": getattr(m, "score", 0.0), "metadata": meta})
        return out

    def query_all_justices(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self._is_live():
            # TODO: REAL DATA - query across namespaces.
            return [
                {"text": f"[stub precedent] cross-justice retrieval for: {query_text[:120]}", "score": 0.0, "metadata": {}}
            ][:top_k]

        q = self._embedder.encode([query_text], normalize_embeddings=True).tolist()[0]

        # Pinecone does not truly query "all namespaces" in one call; we do a
        # best-effort list-based approach when live.
        # TODO: REAL DATA - maintain a global namespace or multiplex calls.
        namespaces = os.getenv("JUSTICE_NAMESPACES", "").split(",")
        namespaces = [n.strip() for n in namespaces if n.strip()]
        if not namespaces:
            return []

        merged: List[Dict[str, Any]] = []
        for ns in namespaces:
            res = self._index.query(vector=q, top_k=top_k, include_metadata=True, namespace=ns)
            matches = getattr(res, "matches", []) or res.get("matches", [])
            for m in matches:
                meta = getattr(m, "metadata", None) or m.get("metadata", {})  # type: ignore[union-attr]
                merged.append(
                    {"text": meta.get("text", ""), "score": getattr(m, "score", 0.0), "metadata": meta}
                )

        merged.sort(key=lambda x: float(x.get("score") or 0.0), reverse=True)
        return merged[:top_k]

