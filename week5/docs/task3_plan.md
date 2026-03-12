# Task 3 Plan: Full Notes CRUD with Optimistic UI Updates

## Current State
- **Backend**: Note model with id, title, content. Has GET (list/single), POST (create), search endpoints. Missing PUT and DELETE.
- **Frontend**: NotesList component with create and delete functionality (no optimistic updates yet). Uses api.js with fetchJSON wrapper.
- **API Client**: Already has `deleteNote` function in api.js but backend DELETE endpoint does not exist.

## Required Changes

### 1. Backend: Validation in schemas.py

Add `NoteUpdate` schema with Pydantic validation:
- Title: min_length=1, max_length=200
- Content: min_length=1 (no max, as it's Text)

### 2. Backend: Add PUT and DELETE endpoints in notes.py router

- `PUT /notes/{note_id}` - Update note with validation, return 404 if not found
- `DELETE /notes/{note_id}` - Delete note, return 404 if not found

### 3. Frontend: API client (api.js)

- Add `updateNote(id, note)` function using PUT method

### 4. Frontend: NotesList.jsx with Optimistic Updates

- **Delete**: Immediately remove note from state, refetch on error and show error
- **Update**: Add inline edit mode, immediately update state, rollback on error
- Handle loading states appropriately during optimistic operations

### 5. Tests

**Backend tests (test_notes.py):**
- Test PUT success (200 with updated note)
- Test PUT validation errors (400 - title too short/long, content empty)
- Test PUT 404 for non-existent note
- Test DELETE success (204)
- Test DELETE 404 for non-existent note

**Frontend tests (NotesList.test.jsx):**
- Test optimistic delete removes note immediately
- Test optimistic delete rollback on error
- Test optimistic update updates note immediately
- Test optimistic update rollback on error

---

## Critical Files for Implementation

- `backend/app/schemas.py` - Add NoteUpdate with Pydantic validation constraints
- `backend/app/routers/notes.py` - Add PUT and DELETE endpoints
- `frontend/src/api.js` - Add updateNote function
- `frontend/src/components/NotesList.jsx` - Implement optimistic UI updates with edit/delete
- `backend/tests/test_notes.py` - Add backend tests for CRUD operations and validation
