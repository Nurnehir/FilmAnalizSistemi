from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.user_behavior import UserBehavior
from app.schemas.behavior import BehaviorEvent

router = APIRouter(prefix="/behavior", tags=["behavior"])


@router.post("/event", status_code=201)
async def track_event(
    data: BehaviorEvent,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        event = UserBehavior(
            user_id=current_user.id,
            event_type=data.event_type,
            tmdb_id=data.tmdb_id,
            media_type=data.media_type,
            title=data.title,
            genre_ids=data.genre_ids,
            search_query=data.search_query,
        )
        db.add(event)
        db.commit()
    except Exception:
        db.rollback()
    return {"ok": True}
