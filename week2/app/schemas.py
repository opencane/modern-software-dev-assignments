from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# Note schemas
class NoteCreate(BaseModel):
    content: str = Field(..., min_length=1, description="Note content")


class NoteResponse(BaseModel):
    id: int
    content: str
    created_at: str

    class Config:
        from_attributes = True


# Action Item schemas
class ActionItemCreate(BaseModel):
    text: str = Field(..., min_length=1, description="Action item text")


class ActionItemResponse(BaseModel):
    id: int
    note_id: Optional[int] = None
    text: str
    done: bool = False
    created_at: str

    class Config:
        from_attributes = True


class ActionItemDone(BaseModel):
    done: bool = Field(default=True, description="Whether the action item is done")


class ExtractRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to extract action items from")
    save_note: bool = Field(default=False, description="Whether to save the note to database")


class ExtractResponse(BaseModel):
    note_id: Optional[int] = None
    items: list[ActionItemResponse]
