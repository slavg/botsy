import uuid
from typing import Dict

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

    async def get_bot_response_for_message(self, user_id: str) -> Message | None:
        query = (
            select(Message)
            .where(Message.user_id == user_id, Message.is_bot.is_(True))
            .order_by(desc(Message.created_at))
            .limit(1)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_messages(self, user_id: str) -> list[Message]:
        query = (
            select(Message)
            .where(Message.user_id == user_id)
            .order_by(desc(Message.created_at))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_message(self, message, user_id: str) -> Dict[str, Message]:
        user_message = Message(
            id=str(uuid.uuid4()), content=message.content, user_id=user_id, is_bot=False
        )
        self.db.add(user_message)
        await self.db.flush()

        try:
            bot_content = await self.chat_bot.generate_response(message.content)
        except Exception as e:
            print(f"Exception while generating response: {e}")
            await self.db.rollback()
            raise HTTPException(
                status_code=500, detail="Failed to generate bot response"
            ) from e

        bot_message = Message(
            id=str(uuid.uuid4()), content=bot_content, user_id=user_id, is_bot=True
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
        user_message = await self.get_latest_user_message(user_id, message_id)

        if not user_message:
            raise HTTPException(status_code=404, detail="Message not found")

        # Update user message
        user_message.content = message_update.content

        # Get the corresponding bot response
        bot_message = await self.get_bot_response_for_message(user_id)

        if bot_message:
            try:
                # Generate new bot response based on updated message
                new_bot_content = await self.chat_bot.generate_response(
                    message_update.content
                )
                bot_message.content = new_bot_content
            except Exception as e:
                print(f"Exception while updating bot response: {e}")
                await self.db.rollback()
                raise HTTPException(
                    status_code=500, detail="Failed to update bot response"
                ) from e

        await self.db.commit()
        await self.db.refresh(user_message)

        # Return the updated user message which will be converted to MessageResponse
        return user_message

    async def delete_message(self, message_id: str, user_id: str) -> dict:
        # Only latest user message can be deleted
        user_message = await self.get_latest_user_message(user_id, message_id)

        if not user_message:
            raise HTTPException(status_code=404, detail="Message not found")

        # Get the corresponding bot response
        bot_message = await self.get_bot_response_for_message(user_id)

        # Delete both messages
        await self.db.delete(user_message)
        if bot_message:
            await self.db.delete(bot_message)

        await self.db.commit()
        return {"ok": True}
