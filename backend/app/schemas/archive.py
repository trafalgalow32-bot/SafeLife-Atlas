# archive.py — 자료실(공공자료 목록) 스키마

from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ArchiveItem(BaseModel):
    title: str = Field(..., description="자료 제목")
    field: str = Field(..., description="분야")
    license: str = Field(..., description="공공누리 유형")
    org: str = Field(..., description="발행기관")
    date: str = Field(..., description="발행 시점 (YYYY.MM)")
    url: Optional[str] = Field(None, description="공공누리 원문 URL")


class ArchiveListResponse(BaseModel):
    items: List[ArchiveItem]


# --- 관리자(slice 2) 스키마 ---

class ArchiveAdminItem(BaseModel):
    """관리자 응답용 — 공개 ArchiveItem에 id·status 포함. ORM 객체 직렬화 위해 from_attributes."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    field: str
    license: str
    org: str
    date: str
    url: Optional[str] = None
    status: str


class ArchiveCreate(BaseModel):
    title: str
    field: str
    license: str
    org: str
    date: str
    url: Optional[str] = None
    status: str = "draft"  # 신규는 기본 draft → 검토 후 published 전환


class ArchiveUpdate(BaseModel):
    title: Optional[str] = None
    field: Optional[str] = None
    license: Optional[str] = None
    org: Optional[str] = None
    date: Optional[str] = None
    url: Optional[str] = None
    status: Optional[str] = None
