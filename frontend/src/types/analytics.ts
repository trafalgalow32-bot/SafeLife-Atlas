// analytics.ts

export interface RankedNode {
  id: string;
  label: string;
  score: number;
}

export interface GapNode {
  id: string;
  label: string;
  urgency_score: number;
  tech_expectation_score: number;
  gap: number;
  trend_keyword?: string;
  trend_weight?: number;
}

export interface QuadrantSummary {
  count: number;
  node_ids: string[];
}

export interface DomainAnalyticsResponse {
  domain_id: string;
  total_nodes: number;
  cause_count: number;
  impact_count: number;
  avg_urgency: number;
  avg_tech_expectation: number;
  quadrant_distribution: Record<string, QuadrantSummary>;
  top_urgency_nodes: RankedNode[];
  top_tech_nodes: RankedNode[];
  priority_gap_nodes: GapNode[];
}