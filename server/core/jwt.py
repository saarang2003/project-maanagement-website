import jwt 
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone
from ..core.config import settings

def create_access_token(data : dict) -> str:
    """Create a JWT access token with an expiration time.
     data : dict -> JWT payload
    """
    to_encode = data.copy()   # copy access token payload
    expire = datetime.now(timezone.utc) + \
        timedelta(minutes=int(settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})  # Add exp field to the payload
    encoded_jwt = jwt.encode(
        to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def decode_token(token : str):
    """Decode a JWT token and return the payload."""
    try:
        return jwt.decode(jwt=token, key=settings.secret_key, algorithms=[settings.algorithm])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token",
                            headers={"WWW-Authenticate": "Bearer"},)