from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, constr


class MessageBase(BaseModel):
    content: constr(max_length=2000) = Field(
        description="Message content, max 2000 characters"
    )


class MessageCreate(MessageBase):
    pass


class MessageUpdate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime]
    is_bot: bool

    class Config:
        from_attributes = True
