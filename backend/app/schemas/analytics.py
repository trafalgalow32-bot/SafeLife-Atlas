# analytics.py

from typing import Dict, List, Union
from pydantic import BaseModel, Field

class QuadrantSummary(BaseModel):
    count: int
    node_ids: List[str]

class RankedNode(BaseModel):
    id: str
    label: str
    score: float

class GapNode(BaseModel):
    id: str
    label: str
    urgency_score: float
    tech_expectation_score: float
    gap: float = Field(..., description="시급성 - 과기기대 (양수면 제도대응 우선, 음수면 기술선행)")

class DomainAnalyticsResponse(BaseModel):
    domain_id: str
    total_nodes: int
    cause_count: int
    impact_count: int
    avg_urgency: float
    avg_tech_expectation: float
    quadrant_distribution: Dict[str, QuadrantSummary]
    top_urgency_nodes: List[RankedNode]
    top_tech_nodes: List[RankedNode]
    priority_gap_nodes: List[GapNode]