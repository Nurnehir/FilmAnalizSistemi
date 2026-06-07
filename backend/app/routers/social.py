from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.dependencies import get_db, get_current_user, get_current_user_optional
from app.models.user import User
from app.models.friendship import Friendship
from app.models.watchlist_collection import WatchlistCollection
from app.models.watchlist import Watchlist
from app.models.shared_list import SharedListMember, SharedListItem
from app.schemas.social import UserPublicOut, FollowOut, PublicCollection, PublicCollectionItem

router = APIRouter(prefix="/social", tags=["social"])


def _user_public_out(user: User, db: Session, current_user_id: Optional[int] = None) -> dict:
    follower_count = db.query(func.count(Friendship.id)).filter(Friendship.following_id == user.id).scalar() or 0
    following_count = db.query(func.count(Friendship.id)).filter(Friendship.follower_id == user.id).scalar() or 0
    watchlist_count = db.query(func.count(Watchlist.id)).filter(Watchlist.user_id == user.id).scalar() or 0
    collection_count = db.query(func.count(WatchlistCollection.id)).filter(
        WatchlistCollection.user_id == user.id,
        WatchlistCollection.is_public == True,
    ).scalar() or 0
    is_following = False
    if current_user_id and current_user_id != user.id:
        is_following = db.query(Friendship).filter(
            Friendship.follower_id == current_user_id,
            Friendship.following_id == user.id,
        ).first() is not None
    return {
        "id": user.id,
        "username": user.username,
        "avatar_url": getattr(user, "avatar_url", None),
        "follower_count": follower_count,
        "following_count": following_count,
        "watchlist_count": watchlist_count,
        "collection_count": collection_count,
        "is_following": is_following,
    }


@router.post("/follow/{user_id}", status_code=status.HTTP_201_CREATED)
def follow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Kendinizi takip edemezsiniz")
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    existing = db.query(Friendship).filter(
        Friendship.follower_id == current_user.id,
        Friendship.following_id == user_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Zaten takip ediyorsunuz")
    friendship = Friendship(follower_id=current_user.id, following_id=user_id)
    db.add(friendship)
    db.commit()
    return {"message": "Takip edildi"}


@router.delete("/follow/{user_id}", status_code=status.HTTP_200_OK)
def unfollow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    friendship = db.query(Friendship).filter(
        Friendship.follower_id == current_user.id,
        Friendship.following_id == user_id,
    ).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Takip kaydı bulunamadı")
    db.delete(friendship)
    db.commit()
    return {"message": "Takipten çıkıldı"}


@router.get("/following", response_model=List[UserPublicOut])
def get_following(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    friendships = db.query(Friendship).filter(Friendship.follower_id == current_user.id).all()
    result = []
    for f in friendships:
        user = db.query(User).filter(User.id == f.following_id).first()
        if user:
            result.append(_user_public_out(user, db, current_user.id))
    return result


@router.get("/followers", response_model=List[UserPublicOut])
def get_followers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    friendships = db.query(Friendship).filter(Friendship.following_id == current_user.id).all()
    result = []
    for f in friendships:
        user = db.query(User).filter(User.id == f.follower_id).first()
        if user:
            result.append(_user_public_out(user, db, current_user.id))
    return result


@router.get("/follower-count")
def get_follower_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = db.query(func.count(Friendship.id)).filter(Friendship.following_id == current_user.id).scalar() or 0
    return {"count": count}


@router.get("/notifications/count")
def get_notifications_count(
    since: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    follower_count = (
        db.query(func.count(Friendship.id))
        .filter(Friendship.following_id == current_user.id)
        .scalar() or 0
    )

    shared_event_count = 0
    if since:
        # Ortak listelere davet (yeni üyelikler)
        new_memberships = (
            db.query(func.count(SharedListMember.list_id))
            .filter(
                SharedListMember.user_id == current_user.id,
                SharedListMember.joined_at > since,
            )
            .scalar() or 0
        )

        # Üyesi olduğum listelere başkası film eklemiş
        my_list_ids = (
            db.query(SharedListMember.list_id)
            .filter(SharedListMember.user_id == current_user.id)
            .subquery()
        )
        new_items = (
            db.query(func.count(SharedListItem.id))
            .filter(
                SharedListItem.list_id.in_(my_list_ids),
                SharedListItem.added_by != current_user.id,
                SharedListItem.added_at > since,
            )
            .scalar() or 0
        )

        shared_event_count = new_memberships + new_items

    return {"follower_count": follower_count, "shared_event_count": shared_event_count}


@router.get("/search", response_model=List[UserPublicOut])
def search_users(
    q: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    if len(q.strip()) < 2:
        return []
    users = db.query(User).filter(User.username.ilike(f"%{q.strip()}%")).limit(10).all()
    current_user_id = current_user.id if current_user else None
    return [_user_public_out(u, db, current_user_id) for u in users if not (current_user and u.id == current_user.id)]


@router.get("/users/{username}", response_model=UserPublicOut)
def get_user_profile(
    username: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    current_user_id = current_user.id if current_user else None
    return _user_public_out(user, db, current_user_id)


@router.get("/users/{username}/watchlist", response_model=List[PublicCollection])
def get_user_watchlist(
    username: str,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    collections = db.query(WatchlistCollection).filter(
        WatchlistCollection.user_id == user.id,
        WatchlistCollection.is_public == True,
    ).all()

    result = []
    for col in collections:
        items = db.query(Watchlist).filter(Watchlist.collection_id == col.id).limit(20).all()
        result.append({
            "id": col.id,
            "name": col.name,
            "item_count": len(items),
            "items": [
                {
                    "tmdb_id": i.tmdb_id,
                    "media_type": i.media_type,
                    "title": i.title,
                    "poster_path": i.poster_path,
                }
                for i in items
            ],
        })
    return result
