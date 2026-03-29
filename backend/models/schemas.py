from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional, Tuple

from pydantic import BaseModel, Field


Vote = Literal["AFFIRM", "REVERSE", "ABSTAINED"]
OpinionType = Literal["majority", "concurring", "dissenting"]


class CaseInput(BaseModel):
    docket: str
    name: str
    short_description: Optional[str] = None
    legal_question: str
    petitioner_argument_summary: Optional[str] = None
    respondent_argument_summary: Optional[str] = None
    lower_court_ruling: Optional[Literal["affirmed", "reversed"]] = None
    lower_court: Optional[str] = None
    oral_argument_date: Optional[str] = None
    sectors_affected: List[str] = Field(default_factory=list)
    tickers_at_risk: List[str] = Field(default_factory=list)
    market_impact_level: Optional[Literal["HIGH", "MEDIUM", "LOW"]] = None


class JusticeAnalysis(BaseModel):
    vote: Vote
    confidence: float = Field(ge=0.0, le=1.0)
    primary_reasoning: str
    key_concern: str
    analogous_cases: List[str] = Field(default_factory=list)
    uncertainty_factors: List[str] = Field(default_factory=list)
    likely_opinion_type: OpinionType
    raw: Optional[Dict[str, Any]] = None


class CoalitionMap(BaseModel):
    majority: List[str] = Field(default_factory=list)
    minority: List[str] = Field(default_factory=list)
    swing_justices: List[str] = Field(default_factory=list)
    predicted_margin: Literal["5-4", "6-3", "7-2", "unanimous", "unknown"] = "unknown"
    majority_author: Optional[str] = None


class VerdictSynthesis(BaseModel):
    outcome: Literal["AFFIRM", "REVERSE"]
    probability: float = Field(ge=0.0, le=1.0)
    confidence_interval: Tuple[float, float]
    vote_count: Dict[str, int]
    swing_justices: List[str] = Field(default_factory=list)
    majority_author: Optional[str] = None
    key_holding_prediction: str
    uncertainty_level: Literal["LOW", "MEDIUM", "HIGH"]


class MarketImplications(BaseModel):
    tickers: List[Dict[str, Any]] = Field(default_factory=list)
    sector_exposure: List[Dict[str, Any]] = Field(default_factory=list)
    historical_comparable: Optional[Dict[str, Any]] = None

