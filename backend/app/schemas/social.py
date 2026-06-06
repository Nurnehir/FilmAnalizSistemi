from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserPublicOut(BaseModel):
    id: int
    username: str
    avatar_url: Optional[str] = None
    follower_count: int = 0
    following_count: int = 0
    watchlist_count: int = 0
    collection_count: int = 0
    is_following: bool = False

    class Config:
        from_attributes = True


class FollowOut(BaseModel):
    follower_id: int
    following_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PublicCollectionItem(BaseModel):
    tmdb_id: int
    media_type: str
    title: str
    poster_path: Optional[str] = None

    class Config:
        from_attributes = True


class PublicCollection(BaseModel):
    id: int
    name: str
    item_count: int = 0
    items: List[PublicCollectionItem] = []

    class Config:
        from_attributes = True
