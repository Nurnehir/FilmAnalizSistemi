from typing import List, Optional
from pydantic import BaseModel


class RecommendRequest(BaseModel):
    prompt: str


class MovieRecommendation(BaseModel):
    tmdb_id: int
    title: Optional[str] = None
    overview: Optional[str] = None
    poster_url: Optional[str] = None
    vote_average: Optional[float] = None
    release_date: Optional[str] = None
    reason: str
    media_type: Optional[str] = None


class RecommendResponse(BaseModel):
    analysis: str
    movies: List[MovieRecommendation]
    history_id: int


class HistoryItem(BaseModel):
    id: int
    user_prompt: str
    ai_response: str
    tmdb_ids: Optional[List[int]] = None
    created_at: str

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    history: List[HistoryItem]
    total: int
