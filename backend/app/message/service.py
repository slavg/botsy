import uuid

from fastapi import HTTPException
from sqlalchemy import desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models import Message


class MessageService:
    def __init__(self, db: AsyncSession, chat_bot):
        self.db = db
        self.chat_bot = chat_bot

    async def get_latest_user_message(
        self, user_id: str, message_id: str = None
    ) -> Message | None:
        query = (
            select(Message)
            .where(Message.user_id == user_id)
            .order_by(desc(Message.created_at))
            .limit(1)
        )
        result = await self.db.execute(query)
        latest_message = result.scalar_one_or_none()

        if not latest_message or (message_id and latest_message.id != message_id):
            raise HTTPException(
                status_code=403,
                detail=f"Can only modify your latest message: {message_id}",
            )

        return latest_message

    async def get_messages(self, user_id: str) -> list[Message]:
        query = (
            select(Message)
            .where(Message.user_id == user_id)
            .order_by(desc(Message.created_at))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_message(self, message, user_id: str) -> dict:
        user_message = Message(
            id=str(uuid.uuid4()), content=message.content, user_id=user_id, is_bot=False
        )
        self.db.add(user_message)
        await self.db.flush()

        try:
            bot_content = await self.chat_bot.generate_response(message.content)
        except Exception as e:
            # Rollback user message if bot fails
            await self.db.rollback()
            raise HTTPException(
                status_code=500, detail="Failed to generate bot response"
            ) from e

        bot_message = Message(
            id=str(uuid.uuid4()), content=bot_content, user_id="bot", is_bot=True
        )
        self.db.add(bot_message)

        await self.db.commit()
        await self.db.refresh(user_message)
        await self.db.refresh(bot_message)

        return {"user_message": user_message, "bot_message": bot_message}

    async def update_message(
        self, message_id: str, message_update, user_id: str
    ) -> Message:
        # Only latest user message can be modified
        message = await self.get_latest_user_message(user_id, message_id)
        message.content = message_update.content
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def delete_message(self, message_id: str, user_id: str):
        # Only latest user message can be deleted
        message = await self.get_latest_user_message(user_id, message_id)
        await self.db.delete(message)
        await self.db.commit()
        return {"ok": True}
