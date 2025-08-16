from fastapi import APIRouter, Query
from ..schemas.task import TaskResponse, TaskCreate, TaskUpdate, TaskPaginationResponse, TaskBulkUpdateRequest
from ..services.task import TaskService

router = APIRouter(prefix="/api/v1/plans", tags=["Tasks"])


@router.post("/{plan_id}/task-lists/{task_list_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(task: TaskCreate):
    return await TaskService.create(task)


@router.get("/{plan_id}/task-lists/{task_list_id}/tasks", response_model=TaskPaginationResponse, name="Get all tasks")
async def find_all_tasks(task_list_id: str, limit: int = Query(10, ge=1, le=100),
                         skip: int = Query(0, ge=0),
                         search: str = ""):
    return await TaskService.find_all(task_list_id=task_list_id, limit=limit, skip=skip, search=search)


@router.get("/{plan_id}/task-lists/{task_list_id}/tasks/{task_id}", response_model=TaskResponse, name="Get task by id")
async def find_task_by_id(task_id: str):
    return await TaskService.find_by_id(task_id=task_id)


@router.patch("/{plan_id}/task-lists/{task_list_id}/tasks/{task_id}", response_model=TaskResponse, name="Update the task")
async def update_task(task_id: str, data: TaskUpdate):
    return await TaskService.update(task_id=task_id, data=data)


@router.delete("/{plan_id}/task-lists/{task_list_id}/tasks/{task_id}", name="Delete the task")
async def delete_task(task_id: str):
    return await TaskService.delete(task_id=task_id)


@router.post("/{plan_id}/task-lists/bulk-sorting-update", name="Tasks bulk sorting")
async def bulk_update_tasks(data: TaskBulkUpdateRequest):
    return await TaskService.bulk_update(data)