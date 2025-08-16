from ..db.db import task_list_collection, task_collection
from ..schemas.task_list import TaskListCreate, TaskListResponse, TaskListUpdate, TaskListWithTasksResponse
from ..schemas.common import prepare_mongo_document
from ..schemas.task import TaskResponse
from ..models.task_list import TaskList
from fastapi import HTTPException
from datetime import datetime
from bson import ObjectId


class TaskListService:
    @staticmethod
    async def create(task_list: TaskListCreate):
        task_list_data = TaskList(title=task_list.title, description=task_list.description, plan_id=task_list.plan_id,
                                  created_at=datetime.utcnow(), updated_at=datetime.utcnow()).model_dump()
        result = await task_list_collection.insert_one(task_list_data)
        task_list_data["_id"] = result.inserted_id

        return TaskListResponse(**prepare_mongo_document(task_list_data))

    @staticmethod
    async def find_all_with_pagination(plan_id: str = None, limit: int = 10, skip: int = 0, search: str = "", include_tasks: bool = False):
        query = {}

        if plan_id:
            try:
                plan_obj_id = ObjectId(plan_id)
            except Exception:
                raise HTTPException(
                    status_code=400, detail="Invalid plan_id")
            query = {"plan_id": plan_obj_id}

        if search:
            query["title"] = {"$regex": search, "$options": "i"}

        total_count = await task_list_collection.count_documents(query)

        task_list_cursor = task_list_collection.find(query).skip(
            skip).limit(limit).sort("created_at", -1)

        if include_tasks:
            task_lists_with_tasks = []
            async for task_list in task_list_cursor:
                task_list_dict = prepare_mongo_document(task_list)

                tasks_cursor = task_collection.find(
                    {"task_list_id": ObjectId(task_list_dict["_id"])})
                tasks = [TaskResponse(**prepare_mongo_document(task)) async for task in tasks_cursor]

                task_list_dict["tasks"] = tasks
                task_lists_with_tasks.append(
                    TaskListWithTasksResponse(**task_list_dict))

        else:
            task_lists = [TaskListResponse(**prepare_mongo_document(task_list)) async for task_list in task_list_cursor]

        return {"data":  task_lists_with_tasks if include_tasks else task_lists, "count": total_count}

    @staticmethod
    async def find_all_with_tasks(plan_id: str = None):
        query = {}

        if plan_id:
            try:
                plan_obj_id = ObjectId(plan_id)
            except Exception:
                raise HTTPException(
                    status_code=400, detail="Invalid plan_id")
            query = {"plan_id": plan_obj_id}

        task_list_cursor = task_list_collection.find(
            query)

        task_lists_with_tasks = []
        async for task_list in task_list_cursor:
            task_list_dict = prepare_mongo_document(task_list)

            tasks_cursor = task_collection.find(
                {"task_list_id": ObjectId(task_list_dict["_id"])})
            tasks = [TaskResponse(**prepare_mongo_document(task)) async for task in tasks_cursor]

            task_list_dict["tasks"] = tasks
            task_lists_with_tasks.append(
                TaskListWithTasksResponse(**task_list_dict))

        return task_lists_with_tasks

    @staticmethod
    async def find_by_id(task_list_id: str):
        task_list = await task_list_collection.find_one({"_id": ObjectId(task_list_id)})
        if not task_list:
            raise HTTPException(status_code=404, detail="Task list not found")

        return TaskListResponse(**prepare_mongo_document(task_list))

    @staticmethod
    async def update(task_list_id: str, data: TaskListUpdate):
        update_data = data.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()

        if data.plan_id:
            update_data["plan_id"] = ObjectId(update_data["plan_id"])

        result = await task_list_collection.update_one({"_id": ObjectId(task_list_id)}, {"$set": update_data})

        if result.modified_count == 0:
            raise HTTPException(
                status_code=404, detail="Task list not found or no changes")
        return await TaskListService.find_by_id(task_list_id)

    @staticmethod
    async def delete(task_list_id: str):
        result = await task_list_collection.delete_one({"_id": ObjectId(task_list_id)})
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404, detail="Task list not found")
        await task_collection.delete_many({"task_list_id": ObjectId(task_list_id)})

        return {"message": "Task list deleted successfully"}