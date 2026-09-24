# main.py

import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.schemas.graph import DomainGraphResponse
from app.schemas.analytics import (
    DomainAnalyticsResponse,
    QuadrantSummary,
    RankedNode,
    GapNode,
)

app = FastAPI(
    title="SafeLife-Atlas API",
    version="0.1.0",
    description="제3차 과학기술 기반 사회문제해결 R&D 데이터 API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # 공개 읽기전용 API(자격증명 미사용). 배포 시 allow_origins를 실제 프론트 도메인으로 제한 권장
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).resolve().parent / "data"

def load_domain_data(domain_id: str) -> dict:
    file_path = DATA_DIR / f"{domain_id.replace('-', '_')}.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="도메인 데이터를 찾을 수 없습니다.")
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "project": "SafeLife-Atlas"}

@app.get("/api/v1/domains/{domain_id}/graph", response_model=DomainGraphResponse)
def get_domain_graph(domain_id: str):
    data = load_domain_data(domain_id)
    data["total_nodes"] = len(data.get("nodes", []))
    return data

@app.get("/api/v1/domains/{domain_id}/analytics", response_model=DomainAnalyticsResponse)
def get_domain_analytics(domain_id: str):
    data = load_domain_data(domain_id)
    nodes = data.get("nodes", [])
    
    if not nodes:
        raise HTTPException(status_code=400, detail="분석할 노드 데이터가 비어 있습니다.")

    total_nodes = len(nodes)
    causes = [n for n in nodes if n.get("node_type") == "CAUSE"]
    impacts = [n for n in nodes if n.get("node_type") == "IMPACT"]

    # 1. 평균 산출
    avg_urgency = round(sum(n["urgency_score"] for n in nodes) / total_nodes, 2)
    avg_tech = round(sum(n["tech_expectation_score"] for n in nodes) / total_nodes, 2)

    # 2. 사분면 분포 집계
    quadrant_dist: Dict[str, QuadrantSummary] = {}
    for n in nodes:
        q = n.get("quadrant", "BALANCED")
        if q not in quadrant_dist:
            quadrant_dist[q] = QuadrantSummary(count=0, node_ids=[])
        quadrant_dist[q].count += 1
        quadrant_dist[q].node_ids.append(n["id"])

    # 3. 상위 정렬 노드 추출 (Top 3)
    sorted_by_urgency = sorted(nodes, key=lambda x: x["urgency_score"], reverse=True)[:3]
    sorted_by_tech = sorted(nodes, key=lambda x: x["tech_expectation_score"], reverse=True)[:3]

    top_urgency = [RankedNode(id=n["id"], label=n["label"], score=n["urgency_score"]) for n in sorted_by_urgency]
    top_tech = [RankedNode(id=n["id"], label=n["label"], score=n["tech_expectation_score"]) for n in sorted_by_tech]

    # 4. 시급성 대비 과기해결 갭(Gap) 분석 (상위 3개)
    # Gap = 시급성 - 과기기대 (체감 문제는 크나 기술적 대안이 취약한 노드)
    gap_list = [
        GapNode(
            id=n["id"],
            label=n["label"],
            urgency_score=n["urgency_score"],
            tech_expectation_score=n["tech_expectation_score"],
            gap=round(n["urgency_score"] - n["tech_expectation_score"], 2),
        )
        for n in nodes
    ]
    sorted_gaps = sorted(gap_list, key=lambda x: x.gap, reverse=True)[:3]

    return DomainAnalyticsResponse(
        domain_id=domain_id,
        total_nodes=total_nodes,
        cause_count=len(causes),
        impact_count=len(impacts),
        avg_urgency=avg_urgency,
        avg_tech_expectation=avg_tech,
        quadrant_distribution=quadrant_dist,
        top_urgency_nodes=top_urgency,
        top_tech_nodes=top_tech,
        priority_gap_nodes=sorted_gaps,
    )