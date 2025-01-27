import asyncio
import uuid

from app.auth import get_password_hash
from app.database import get_db, init_db
from app.models import User


async def seed_db():
    await init_db()

    async for db in get_db():
        users = [
            User(
                id=str(uuid.uuid4()),
                username="user1",
                hashed_password=get_password_hash("password_1"),
            ),
            User(
                id=str(uuid.uuid4()),
                username="user2",
                hashed_password=get_password_hash("password_2"),
            ),
        ]

        for user in users:
            db.add(user)

        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed_db())
