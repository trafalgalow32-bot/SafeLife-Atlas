# db.py — DB 엔진/초기화 계층 (slice 1)
#
# 설계 원칙(결정 로그 Appendix J): DB는 "우선"이되 절대 하드 디펜던시가 아니다.
# DATABASE_URL이 없거나(로컬·초기 배포), 무료 Postgres가 30일 만료/불가하면
# 엔진은 조용히 비활성화되고, 서빙은 커밋된 seed JSON으로 폴백한다.

import os
from typing import Optional

from sqlmodel import SQLModel, create_engine
from sqlalchemy.engine import Engine

_engine: Optional[Engine] = None
_resolved = False  # 엔진 해석을 1회만 시도


def _normalize_url(url: str) -> str:
    """Render가 주는 postgres:// · postgresql:// 를 psycopg v3 드라이버 형식으로 통일.

    SQLAlchemy 2.0의 기본 postgresql:// 는 psycopg2를 찾는다. 우리는 psycopg(v3)만
    설치하므로 명시적으로 postgresql+psycopg:// 로 바꿔야 드라이버를 못 찾는 오류를 막는다.
    """
    url = url.strip()
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://"):]
    return url  # sqlite:// 등 그 외 스킴은 그대로 (로컬 테스트용)


def get_engine() -> Optional[Engine]:
    """설정된 엔진을 반환. DATABASE_URL이 없거나 생성 실패면 None(→ seed 폴백)."""
    global _engine, _resolved
    if _resolved:
        return _engine
    _resolved = True
    raw = os.environ.get("DATABASE_URL", "").strip()
    if not raw:
        _engine = None
        return None
    try:
        # pool_pre_ping: 죽은 커넥션(만료·재시작)을 체크아웃 시점에 걸러 자동 재연결
        _engine = create_engine(_normalize_url(raw), pool_pre_ping=True)
    except Exception:
        _engine = None
    return _engine


def init_db() -> None:
    """엔진이 있으면 테이블 생성. 없거나 연결 불가하면 안전한 no-op(서빙은 seed 폴백)."""
    engine = get_engine()
    if engine is None:
        return
    try:
        # 모델을 임포트해야 SQLModel.metadata에 테이블이 등록된다
        from app.models.archive import ArchiveRecord  # noqa: F401
        SQLModel.metadata.create_all(engine)
    except Exception:
        # DB가 설정됐지만 도달 불가/만료 — 서빙은 seed로 폴백하므로 치명적 아님
        pass
