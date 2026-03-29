from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class CaseSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)


class AnalysisRunRequest(BaseModel):
    docket_id: Optional[str] = None
    case_text: Optional[str] = None


class JusticeQueryRequest(BaseModel):
    question: str = Field(..., min_length=1)


class PortfolioScanRequest(BaseModel):
    tickers: List[str] = Field(..., min_length=1)


class CaseExposure(BaseModel):
    docket: str
    name: str
    market_impact_level: Optional[str] = None
    risk_score: float = Field(ge=0.0, le=1.0)


class PortfolioTickerResult(BaseModel):
    ticker: str
    cases: List[CaseExposure]
    risk_score: float = Field(ge=0.0, le=100.0)
