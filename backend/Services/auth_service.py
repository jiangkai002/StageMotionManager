import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

load_dotenv()

# 与 C# 端 Encoding.ASCII.GetBytes(SECRET) 完全一致
SECRET_KEY = os.getenv("SECRET", "").encode("ascii")
ALGORITHM = "HS256"

# HTTP Bearer 方案，请求头格式: Authorization: Bearer <token>
bearer_scheme = HTTPBearer()


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效或过期的 Token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # 不验证 issuer / audience，只验证签名和过期时间
        payload: dict = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except JWTError:
        raise credentials_exception

    return payload


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except JWTError:
        return None
