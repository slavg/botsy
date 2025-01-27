from pydantic import BaseModel, Field, constr


class UserBase(BaseModel):
    username: constr(min_length=4, max_length=128) = Field(
        description="Username between 4 and 128 characters"
    )


class UserCreate(UserBase):
    password: constr(min_length=8, max_length=128) = Field(
        description="Password between 8 and 128 characters"
    )


class UserResponse(UserBase):
    id: str

    class Config:
        from_attributes = True
