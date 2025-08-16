from pydantic import BaseModel, Field
from typing import Optional
from .common import PyObjectId
from datetime import datetime
from bson import ObjectId
from typing import List


class TaskCreate(BaseModel):
    title: str
    description: str
    task_list_id: str
    due_date: datetime
    priority: str
    status: str = "OPEN"



class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    task_list_id: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class TaskBulkUpdateItem(BaseModel):
    id: str
    task_list_id: str
    sort_number: int


class TaskBulkUpdateRequest(BaseModel):
    tasks: List[TaskBulkUpdateItem]


class TaskResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    title: str
    description: str
    task_list_id: PyObjectId = Field(alias="task_list_id")
    due_date: datetime
    sort_number: int
    priority: str
    status: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class TaskPaginationResponse(BaseModel):
    data: List[TaskResponse]
    count: int