from motor.motor_asyncio import AsyncIOMotorClient
from ..core.config import settings

client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.mongo_db]
user_collection = db.get_collection("users")
plan_collection = db.get_collection("plans")
task_list_collection = db.get_collection("task_lists")
task_collection = db.get_collection("tasks") 