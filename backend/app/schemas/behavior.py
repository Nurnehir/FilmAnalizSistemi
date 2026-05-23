from typing import Literal, Optional
from pydantic import BaseModel


class BehaviorEvent(BaseModel):
    event_type: Literal["view", "search", "click", "recommend_request"]
    tmdb_id: Optional[int] = None
    media_type: Optional[str] = None
    title: Optional[str] = None
    genre_ids: Optional[list[int]] = None
    search_query: Optional[str] = None
