from fastapi import APIRouter , Query
from ..schemas.user import UserResponse, UserCreate, UserUpdate, UserPaginationResponse
from ..services.user import UserService
from typing import List

router = APIRouter(prefix="/api/v1/users" , tags = ["Users"])

@router.post("/" , response_model = UserResponse , status_code=201)
async def create_user(user:UserCreate):
    return await UserService.create(user)


@router.get("/" , response_model = UserPaginationResponse , name = "get all users")
async def find_all_users(limit: int = Query(10, ge=1, le=100),
                         skip: int = Query(0, ge=0),
                         search: str = "",
                         email: str = ""):
    return await UserService.find_all(limit=limit, skip=skip, search=search, email=email)


@router.get("/{user_id}", response_model=UserResponse, name="Get user by id")
async def find_user_by_id(user_id: str):
    return await UserService.find_by_id(user_id)


@router.patch("/{user_id}", response_model=UserResponse, name="Update user")
async def update_user(user_id: str, user: UserUpdate):
    return await UserService.update(user_id=user_id, data=user)


@router.delete("/{user_id}", name="Delete user")
async def delete_user(user_id: str):
    return await UserService.delete(user_id=user_id)