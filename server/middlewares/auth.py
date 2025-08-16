from fastapi import Header, HTTPException
from ..core.jwt import decode_token
from ..services.user import UserService

async def get_current_user(authorization : str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    token = authorization.split(" ")[1]
    payload = decode_token(token)
    user = await UserService.get_user_by_id(payload.get("user_id"))
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return user