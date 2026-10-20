# auth.py — 단일 관리자 인증 (slice 2)
#
# 설계(결정 로그 Appendix J): 공개 회원가입 없음 — env에 박은 단일 관리자 자격 1개뿐.
# 로그인 성공 시 JWT 발급 → 보호된 쓰기 엔드포인트가 Bearer 토큰을 검증한다.
# 비번은 env 자체가 비밀 저장소이므로 bcrypt 해시 대신 상수시간 비교(타이밍 공격 차단)로 충분.

import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

ALGORITHM = "HS256"
TOKEN_TTL_HOURS = 8

# Swagger "Authorize" 버튼과 연동되는 OAuth2 password flow. tokenUrl = 로그인 엔드포인트.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/admin/login")

# JWT 서명 비밀: env 우선, 없으면 프로세스 1회 랜덤(재시작 시 토큰 무효 — 로컬·폴백용).
# 운영에선 JWT_SECRET을 고정해야 재배포/재시작에도 토큰이 유지된다.
_jwt_secret = os.environ.get("JWT_SECRET", "").strip() or secrets.token_urlsafe(32)


def verify_credentials(username: str, password: str) -> bool:
    """env의 단일 관리자 자격과 상수시간 비교. env 미설정이면 로그인 자체 불가(False)."""
    expected_user = os.environ.get("ADMIN_USERNAME", "")
    expected_pw = os.environ.get("ADMIN_PASSWORD", "")
    if not expected_user or not expected_pw:
        return False
    # 단락 평가로 인한 타이밍 누설을 막기 위해 둘 다 평가한 뒤 AND
    ok_user = secrets.compare_digest(username, expected_user)
    ok_pw = secrets.compare_digest(password, expected_pw)
    return ok_user and ok_pw


def create_access_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": subject, "iat": now, "exp": now + timedelta(hours=TOKEN_TTL_HOURS)}
    return jwt.encode(payload, _jwt_secret, algorithm=ALGORITHM)


def require_admin(token: str = Depends(oauth2_scheme)) -> str:
    """Bearer 토큰 검증. 유효하면 subject(username) 반환, 아니면 401."""
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증이 필요합니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, _jwt_secret, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise cred_exc
    sub = payload.get("sub")
    if not sub:
        raise cred_exc
    return sub
