from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SharedListCreate(BaseModel):
    name: str


class SharedListItemAdd(BaseModel):
    tmdb_id: int
    media_type: str = "movie"
    title: str
    poster_path: Optional[str] = None


class SharedMemberOut(BaseModel):
    user_id: int
    username: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class SharedListItemOut(BaseModel):
    id: int
    tmdb_id: int
    media_type: str
    title: str
    poster_path: Optional[str] = None
    added_by_username: str
    added_by_id: int
    added_at: datetime

    class Config:
        from_attributes = True


class SharedListOut(BaseModel):
    id: int
    name: str
    owner_id: int
    owner_username: str
    members: List[SharedMemberOut] = []
    items: List[SharedListItemOut] = []
    item_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class SharedListSummary(BaseModel):
    id: int
    name: str
    owner_id: int
    owner_username: str
    member_count: int = 0
    item_count: int = 0
    members: List[SharedMemberOut] = []
    created_at: datetime

    class Config:
        from_attributes = True
