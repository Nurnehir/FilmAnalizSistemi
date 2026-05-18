from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class UpdateUsernameRequest(BaseModel):
    username: str


class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class AvatarUpdateRequest(BaseModel):
    avatar_url: str
