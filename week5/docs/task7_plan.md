# Task 7 Plan: Robust Error Handling and Response Envelopes

## Current State

- `backend/app/schemas.py`: Has basic Pydantic models with no validation constraints
- `backend/app/main.py`: No exception handlers, just basic FastAPI setup
- Endpoints return raw response models (e.g., `NoteRead`, `list[NoteRead]`) without envelopes

## Required Changes

- Add Pydantic validation constraints (min_length, non-empty)
- Add global exception handlers
- Standardize responses to envelope format
- Update tests

---

## Step 1: Update Pydantic Schemas with Validation

**File: `backend/app/schemas.py`**

Add validation constraints to existing models:

```python
class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1)  # non-empty
    content: str = Field(..., min_length=1) # non-empty

class ActionItemCreate(BaseModel):
    description: str = Field(..., min_length=1)  # non-empty
```

---

## Step 2: Create Response Envelope Schemas

**File: `backend/app/schemas.py`**

Add new schemas for response envelopes:

```python
from typing import Generic, TypeVar

T = TypeVar("T")

class ErrorDetail(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    ok: bool = False
    error: ErrorDetail

class SuccessResponse(BaseModel):
    ok: bool = True
    data: T
```

---

## Step 3: Create Custom Exception Classes

**File: `backend/app/exceptions.py`** (new file)

```python
from fastapi import HTTPException

class AppException(HTTPException):
    def __init__(self, code: str, message: str, status_code: int = 400):
        super().__init__(status_code=status_code, detail={"code": code, "message": message})

class NotFoundException(AppException):
    def __init__(self, resource: str, identifier: any):
        super().__init__(
            code="NOT_FOUND",
            message=f"{resource} with id {identifier} not found",
            status_code=404
        )
```

---

## Step 4: Add Global Exception Handlers

**File: `backend/app/main.py`**

```python
from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "ok": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request data"
            }
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content={"ok": False, "error": exc.detail}
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "ok": False,
            "error": {"code": "HTTP_ERROR", "message": str(exc.detail)}
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "ok": False,
            "error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred"}
        }
    )
```

---

## Step 5: Update Router Endpoints to Use Envelopes

Modify endpoints in `backend/app/routers/notes.py` and `backend/app/routers/action_items.py`:

```python
from ..schemas import SuccessResponse

@router.get("/", response_model=SuccessResponse[list[NoteRead]])
def list_notes(db: Session = Depends(get_db)):
    rows = db.execute(select(Note)).scalars().all()
    data = [NoteRead.model_validate(row) for row in rows]
    return SuccessResponse(ok=True, data=data)

@router.post("/", response_model=SuccessResponse[NoteRead], status_code=201)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)):
    note = Note(title=payload.title, content=payload.content)
    db.add(note)
    db.flush()
    db.refresh(note)
    return SuccessResponse(ok=True, data=NoteRead.model_validate(note))

@router.get("/{note_id}", response_model=SuccessResponse[NoteRead])
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.get(Note, note_id)
    if not note:
        raise NotFoundException("Note", note_id)
    return SuccessResponse(ok=True, data=NoteRead.model_validate(note))
```

---

## Step 6: Update Tests to Assert Envelope Shapes

Modify `backend/tests/test_notes.py` and `backend/tests/test_action_items.py`:

```python
def test_create_note_returns_envelope(client):
    payload = {"title": "Test", "content": "Hello world"}
    r = client.post("/notes/", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["ok"] is True
    assert "data" in data
    assert data["data"]["title"] == "Test"

def test_get_nonexistent_note_returns_error_envelope(client):
    r = client.get("/notes/99999")
    assert r.status_code == 404
    data = r.json()
    assert data["ok"] is False
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"

def test_create_note_with_empty_title_returns_validation_error(client):
    payload = {"title": "", "content": "Hello world"}
    r = client.post("/notes/", json=payload)
    assert r.status_code == 422
    data = r.json()
    assert data["ok"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"
```

---

## File Changes Summary

| File | Change |
|------|--------|
| `backend/app/schemas.py` | Add Field constraints, add SuccessResponse/ErrorResponse envelopes |
| `backend/app/exceptions.py` | Create custom exception classes (new file) |
| `backend/app/main.py` | Add global exception handlers |
| `backend/app/routers/notes.py` | Update endpoints to return envelope format |
| `backend/app/routers/action_items.py` | Update endpoints to return envelope format |
| `backend/tests/test_notes.py` | Update tests to check envelope shapes |
| `backend/tests/test_action_items.py` | Update tests to check envelope shapes |

---

## Critical Files

- `backend/app/schemas.py` - Add Pydantic validation and response envelope models
- `backend/app/main.py` - Add global exception handlers
- `backend/app/routers/notes.py` - Update endpoints to use envelope format
- `backend/app/routers/action_items.py` - Update endpoints to use envelope format
- `backend/tests/test_notes.py` - Update tests to assert envelope shapes
