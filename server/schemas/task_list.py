from pydantic import BaseModel, Field
from typing import Optional
from .common import PyObjectId
from .task import TaskResponse
from datetime import datetime
from bson import ObjectId
from typing import List, Union


class TaskListCreate(BaseModel):
    title: str
    description: str
    plan_id: str


class TaskListUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    plan_id: Optional[str] = None


class TaskListResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    title: str
    description: str
    plan_id: PyObjectId = Field(alias="plan_id")
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class TaskListWithTasksResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    title: str
    description: str
    plan_id: PyObjectId = Field(alias="plan_id")
    tasks: Optional[List[TaskResponse]] = []
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class TaskListPaginationResponse(BaseModel):
    data: Union[List[TaskListResponse], List[TaskListWithTasksResponse]]
    count: int