from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..schemas.common import PyObjectId


class TaskList(BaseModel):
    title: str
    description: str
    plan_id: PyObjectId
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None