# routers/admin.py — 관리자 전용 자료실 쓰기 (slice 2)
#
# 공개 읽기(main.py /archive)와 분리된 보호 영역. 모든 쓰기는 require_admin(JWT) 통과 필요.
# 쓰기는 DB가 있어야 가능 → 엔진 없으면 503(읽기처럼 seed 폴백할 수 없음).

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.auth import verify_credentials, create_access_token, require_admin
from app.db import get_engine
from app.schemas.archive import ArchiveAdminItem, ArchiveCreate, ArchiveUpdate

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def _require_engine():
    engine = get_engine()
    if engine is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="DB가 설정되지 않아 쓰기를 처리할 수 없습니다. (DATABASE_URL 미설정)",
        )
    return engine


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    """단일 관리자 로그인 → JWT 발급. 공개 가입 없음."""
    if not verify_credentials(form.username, form.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(subject=form.username)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/archive", response_model=List[ArchiveAdminItem])
def admin_list_archive(_: str = Depends(require_admin)):
    """관리자 목록: draft 포함 전체 자료(공개 /archive는 published만)."""
    engine = _require_engine()
    from sqlmodel import Session, select
    from app.models.archive import ArchiveRecord
    with Session(engine) as session:
        return session.exec(select(ArchiveRecord)).all()


@router.post("/archive", response_model=ArchiveAdminItem, status_code=status.HTTP_201_CREATED)
def admin_create_archive(payload: ArchiveCreate, _: str = Depends(require_admin)):
    """자료 신규 등록. 기본 status=draft(검토→발행 워크플로)."""
    engine = _require_engine()
    from sqlmodel import Session
    from app.models.archive import ArchiveRecord
    row = ArchiveRecord(**payload.model_dump())
    with Session(engine) as session:
        session.add(row)
        session.commit()
        session.refresh(row)
    return row


@router.patch("/archive/{item_id}", response_model=ArchiveAdminItem)
def admin_update_archive(item_id: int, payload: ArchiveUpdate, _: str = Depends(require_admin)):
    """부분 수정 + 상태 전환(draft→published 등). 보낸 필드만 반영."""
    engine = _require_engine()
    from sqlmodel import Session
    from app.models.archive import ArchiveRecord
    with Session(engine) as session:
        row = session.get(ArchiveRecord, item_id)
        if row is None:
            raise HTTPException(status_code=404, detail="해당 자료를 찾을 수 없습니다.")
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(row, k, v)
        session.add(row)
        session.commit()
        session.refresh(row)
    return row


@router.delete("/archive/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_archive(item_id: int, _: str = Depends(require_admin)):
    engine = _require_engine()
    from sqlmodel import Session
    from app.models.archive import ArchiveRecord
    with Session(engine) as session:
        row = session.get(ArchiveRecord, item_id)
        if row is None:
            raise HTTPException(status_code=404, detail="해당 자료를 찾을 수 없습니다.")
        session.delete(row)
        session.commit()
    return None
