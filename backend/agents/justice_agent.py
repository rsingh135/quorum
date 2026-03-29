from __future__ import annotations

import asyncio
import json
import os
from typing import Any, Dict, List, Optional

from anthropic import Anthropic

from models.schemas import CaseInput, JusticeAnalysis
from services.vector_store import VectorStore


class JusticeAgent:
    def __init__(self, justice_id: str, metadata: Dict[str, Any], vector_store: VectorStore):
        self.justice_id = justice_id
        self.metadata = metadata
        self.vector_store = vector_store
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model = os.getenv("ANTHROPIC_JUSTICE_MODEL", "claude-haiku-4-5")

    async def analyze_case(self, case: CaseInput) -> JusticeAnalysis:
        precedents = self.vector_store.query_justice(self.justice_id, case.legal_question, top_k=5)
        system_prompt = self._build_persona_prompt([p.get("text", "") for p in precedents])

        user_content = {
            "docket": case.docket,
            "name": case.name,
            "legal_question": case.legal_question,
            "short_description": case.short_description,
            "petitioner_argument_summary": case.petitioner_argument_summary,
            "respondent_argument_summary": case.respondent_argument_summary,
            "lower_court": case.lower_court,
            "lower_court_ruling": case.lower_court_ruling,
            "oral_argument_date": case.oral_argument_date,
        }

        raw_text = await self._call_with_retries(system_prompt, json.dumps(user_content, ensure_ascii=False), retries=3)
        parsed = self._parse_json(raw_text)

        return JusticeAnalysis(
            vote=parsed.get("vote", "ABSTAINED"),
            confidence=float(parsed.get("confidence", 0.0)),
            primary_reasoning=str(parsed.get("primary_reasoning", ""))[:2000],
            key_concern=str(parsed.get("key_concern", ""))[:400],
            analogous_cases=[str(x) for x in (parsed.get("analogous_cases") or [])][:6],
            uncertainty_factors=[str(x) for x in (parsed.get("uncertainty_factors") or [])][:8],
            likely_opinion_type=parsed.get("likely_opinion_type", "concurring"),
            raw=parsed,
        )

    def _build_persona_prompt(self, precedents: List[str]) -> str:
        return f"""
You are Justice {self.metadata['name']} of the United States Supreme Court.

JUDICIAL PHILOSOPHY:
{self.metadata['persona_description']}

Interpretive method: {self.metadata['interpretive_method']}
Deference to precedent: {self.metadata['deference_to_precedent']}
Key doctrinal commitments: {', '.join(self.metadata['key_doctrinal_commitments'])}

RELEVANT PRECEDENTS FROM YOUR PRIOR OPINIONS:
{self._format_precedents(precedents)}

TASK:
Analyze the case presented and provide your judicial assessment. You must respond
in valid JSON with this exact structure:
{{
  "vote": "AFFIRM" | "REVERSE",
  "confidence": <float 0.0-1.0>,
  "primary_reasoning": "<2-3 sentences in your voice explaining your vote>",
  "key_concern": "<single most important legal question for you>",
  "analogous_cases": ["<case name you'd cite>"],
  "uncertainty_factors": ["<what could change your vote>"],
  "likely_opinion_type": "majority" | "concurring" | "dissenting"
}}

Respond ONLY with valid JSON. No preamble. No explanation outside the JSON.
""".strip()

    def _format_precedents(self, precedents: List[str]) -> str:
        cleaned = [p.strip() for p in precedents if p and p.strip()]
        if not cleaned:
            return "(none available — proceed using your persona and general doctrine)"
        bullets = "\n".join([f"- {p[:380]}" for p in cleaned[:5]])
        return bullets

    async def _call_with_retries(self, system_prompt: str, user_text: str, retries: int = 3) -> str:
        delay = 0.6
        last_err: Optional[Exception] = None
        for _ in range(retries):
            try:
                # Anthropic SDK is sync; run in thread for asyncio compatibility.
                return await asyncio.to_thread(
                    lambda: self.client.messages.create(
                        model=self.model,
                        max_tokens=800,
                        temperature=0.4,
                        system=system_prompt,
                        messages=[{"role": "user", "content": user_text}],
                    ).content[0].text
                )
            except Exception as e:
                last_err = e
                await asyncio.sleep(delay)
                delay *= 2
        return json.dumps(
            {
                "vote": "ABSTAINED",
                "confidence": 0.0,
                "primary_reasoning": "Unable to complete analysis due to an upstream model error.",
                "key_concern": "N/A",
                "analogous_cases": [],
                "uncertainty_factors": [str(last_err) if last_err else "unknown error"],
                "likely_opinion_type": "concurring",
            }
        )

    def _parse_json(self, text: str) -> Dict[str, Any]:
        try:
            return json.loads(text)
        except Exception:
            # Best-effort: extract first {...} block
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    return json.loads(text[start : end + 1])
                except Exception:
                    pass
        return {
            "vote": "ABSTAINED",
            "confidence": 0.0,
            "primary_reasoning": "Model did not return valid JSON.",
            "key_concern": "N/A",
            "analogous_cases": [],
            "uncertainty_factors": ["invalid_json"],
            "likely_opinion_type": "concurring",
        }

    async def answer_question(self, question: str) -> Dict[str, Any]:
        precedents = self.vector_store.query_justice(self.justice_id, question, top_k=5)
        cites = [p.get("text", "")[:300] for p in precedents if p.get("text")]
        system = f"""You are Justice {self.metadata['name']}. Answer briefly in your judicial voice.
Persona: {self.metadata['persona_description']}
Return ONLY JSON: {{"answer": "<string>", "cited_opinion_snippets": ["<short>"]}}"""
        user = json.dumps({"question": question, "retrieved_snippets": cites}, ensure_ascii=False)
        raw = await self._call_with_retries(system, user, retries=3)
        try:
            return json.loads(raw)
        except Exception:
            return {"answer": raw[:2000], "cited_opinion_snippets": cites[:3]}

