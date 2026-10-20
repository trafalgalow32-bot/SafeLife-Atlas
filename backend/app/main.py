# main.py

import json
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.schemas.graph import DomainGraphResponse
from app.schemas.archive import ArchiveItem, ArchiveListResponse
from app.schemas.analytics import (
    DomainAnalyticsResponse,
    QuadrantSummary,
    RankedNode,
    GapNode,
)
from app.db import init_db, get_engine
from app.routers.admin import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # DB가 설정돼 있으면 테이블 생성, 없거나 불가하면 조용히 넘어가고 seed 폴백으로 동작
    init_db()
    yield


app = FastAPI(
    title="SafeLife-Atlas API",
    version="0.1.0",
    description="제3차 과학기술 기반 사회문제해결 R&D 데이터 API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # 공개 읽기전용 API(자격증명 미사용). 배포 시 allow_origins를 실제 프론트 도메인으로 제한 권장
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)

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


# --- 자료실: DB 우선 · seed JSON 폴백 (slice 1) ---
# 결정 로그 Appendix J: 공개 영속층은 커밋된 seed JSON(git). 관리자 쓰기는 Postgres.
# 무료 Postgres는 30일 만료/스핀다운 리스크가 있으므로, DB가 비었/만료/불가하면
# seed로 폴백해 공개 화면이 절대 하드 브레이크되지 않게 한다.

def _load_seed_archive() -> ArchiveListResponse:
    """커밋된 seed JSON 서빙 — git에 사는 영속층(만료·스핀다운·재배포에 안 깨짐)."""
    file_path = DATA_DIR / "archive.json"
    if not file_path.exists():
        return ArchiveListResponse(items=[])
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return ArchiveListResponse(items=data.get("items", []))


def _read_published_from_db():
    """published 자료만 DB에서 읽어 list[ArchiveItem] 반환.
    DB 미설정·연결불가·만료·테이블부재 등 어떤 사유든 실패하면 None → seed 폴백."""
    engine = get_engine()
    if engine is None:
        return None
    try:
        from sqlmodel import Session, select
        from app.models.archive import ArchiveRecord
        with Session(engine) as session:
            rows = session.exec(
                select(ArchiveRecord).where(ArchiveRecord.status == "published")
            ).all()
        return [
            ArchiveItem(
                title=r.title,
                field=r.field,
                license=r.license,
                org=r.org,
                date=r.date,
                url=r.url,
            )
            for r in rows
        ]
    except Exception:
        return None


@app.get("/api/v1/archive", response_model=ArchiveListResponse)
def get_archive():
    """자료실 공공자료 목록. DB에 published 자료가 있으면 그걸, 비었/만료/불가면 seed JSON 폴백."""
    items = _read_published_from_db()
    if items:  # DB 연결 + published 행 존재
        return ArchiveListResponse(items=items)
    return _load_seed_archive()  # DB None/빈/불가 → 영속 seed 폴백

@app.get("/api/v1/domains/{domain_id}/graph", response_model=DomainGraphResponse)
def get_domain_graph(domain_id: str):
    data = load_domain_data(domain_id)
    # 총 노드 수 갱신 및 최신 스키마 반환
    data["total_nodes"] = len(data.get("nodes", []))
    data["data_source_version"] = data.get("data_source_version", "2026-HYBRID")
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
    quadrant_dist: dict[str, QuadrantSummary] = {}
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
            trend_keyword=n.get("trend_keyword"),
            trend_weight=n.get("trend_weight"),
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
