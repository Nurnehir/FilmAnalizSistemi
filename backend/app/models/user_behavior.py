from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, ARRAY, func
from app.database import Base


class UserBehavior(Base):
    __tablename__ = "user_behavior"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_type   = Column(String(30), nullable=False)
    tmdb_id      = Column(Integer, nullable=True)
    media_type   = Column(String(10), nullable=True)
    title        = Column(String(255), nullable=True)
    genre_ids    = Column(ARRAY(Integer), nullable=True)
    search_query = Column(String(255), nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
