from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, HTTPException, status

from .. import db
from ..schemas import (
    ActionItemDone,
    ActionItemResponse,
    ExtractRequest,
    ExtractResponse,
)
from ..services.extract import extract_action_items, extract_action_items_llm


router = APIRouter(prefix="/action-items", tags=["action-items"])


@router.post("/extract", response_model=ExtractResponse)
def extract(payload: ExtractRequest) -> ExtractResponse:
    """Extract action items from text using heuristic approach."""
    try:
        note_id: Optional[int] = None
        if payload.save_note:
            note_id = db.insert_note(payload.text)

        items = extract_action_items(payload.text)
        ids = db.insert_action_items(items, note_id=note_id)

        action_items = [
            ActionItemResponse(
                id=id_,
                note_id=note_id,
                text=text,
                done=False,
                created_at="",  # Will be set by database
            )
            for id_, text in zip(ids, items)
        ]

        return ExtractResponse(note_id=note_id, items=action_items)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract action items: {str(e)}",
        )


@router.post("/extract-llm", response_model=ExtractResponse)
def extract_llm(payload: ExtractRequest) -> ExtractResponse:
    """Extract action items from text using LLM."""
    try:
        note_id: Optional[int] = None
        if payload.save_note:
            note_id = db.insert_note(payload.text)

        items = extract_action_items_llm(payload.text)
        ids = db.insert_action_items(items, note_id=note_id)

        action_items = [
            ActionItemResponse(
                id=id_,
                note_id=note_id,
                text=text,
                done=False,
                created_at="",  # Will be set by database
            )
            for id_, text in zip(ids, items)
        ]

        return ExtractResponse(note_id=note_id, items=action_items)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract action items with LLM: {str(e)}",
        )


@router.get("", response_model=List[ActionItemResponse])
def list_all(note_id: Optional[int] = None) -> List[ActionItemResponse]:
    """List all action items, optionally filtered by note_id."""
    try:
        rows = db.list_action_items(note_id=note_id)
        return [
            ActionItemResponse(
                id=r["id"],
                note_id=r["note_id"],
                text=r["text"],
                done=bool(r["done"]),
                created_at=r["created_at"],
            )
            for r in rows
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list action items: {str(e)}",
        )


@router.get("/{action_item_id}", response_model=ActionItemResponse)
def get_action_item(action_item_id: int) -> ActionItemResponse:
    """Get a single action item by ID."""
    item = db.get_action_item(action_item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action item with id {action_item_id} not found",
        )
    return ActionItemResponse(
        id=item["id"],
        note_id=item["note_id"],
        text=item["text"],
        done=bool(item["done"]),
        created_at=item["created_at"],
    )


@router.post("/{action_item_id}/done", response_model=ActionItemResponse)
def mark_done(action_item_id: int, payload: ActionItemDone) -> ActionItemResponse:
    """Mark an action item as done or not done."""
    updated = db.mark_action_item_done(action_item_id, payload.done)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action item with id {action_item_id} not found",
        )
    item = db.get_action_item(action_item_id)
    return ActionItemResponse(
        id=item["id"],
        note_id=item["note_id"],
        text=item["text"],
        done=bool(item["done"]),
        created_at=item["created_at"],
    )
