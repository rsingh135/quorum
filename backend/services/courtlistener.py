from __future__ import annotations

from typing import Any, Dict, List

import requests

API_BASE = "https://www.courtlistener.com/api/rest/v4"


def search_scotus_cases(query: str, page_size: int = 20) -> List[Dict[str, Any]]:
    """
    Free-text search against CourtListener (best-effort; schema may vary).
    """
    url = f"{API_BASE}/search/"
    params = {
        "q": query,
        "type": "o",
        "court": "scotus",
        "page_size": min(page_size, 100),
    }
    r = requests.get(url, params=params, timeout=60)
    r.raise_for_status()
    data = r.json()
    results = data.get("results") or []
    normalized: List[Dict[str, Any]] = []
    for item in results:
        normalized.append(
            {
                "case_name": item.get("caseName") or item.get("case_name"),
                "docket": item.get("docket_number") or item.get("docket"),
                "date_filed": item.get("dateFiled") or item.get("date_filed"),
                "absolute_url": item.get("absolute_url"),
                "snippet": item.get("snippet"),
            }
        )
    return normalized
