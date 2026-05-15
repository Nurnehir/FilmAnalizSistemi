from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, ARRAY, func
from app.database import Base


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_prompt = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    tmdb_ids    = Column(ARRAY(Integer), default=[])
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
