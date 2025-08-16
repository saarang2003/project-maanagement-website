from fastapi import APIRouter, Query, HTTPException
from ..schemas.plan import PlanResponse, PlanCreate, PlanUpdate, PlanPaginationResponse, PlanResponseWithTaskLists
from ..services.plan import PlanService
from ..services.task_list import TaskListService
from typing import Union
from ..schemas.common import convert_object_ids, prepare_mongo_document


router = APIRouter(prefix="/api/v1/plans", tags=["Plans"])


@router.post("/", response_model=PlanResponse, status_code=201)
async def create_plan(plan: PlanCreate):
    return await PlanService.create(plan)


@router.get("/", response_model=PlanPaginationResponse, name="Get all plans")
async def find_all_plans(limit: int = Query(10, ge=1, le=100),
                         skip: int = Query(0, ge=0),
                         search: str = "", include_all: bool = False):
    plans = await PlanService.find_all(limit=limit, skip=skip, search=search)

    if include_all:
        plans_with_all = []
        for plan in plans["data"]:
            task_list_with_tasks = await TaskListService.find_all_with_tasks(plan_id=str(plan.id))
            plan_obj = plan.model_dump(by_alias=True)  # Convert to dict
            plan_obj["task_lists"] = task_list_with_tasks
            plans_with_all.append(plan_obj)
        return {
            "data": prepare_mongo_document(plans_with_all),
            "count": plans["count"]
        }
    else:
        return plans


@router.get("/{plan_id}", response_model=Union[PlanResponseWithTaskLists, PlanResponse], name="Get plan by id with task lists")
async def find_plan_by_id_with_task_lists(plan_id: str, include_all: bool = False):
    plan = await PlanService.find_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    if include_all:
        task_list_with_tasks = await TaskListService.find_all_with_tasks(plan_id=str(plan.id))
        plan_obj = plan.model_dump(by_alias=True)
        plan_obj["task_lists"] = task_list_with_tasks

        return PlanResponseWithTaskLists(**prepare_mongo_document(plan_obj))
    else:
        return plan


@router.patch("/{plan_id}", response_model=PlanResponse, name="Update plan")
async def update_plan(plan_id: str, plan: PlanUpdate):
    return await PlanService.update(plan_id=plan_id, data=plan)


@router.delete("/{plan_id}", name="Delete plan")
async def delete_plan(plan_id: str):
    return await PlanService.delete(plan_id=plan_id)