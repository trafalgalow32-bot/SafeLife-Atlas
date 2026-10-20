# models/archive.py — 자료실 DB 테이블 (slice 1)
#
# API 응답 DTO(app/schemas/archive.py의 ArchiveItem)와 분리된 "저장" 모델.
# 관리자 쓰기(slice 2~)의 대상이며, 공개 읽기는 status == "published" 행만 노출한다.

from typing import Optional
from sqlmodel import SQLModel, Field


class ArchiveRecord(SQLModel, table=True):
    __tablename__ = "archive_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    field: str
    license: str          # 공공누리 유형
    org: str              # 발행기관
    date: str             # 발행 시점 (YYYY.MM)
    url: Optional[str] = Field(default=None)   # 공공누리 원문 URL(재호스팅 X)
    # 공개 가시성 게이트. slice 1에선 published만 쓰지만, slice 3의
    # draft→review→published 워크플로를 위한 자리를 지금 확보해 둔다.
    status: str = Field(default="published", index=True)
