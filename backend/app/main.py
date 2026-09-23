# main.py

import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.graph import DomainGraphResponse
from fastapi.responses import RedirectResponse

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

app = FastAPI(
    title="SafeLife-Atlas API",
    version="0.1.0",
    description="제3차 과학기술 기반 사회문제해결 R&D 데이터 API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).resolve().parent / "data"

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "project": "SafeLife-Atlas"}

@app.get("/api/v1/domains/{domain_id}/graph", response_model=DomainGraphResponse)
def get_domain_graph(domain_id: str):
    file_path = DATA_DIR / f"{domain_id.replace('-', '_')}.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="도메인 데이터를 찾을 수 없습니다.")
    
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    data["total_nodes"] = len(data.get("nodes", []))
    return data