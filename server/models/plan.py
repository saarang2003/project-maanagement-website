from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..schemas.common import PyObjectId


class Plan(BaseModel):
    title: str
    description: str
    user_id: PyObjectId
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None