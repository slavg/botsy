from typing import List

from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.database import get_db
from app.message.bot import SimpleChatBot
from app.message.schemas import MessageCreate, MessageResponse, MessageUpdate
from app.message.service import MessageService

router = APIRouter()
chat_bot = SimpleChatBot()


@router.get("", response_model=List[MessageResponse])
async def get_messages(db=Depends(get_db), current_user=Depends(get_current_user)):
    service = MessageService(db, chat_bot)
    return await service.get_messages(current_user.id)


@router.post("", response_model=List[MessageResponse])
async def create_message(
    message: MessageCreate, db=Depends(get_db), current_user=Depends(get_current_user)
):
    service = MessageService(db, chat_bot)
    result = await service.create_message(message, current_user.id)
    return [result["user_message"], result["bot_message"]]


@router.put("/{message_id}", response_model=MessageResponse)
async def update_message(
    message_id: str,
    message: MessageUpdate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = MessageService(db, chat_bot)
    return await service.update_message(message_id, message, current_user.id)


@router.delete("/{message_id}")
async def delete_message(
    message_id: str, db=Depends(get_db), current_user=Depends(get_current_user)
):
    service = MessageService(db, chat_bot)
    return await service.delete_message(message_id, current_user.id)
