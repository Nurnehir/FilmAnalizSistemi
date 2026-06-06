from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.stats import (
    GenreStatsResponse, GenreStat,
    ActivityStatsResponse, MonthActivity,
    RatingStatsResponse, RatingStat,
    StatsSummary,
)
from datetime import datetime, timezone

router = APIRouter(prefix="/stats", tags=["stats"])

GENRE_MAP = {
    28:    ("Aksiyon",          "Action"),
    12:    ("Macera",           "Adventure"),
    16:    ("Animasyon",        "Animation"),
    35:    ("Komedi",           "Comedy"),
    80:    ("Suç",              "Crime"),
    99:    ("Belgesel",         "Documentary"),
    18:    ("Drama",            "Drama"),
    10751: ("Aile",             "Family"),
    14:    ("Fantezi",          "Fantasy"),
    27:    ("Korku",            "Horror"),
    9648:  ("Gizem",            "Mystery"),
    10749: ("Romantik",         "Romance"),
    878:   ("Bilim Kurgu",      "Sci-Fi"),
    53:    ("Gerilim",          "Thriller"),
    37:    ("Kovboy",           "Western"),
    10759: ("Aksiyon & Macera", "Action & Adventure"),
    10765: ("Bilim Kurgu & Fantezi", "Sci-Fi & Fantasy"),
    10762: ("Çocuk",            "Kids"),
    10763: ("Haber",            "News"),
    10764: ("Reality",          "Reality"),
    10766: ("Pembe Dizi",       "Soap"),
    10767: ("Talk Show",        "Talk Show"),
    10768: ("Savaş & Politika", "War & Politics"),
}


@router.get("/genres", response_model=GenreStatsResponse)
async def get_genre_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.execute(text("""
        SELECT unnest(genre_ids) AS genre_id, COUNT(*) AS cnt
        FROM watchlist
        WHERE user_id = :uid
          AND genre_ids IS NOT NULL
          AND array_length(genre_ids, 1) > 0
        GROUP BY genre_id
        ORDER BY cnt DESC
        LIMIT 8
    """), {"uid": current_user.id}).fetchall()

    genres = []
    for row in rows:
        gid = row[0]
        tr_name, en_name = GENRE_MAP.get(gid, (f"Tür {gid}", f"Genre {gid}"))
        genres.append(GenreStat(
            genre_id=gid,
            genre_name_tr=tr_name,
            genre_name_en=en_name,
            count=row[1],
        ))
    return GenreStatsResponse(genres=genres)


@router.get("/activity", response_model=ActivityStatsResponse)
async def get_activity_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.execute(text("""
        SELECT TO_CHAR(DATE_TRUNC('month', added_at), 'YYYY-MM') AS month,
               COUNT(*) AS cnt
        FROM watchlist
        WHERE user_id = :uid
          AND added_at >= NOW() - INTERVAL '12 months'
        GROUP BY month
        ORDER BY month ASC
    """), {"uid": current_user.id}).fetchall()

    # Build a full 12-month list filled with 0
    now = datetime.now(timezone.utc)
    months_map = {}
    for row in rows:
        months_map[row[0]] = row[1]

    result = []
    year, month = now.year, now.month
    for i in range(11, -1, -1):
        m = month - i
        y = year
        while m <= 0:
            m += 12
            y -= 1
        key = f"{y:04d}-{m:02d}"
        result.append(MonthActivity(month=key, count=months_map.get(key, 0)))

    return ActivityStatsResponse(months=result)


@router.get("/ratings", response_model=RatingStatsResponse)
async def get_rating_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.execute(text("""
        SELECT user_rating, COUNT(*) AS cnt
        FROM watchlist
        WHERE user_id = :uid AND user_rating IS NOT NULL
        GROUP BY user_rating
        ORDER BY user_rating ASC
    """), {"uid": current_user.id}).fetchall()

    counts = {row[0]: row[1] for row in rows}
    ratings = [RatingStat(rating=r, count=counts.get(r, 0)) for r in range(1, 6)]
    return RatingStatsResponse(ratings=ratings)


@router.get("/summary", response_model=StatsSummary)
async def get_stats_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.execute(text("""
        SELECT
            COUNT(*) AS watchlist_count,
            COUNT(*) FILTER (WHERE watched = TRUE) AS watched_count,
            AVG(user_rating) FILTER (WHERE user_rating IS NOT NULL) AS avg_rating
        FROM watchlist
        WHERE user_id = :uid
    """), {"uid": current_user.id}).fetchone()

    rec_row = db.execute(text("""
        SELECT COUNT(*) AS rec_count,
               COALESCE(SUM(array_length(tmdb_ids, 1)), 0) AS movies_recommended
        FROM recommendation_history
        WHERE user_id = :uid
    """), {"uid": current_user.id}).fetchone()

    avg = float(row[2]) if row[2] is not None else None
    if avg is not None:
        avg = round(avg, 1)

    return StatsSummary(
        watchlist_count=row[0] or 0,
        watched_count=row[1] or 0,
        avg_rating=avg,
        recommendation_count=rec_row[0] or 0,
        movies_recommended=rec_row[1] or 0,
    )
