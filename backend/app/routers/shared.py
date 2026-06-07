from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.shared_list import SharedList, SharedListMember, SharedListItem
from app.schemas.shared import (
    SharedListCreate, SharedListItemAdd,
    SharedListOut, SharedListSummary, SharedListItemOut, SharedMemberOut,
)

router = APIRouter(prefix="/shared", tags=["shared"])


def _is_member(db: Session, list_id: int, user_id: int) -> bool:
    return db.query(SharedListMember).filter(
        SharedListMember.list_id == list_id,
        SharedListMember.user_id == user_id,
    ).first() is not None


def _build_member_out(user: User) -> dict:
    return {
        "user_id": user.id,
        "username": user.username,
        "avatar_url": getattr(user, "avatar_url", None),
    }


def _build_item_out(item: SharedListItem, db: Session) -> dict:
    adder = db.query(User).filter(User.id == item.added_by).first()
    return {
        "id": item.id,
        "tmdb_id": item.tmdb_id,
        "media_type": item.media_type,
        "title": item.title,
        "poster_path": item.poster_path,
        "added_by_username": adder.username if adder else "?",
        "added_by_id": item.added_by,
        "added_at": item.added_at,
    }


def _build_list_out(lst: SharedList, db: Session) -> dict:
    owner = db.query(User).filter(User.id == lst.owner_id).first()
    members_rows = db.query(SharedListMember).filter(SharedListMember.list_id == lst.id).all()
    members = []
    for m in members_rows:
        u = db.query(User).filter(User.id == m.user_id).first()
        if u:
            members.append(_build_member_out(u))
    items_rows = db.query(SharedListItem).filter(SharedListItem.list_id == lst.id).order_by(SharedListItem.added_at.desc()).all()
    items = [_build_item_out(i, db) for i in items_rows]
    return {
        "id": lst.id,
        "name": lst.name,
        "owner_id": lst.owner_id,
        "owner_username": owner.username if owner else "?",
        "members": members,
        "items": items,
        "item_count": len(items),
        "created_at": lst.created_at,
    }


def _build_summary(lst: SharedList, db: Session) -> dict:
    owner = db.query(User).filter(User.id == lst.owner_id).first()
    members_rows = db.query(SharedListMember).filter(SharedListMember.list_id == lst.id).all()
    members = []
    for m in members_rows:
        u = db.query(User).filter(User.id == m.user_id).first()
        if u:
            members.append(_build_member_out(u))
    item_count = db.query(SharedListItem).filter(SharedListItem.list_id == lst.id).count()
    return {
        "id": lst.id,
        "name": lst.name,
        "owner_id": lst.owner_id,
        "owner_username": owner.username if owner else "?",
        "member_count": len(members),
        "item_count": item_count,
        "members": members,
        "created_at": lst.created_at,
    }


@router.post("", response_model=SharedListSummary, status_code=status.HTTP_201_CREATED)
async def create_shared_list(
    data: SharedListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        lst = SharedList(name=data.name.strip(), owner_id=current_user.id)
        db.add(lst)
        db.flush()
        member = SharedListMember(list_id=lst.id, user_id=current_user.id)
        db.add(member)
        db.commit()
        db.refresh(lst)
        return _build_summary(lst, db)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Liste oluşturulamadı")


@router.get("", response_model=List[SharedListSummary])
async def get_shared_lists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member_rows = db.query(SharedListMember).filter(SharedListMember.user_id == current_user.id).all()
    result = []
    for m in member_rows:
        lst = db.query(SharedList).filter(SharedList.id == m.list_id).first()
        if lst:
            result.append(_build_summary(lst, db))
    result.sort(key=lambda x: x["created_at"], reverse=True)
    return result


@router.get("/{list_id}", response_model=SharedListOut)
async def get_shared_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_member(db, list_id, current_user.id):
        raise HTTPException(status_code=403, detail="Bu listeye erişim izniniz yok")
    lst = db.query(SharedList).filter(SharedList.id == list_id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="Liste bulunamadı")
    return _build_list_out(lst, db)


@router.post("/{list_id}/invite/{user_id}", status_code=status.HTTP_201_CREATED)
async def invite_to_list(
    list_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lst = db.query(SharedList).filter(SharedList.id == list_id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="Liste bulunamadı")
    if lst.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sadece liste sahibi davet gönderebilir")
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Kendinizi davet edemezsiniz")
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    if _is_member(db, list_id, user_id):
        raise HTTPException(status_code=409, detail="Kullanıcı zaten bu listede")
    try:
        member = SharedListMember(list_id=list_id, user_id=user_id)
        db.add(member)
        db.commit()
        return {"message": f"@{target.username} listeye eklendi"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Davet gönderilemedi")


@router.delete("/{list_id}/leave", status_code=status.HTTP_200_OK)
async def leave_shared_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lst = db.query(SharedList).filter(SharedList.id == list_id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="Liste bulunamadı")
    if not _is_member(db, list_id, current_user.id):
        raise HTTPException(status_code=403, detail="Bu listede değilsiniz")
    try:
        if lst.owner_id == current_user.id:
            db.delete(lst)
        else:
            member = db.query(SharedListMember).filter(
                SharedListMember.list_id == list_id,
                SharedListMember.user_id == current_user.id,
            ).first()
            if member:
                db.delete(member)
        db.commit()
        return {"message": "Listeden ayrıldınız"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="İşlem başarısız")


@router.post("/{list_id}/items", status_code=status.HTTP_201_CREATED)
async def add_shared_item(
    list_id: int,
    data: SharedListItemAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_member(db, list_id, current_user.id):
        raise HTTPException(status_code=403, detail="Bu listeye erişim izniniz yok")
    existing = db.query(SharedListItem).filter(
        SharedListItem.list_id == list_id,
        SharedListItem.tmdb_id == data.tmdb_id,
        SharedListItem.media_type == data.media_type,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Bu içerik zaten listede")
    try:
        item = SharedListItem(
            list_id=list_id,
            tmdb_id=data.tmdb_id,
            media_type=data.media_type,
            title=data.title,
            poster_path=data.poster_path,
            added_by=current_user.id,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return _build_item_out(item, db)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Film eklenemedi")


@router.delete("/{list_id}/items/{item_id}", status_code=status.HTTP_200_OK)
async def remove_shared_item(
    list_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_member(db, list_id, current_user.id):
        raise HTTPException(status_code=403, detail="Bu listeye erişim izniniz yok")
    item = db.query(SharedListItem).filter(
        SharedListItem.id == item_id,
        SharedListItem.list_id == list_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Film bulunamadı")
    lst = db.query(SharedList).filter(SharedList.id == list_id).first()
    if item.added_by != current_user.id and lst.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu filmi yalnızca ekleyen kişi veya liste sahibi silebilir")
    try:
        db.delete(item)
        db.commit()
        return {"message": "Film silindi"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Film silinemedi")
