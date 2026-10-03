# analytics_service.py

from typing import List, Dict
from app.schemas.analytics import RankedNode, GapNode, QuadrantSummary, DomainAnalyticsResponse

class DomainAnalyticsEngine:
    def __init__(self, raw_nodes: List[dict]):
        self._nodes = raw_nodes

    def calculate_averages(self) -> tuple[float, float]:
        total = len(self._nodes)
        if total == 0:
            return 0.0, 0.0
        avg_urgency = round(sum(n.get("urgency_score", 0) for n in self._nodes) / total, 2)
        avg_tech = round(sum(n.get("tech_expectation_score", 0) for n in self._nodes) / total, 2)
        return avg_urgency, avg_tech

    def build_quadrant_distribution(self) -> Dict[str, QuadrantSummary]:
        dist: Dict[str, QuadrantSummary] = {}
        for n in self._nodes:
            q = n.get("quadrant", "BALANCED")
            if q not in dist:
                dist[q] = QuadrantSummary(count=0, node_ids=[])
            dist[q].count += 1
            dist[q].node_ids.append(n["id"])
        return dist

    def extract_priority_gaps(self, top_k: int = 3) -> List[GapNode]:
        gap_list = [
            GapNode(
                id=n["id"],
                label=n["label"],
                urgency_score=n.get("urgency_score", 0.0),
                tech_expectation_score=n.get("tech_expectation_score", 0.0),
                gap=round(n.get("urgency_score", 0.0) - n.get("tech_expectation_score", 0.0), 2),
                trend_keyword=n.get("trend_keyword"),
                trend_weight=n.get("trend_weight"),
            )
            for n in self._nodes
        ]
        return sorted(gap_list, key=lambda x: x.gap, reverse=True)[:top_k]

    def build_full_analytics(self, domain_id: str, version: str = "2026-HYBRID") -> DomainAnalyticsResponse:
        total = len(self._nodes)
        causes = [n for n in self._nodes if n.get("node_type") == "CAUSE"]
        impacts = [n for n in self._nodes if n.get("node_type") == "IMPACT"]
        avg_u, avg_t = self.calculate_averages()

        sorted_urgency = sorted(self._nodes, key=lambda x: x.get("urgency_score", 0), reverse=True)[:3]
        sorted_tech = sorted(self._nodes, key=lambda x: x.get("tech_expectation_score", 0), reverse=True)[:3]

        return DomainAnalyticsResponse(
            domain_id=domain_id,
            total_nodes=total,
            cause_count=len(causes),
            impact_count=len(impacts),
            avg_urgency=avg_u,
            avg_tech_expectation=avg_t,
            quadrant_distribution=self.build_quadrant_distribution(),
            top_urgency_nodes=[RankedNode(id=n["id"], label=n["label"], score=n["urgency_score"]) for n in sorted_urgency],
            top_tech_nodes=[RankedNode(id=n["id"], label=n["label"], score=n["tech_expectation_score"]) for n in sorted_tech],
            priority_gap_nodes=self.extract_priority_gaps(top_k=3),
            data_source_version=version,
        )