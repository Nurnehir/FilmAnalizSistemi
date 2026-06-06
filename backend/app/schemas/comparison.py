from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class CompareRequest(BaseModel):
    tmdb_id_a: int
    tmdb_id_b: int
    media_type: str = "movie"


class CompareResponse(BaseModel):
    id: int
    title_a: str
    title_b: str
    poster_a: Optional[str]
    poster_b: Optional[str]
    comparison: str
    winner_id: Optional[int]
    verdict: str
    created_at: datetime


class CompareHistoryItem(BaseModel):
    id: int
    tmdb_id_a: int
    tmdb_id_b: int
    media_type: str
    winner_id: Optional[int]
    ai_result: str
    created_at: datetime

    class Config:
        from_attributes = True
