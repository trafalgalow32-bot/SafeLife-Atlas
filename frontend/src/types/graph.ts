// graph.ts (타입 정의)

export type NodeType = 'CAUSE' | 'IMPACT';
export type QuadrantType = 'TECH_DRIVEN' | 'POLICY_DRIVEN' | 'BALANCED' | 'LONG_TERM';

export interface ReferenceChip {
  title: string;
  source_type: string;
  link_or_meta?: string | null;
}

export interface ProblemNodeData {
  id: string;
  label: string;
  node_type: NodeType;
  urgency_score: number;
  tech_expectation_score: number;
  quadrant: QuadrantType;
  description: string;
  reference_chips: ReferenceChip[];
}

export interface ProblemEdgeData {
  source: string;
  target: string;
  relation_desc?: string;
}

export interface DomainGraphResponse {
  domain_id: string;
  domain_name: string;
  total_nodes: number;
  nodes: ProblemNodeData[];
  edges: ProblemEdgeData[];
}