import secrets
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.config import settings

# In-memory reset token store: token → {"user_id": int, "expires": datetime}
_reset_tokens: dict = {}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_reset_token(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    _reset_tokens[token] = {
        "user_id": user_id,
        "expires": datetime.utcnow() + timedelta(hours=1),
    }
    return token


def verify_reset_token(token: str) -> int:
    entry = _reset_tokens.get(token)
    if not entry:
        raise HTTPException(status_code=400, detail="Gecersiz veya suresi dolmus sifirlama baglantisi")
    if datetime.utcnow() > entry["expires"]:
        del _reset_tokens[token]
        raise HTTPException(status_code=400, detail="Sifirlama baglantisinin suresi dolmus")
    return entry["user_id"]


def consume_reset_token(token: str) -> None:
    _reset_tokens.pop(token, None)


def verify_token(token: str) -> int:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return int(payload.get("sub"))
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gecersiz veya suresi dolmus token",
        )
