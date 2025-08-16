from fastapi import APIRouter, Query
from ..schemas.task_list import TaskListResponse, TaskListCreate, TaskListUpdate, TaskListPaginationResponse
from ..services.task_list import TaskListService

router = APIRouter(prefix="/api/v1/plans", tags=["Task Lists"])


@router.post("/{plan_id}/task-lists", response_model=TaskListResponse, status_code=201)
async def create_task_list(task_list: TaskListCreate):
    return await TaskListService.create(task_list)


@router.get("/{plan_id}/task-lists", response_model=TaskListPaginationResponse, name="Get all task lists")
async def find_all_task_lists(plan_id: str = None,  limit: int = Query(10, ge=1, le=100),
                              skip: int = Query(0, ge=0),
                              search: str = "", include_tasks: bool = False):
    return await TaskListService.find_all_with_pagination(plan_id, limit=limit, skip=skip, search=search, include_tasks=include_tasks)


@router.get("/{plan_id}/task-lists/{task_list_id}", response_model=TaskListResponse, name="Get task list by id")
async def find_task_list_by_id(plan_id: str, task_list_id: str):
    return await TaskListService.find_by_id(task_list_id)


@router.patch("/{plan_id}/task-lists/{task_list_id}", response_model=TaskListResponse, name="Update task list")
async def update_task_list(task_list_id: str, task_list: TaskListUpdate):
    return await TaskListService.update(task_list_id=task_list_id, data=task_list)


@router.delete("/{plan_id}/task-lists/{task_list_id}", name="Delete task list")
async def delete_task_list(task_list_id: str):
    return await TaskListService.delete(task_list_id=task_list_id)