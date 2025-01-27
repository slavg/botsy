from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    username = Column(String(128), unique=True, index=True)
    hashed_password = Column(String)


class Message(Base):
    __tablename__ = "messages"
    id = Column(String, primary_key=True)
    content = Column(String(2000), nullable=False)
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_bot = Column(Boolean, default=False)
