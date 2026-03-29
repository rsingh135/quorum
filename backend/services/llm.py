from __future__ import annotations

import asyncio
import json
import os
from typing import Any, Dict, Optional

from anthropic import Anthropic


class Llm:
    def __init__(self) -> None:
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    async def complete_json(
        self,
        *,
        model: str,
        system: str,
        user: str,
        max_tokens: int = 1200,
        temperature: float = 0.2,
        retries: int = 3,
    ) -> Dict[str, Any]:
        delay = 0.6
        last_err: Optional[Exception] = None
        for _ in range(retries):
            try:
                text = await asyncio.to_thread(
                    lambda: self.client.messages.create(
                        model=model,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        system=system,
                        messages=[{"role": "user", "content": user}],
                    ).content[0].text
                )
                return _parse_json(text)
            except Exception as e:
                last_err = e
                await asyncio.sleep(delay)
                delay *= 2
        return {"error": "llm_failed", "detail": str(last_err) if last_err else "unknown"}


def _parse_json(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except Exception:
                pass
    return {"error": "invalid_json", "raw_text": text[:2000]}

