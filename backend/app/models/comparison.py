from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from app.database import Base


class Comparison(Base):
    __tablename__ = "comparisons"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tmdb_id_a  = Column(Integer, nullable=False)
    tmdb_id_b  = Column(Integer, nullable=False)
    media_type = Column(String(10), nullable=False, default="movie")
    ai_result  = Column(Text, nullable=False)
    winner_id  = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
