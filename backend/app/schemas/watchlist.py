from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class WatchlistItem(BaseModel):
    tmdb_id: int
    media_type: str
    title: str
    poster_path: Optional[str] = None


class WatchlistOut(BaseModel):
    id: int
    tmdb_id: int
    media_type: str
    title: str
    poster_path: Optional[str] = None
    watched: bool = False
    user_rating: Optional[int] = None
    added_at: datetime

    class Config:
        from_attributes = True


class WatchlistResponse(BaseModel):
    items: List[WatchlistOut]
    total: int


class WatchedUpdate(BaseModel):
    watched: bool


class RatingUpdate(BaseModel):
    rating: Optional[int] = None  # 1-5 veya null (puan kaldır)
