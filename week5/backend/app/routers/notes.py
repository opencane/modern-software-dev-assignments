from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Note
from ..schemas import NoteCreate, NoteRead, NoteSearchResponse, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


# Redirect /notes to /notes/ for consistency
@router.get("")
def list_notes_redirect():
    return RedirectResponse(url="/notes/")


@router.get("/", response_model=list[NoteRead])
def list_notes(db: Session = Depends(get_db)) -> list[NoteRead]:
    rows = db.execute(select(Note)).scalars().all()
    return [NoteRead.model_validate(row) for row in rows]


@router.post("/", response_model=NoteRead, status_code=201)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)) -> NoteRead:
    note = Note(title=payload.title, content=payload.content)
    db.add(note)
    db.flush()
    db.refresh(note)
    return NoteRead.model_validate(note)


@router.get("/search", response_model=list[NoteRead])
def search_notes_redirect():
    return RedirectResponse(url="/notes/search/")


@router.get("/search/", response_model=NoteSearchResponse)
def search_notes(
    q: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    sort: str = "created_desc",
    db: Session = Depends(get_db)
) -> NoteSearchResponse:
    # Cap page_size at 100
    page_size = min(page_size, 100)

    # Ensure page is at least 1
    page = max(page, 1)

    # Build base query
    query = select(Note)
    count_query = select(func.count()).select_from(Note)

    # Add case-insensitive search filter if query provided
    if q:
        search_filter = (func.lower(Note.title).contains(q.lower())) | (func.lower(Note.content).contains(q.lower()))
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    # Get total count
    total = db.execute(count_query).scalar() or 0

    # Apply sorting
    sort_options = {
        "created_asc": Note.id.asc(),
        "created_desc": Note.id.desc(),
        "title_asc": Note.title.asc(),
        "title_desc": Note.title.desc(),
    }
    order_by = sort_options.get(sort, Note.id.desc())
    query = query.order_by(order_by)

    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    # Execute query
    rows = db.execute(query).scalars().all()

    return NoteSearchResponse(
        items=[NoteRead.model_validate(row) for row in rows],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{note_id}", response_model=NoteRead)
def get_note(note_id: int, db: Session = Depends(get_db)) -> NoteRead:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteRead.model_validate(note)


@router.put("/{note_id}", response_model=NoteRead)
def update_note(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db)) -> NoteRead:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    note.title = payload.title
    note.content = payload.content
    db.flush()
    db.refresh(note)
    return NoteRead.model_validate(note)


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)) -> None:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.flush()
