from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class CollectionCreate(BaseModel):
    name: str


class CollectionUpdate(BaseModel):
    name: str


class CollectionOut(BaseModel):
    id: int
    name: str
    item_count: int
    created_at: datetime


class WatchlistItem(BaseModel):
    tmdb_id: int
    media_type: str
    title: str
    poster_path: Optional[str] = None
    collection_id: Optional[int] = None
    genre_ids: Optional[List[int]] = None


class WatchlistOut(BaseModel):
    id: int
    tmdb_id: int
    media_type: str
    title: str
    poster_path: Optional[str] = None
    watched: bool = False
    user_rating: Optional[int] = None
    collection_id: Optional[int] = None
    genre_ids: List[int] = []
    added_at: datetime

    class Config:
        from_attributes = True


class WatchlistResponse(BaseModel):
    items: List[WatchlistOut]
    total: int


class WatchedUpdate(BaseModel):
    watched: bool


class RatingUpdate(BaseModel):
    rating: Optional[int] = None


class MoveItem(BaseModel):
    collection_id: Optional[int] = None
