
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..schemas.common import PyObjectId


class Task(BaseModel):
    title: str
    description: str
    task_list_id: PyObjectId
    due_date: datetime
    sort_number: int
    priority: str  # TODO avoid magic string here -> LOW, MEDIUM, HIGH
    status: str  # TODO avoid magic string here -> OPEN, CLOSE
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
