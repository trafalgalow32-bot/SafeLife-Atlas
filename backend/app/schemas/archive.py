# archive.py — 자료실(공공자료 목록) 스키마

from typing import List, Optional
from pydantic import BaseModel, Field


class ArchiveItem(BaseModel):
    title: str = Field(..., description="자료 제목")
    field: str = Field(..., description="분야")
    license: str = Field(..., description="공공누리 유형")
    org: str = Field(..., description="발행기관")
    date: str = Field(..., description="발행 시점 (YYYY.MM)")
    url: Optional[str] = Field(None, description="공공누리 원문 URL")


class ArchiveListResponse(BaseModel):
    items: List[ArchiveItem]
