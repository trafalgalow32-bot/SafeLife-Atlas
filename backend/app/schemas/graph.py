# graph.py

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class NodeType(str, Enum):
    CAUSE = "CAUSE"      # 발생 원인
    IMPACT = "IMPACT"    # 파급 영향

class QuadrantType(str, Enum):
    TECH_DRIVEN = "TECH_DRIVEN"      # 과학기술 집중 해결 영역
    POLICY_DRIVEN = "POLICY_DRIVEN"  # 제도 및 사회적 대응 영역
    BALANCED = "BALANCED"            # 복합 대응 영역
    LONG_TERM = "LONG_TERM"          # 장기 과제 영역

class ReferenceChip(BaseModel):
    title: str = Field(..., description="성과/브리프 제목")
    source_type: str = Field(..., description="우수성과30선 / 동향브리프 / 지역의제")
    link_or_meta: Optional[str] = None

class ProblemNode(BaseModel):
    id: str = Field(..., description="노드 고유 ID (C01, E01 등)")
    label: str = Field(..., description="세부문제명")
    node_type: NodeType
    urgency_score: float = Field(..., description="시급성 점수 (100점 만점)")
    tech_expectation_score: float = Field(..., description="과기해결 기대 점수 (100점 만점)")
    quadrant: QuadrantType
    description: str = Field(..., description="세부문제 정의 및 상세 설명")
    reference_chips: List[ReferenceChip] = Field(default_factory=list)

class ProblemEdge(BaseModel):
    source: str = Field(..., description="원인 노드 ID")
    target: str = Field(..., description="영향 노드 ID")
    relation_desc: Optional[str] = "야기함/영향을 미침"

class DomainGraphResponse(BaseModel):
    domain_id: str
    domain_name: str
    total_nodes: int
    nodes: List[ProblemNode]
    edges: List[ProblemEdge]