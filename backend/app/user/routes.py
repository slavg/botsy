from fastapi import APIRouter, Depends

from app.database import get_db
from app.user.schemas import UserCreate, UserResponse
from app.user.service import UserService

router = APIRouter()


@router.post("", response_model=UserResponse)
async def create_user(user: UserCreate, db=Depends(get_db)):
    service = UserService(db)
    return await service.create_user(user)
