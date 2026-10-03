// graph.ts (타입 정의)

// frontend/src/types/graph.ts

export interface ReferenceChip {
  source_type: string;
  title: string;
}

export interface ProblemNodeData {
  id: string;
  label: string;
  node_type: 'CAUSE' | 'IMPACT';
  urgency_score: number;
  tech_expectation_score: number;
  quadrant: string;
  description: string;
  reference_chips: ReferenceChip[];
  
  // 2026-HYBRID 최신 데이터 매핑을 위한 확장 필드 (Optional)
  trend_keyword?: string;
  trend_weight?: number;
}

export interface ProblemEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface DomainGraphResponse {
  domain_id: string;
  domain_name: string;
  total_nodes: number;
  data_source_version?: string;
  nodes: ProblemNodeData[];
  edges: ProblemEdgeData[];
}