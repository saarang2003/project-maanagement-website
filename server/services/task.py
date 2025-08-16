from ..db.db import task_collection
from ..schemas.task import TaskCreate, TaskResponse, TaskUpdate, TaskBulkUpdateRequest
from ..schemas.common import prepare_mongo_document
from ..models.task import Task
from fastapi import HTTPException
from datetime import datetime
from bson import ObjectId
from pymongo import UpdateOne


class TaskService:
    @staticmethod
    async def create(task : TaskCreate):
        last_task = await task_collection.find_one(
            {"task_list_id": ObjectId(task.task_list_id)},
            sort=[("sort_number", -1)]
        )
        
        next_sort_number = (last_task.get(
            "sort_number", 0) + 1) if last_task else 0


        task_data = Task(title=task.title, description=task.description, task_list_id=task.task_list_id, priority=task.priority, status=task.status, due_date=task.due_date, sort_number=next_sort_number,
                         created_at=datetime.utcnow(), updated_at=datetime.utcnow()).model_dump()
        result = await task_collection.insert_one(task_data)
        task_data["_id"] = result.inserted_id

        return TaskResponse(**prepare_mongo_document(task_data))
    

    @staticmethod
    async def find_all(task_list_id: str = None, limit: int = 10, skip: int = 0, search: str = ""):
        query = {}

        if task_list_id:
            try:
                task_list_obj_id = ObjectId(task_list_id)
            except Exception:
                raise HTTPException(
                    status_code=400, detail="Invalid task_list_id")
            query = {"task_list_id": task_list_obj_id}

        if search:
            query["title"] = {"$regex": search, "$options": "i"}

        total_count = await task_collection.count_documents(query)

        task_cursor = task_collection.find(query).skip(
            skip).limit(limit).sort("created_at", -1)

        tasks = [TaskResponse(**prepare_mongo_document(task)) async for task in task_cursor]

        return {"data": tasks, "count": total_count}


    
    @staticmethod
    async def find_by_id(task_id: str):
        task = await task_collection.find_one({"_id": ObjectId(task_id)})
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        return TaskResponse(**prepare_mongo_document(task))

    @staticmethod
    async def update(task_id: str, data: TaskUpdate):
        update_data = data.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        if update_data.get("task_list_id"):
            update_data["task_list_id"] = ObjectId(
                update_data.get("task_list_id"))

        result = await task_collection.update_one({"_id": ObjectId(task_id)}, {"$set": update_data})

        if result.modified_count == 0:
            raise HTTPException(
                status_code=404, detail="Task not found or no changes")
        return await TaskService.find_by_id(task_id)
    
    @staticmethod
    async def delete(task_id: str):
        result = await task_collection.delete_one({"_id": ObjectId(task_id)})
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404, detail="Task not found")

        return {"message": "Task deleted successfully"}

    @staticmethod
    async def bulk_update(data: TaskBulkUpdateRequest):
        bulk_ops = []

        for item in data.tasks:
            try:
                bulk_ops.append(
                    UpdateOne(
                        {"_id": ObjectId(item.id)},
                        {
                            "$set": {
                                "task_list_id": ObjectId(item.task_list_id),
                                "sort_number": item.sort_number,
                                "updated_at": datetime.utcnow(),
                            }
                        }
                    )
                )
            except Exception as e:
                raise HTTPException(
                    status_code=400, detail=f"Invalid ID format: {e}")

        if bulk_ops:
            result = await task_collection.bulk_write(bulk_ops)
            return {
                "matched": result.matched_count,
                "modified": result.modified_count,
            }

        return {"matched": 0, "modified": 0}