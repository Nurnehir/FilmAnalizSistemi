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
    added_at: datetime

    class Config:
        from_attributes = True


class WatchlistResponse(BaseModel):
    items: List[WatchlistOut]
    total: int
