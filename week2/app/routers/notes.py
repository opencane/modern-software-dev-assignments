from __future__ import annotations

from typing import List

from fastapi import APIRouter, HTTPException, status

from .. import db
from ..schemas import NoteCreate, NoteResponse


router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteCreate) -> NoteResponse:
    """Create a new note."""
    try:
        note_id = db.insert_note(payload.content)
        note = db.get_note(note_id)
        if note is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create note",
            )
        return NoteResponse(**note)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create note: {str(e)}",
        )


@router.get("/list", response_model=List[NoteResponse])
def list_notes() -> List[NoteResponse]:
    """List all notes."""
    try:
        notes = db.list_notes()
        return [NoteResponse(**note) for note in notes]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list notes: {str(e)}",
        )


@router.get("/{note_id}", response_model=NoteResponse)
def get_single_note(note_id: int) -> NoteResponse:
    """Get a single note by ID."""
    note = db.get_note(note_id)
    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {note_id} not found",
        )
    return NoteResponse(**note)


@router.delete("/{note_id}")
def delete_note(note_id: int) -> dict:
    """Delete a note by ID."""
    deleted = db.delete_note(note_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {note_id} not found",
        )
    return {"message": "Note deleted successfully"}
