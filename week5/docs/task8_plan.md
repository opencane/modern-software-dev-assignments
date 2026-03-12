# Task 8 Plan: List Endpoint Pagination for All Collections

## Current State
- **Backend**: `GET /notes/` and `GET /action-items/` return all items as arrays
- **Frontend**: `NotesList.jsx` and `ActionItemsList.jsx` fetch all items and render them in a single list
- **API**: `getNotes()` and `getActionItems()` make simple GET requests without pagination params

---

## Step 1: Backend - Add pagination to GET /notes

**File: `backend/app/routers/notes.py`**

- Add `page` (default: 1) and `page_size` (default: 10) query parameters to `list_notes`
- Use SQLAlchemy `.offset()` and `.limit()` for pagination
- Add total count using `select(func.count()).select_from(Note)`
- Return response: `{ "items": [...], "total": int, "page": int, "page_size": int }`

**File: `backend/app/schemas.py`**

- Create `PaginatedNotes` schema with `items`, `total`, `page`, `page_size`

---

## Step 2: Backend - Add pagination to GET /action-items

**File: `backend/app/routers/action_items.py`**

- Same pattern as notes: add `page` and `page_size` params
- Return paginated response with metadata

---

## Step 3: Frontend - Update API functions

**File: `frontend/src/api.js`**

- Modify `getNotes(page, pageSize)` to accept pagination params
- Modify `getActionItems(page, pageSize)` similarly
- Build URL with query params: `/notes/?page=1&page_size=10`

---

## Step 4: Frontend - Update NotesList component

**File: `frontend/src/components/NotesList.jsx`**

- Add state for `page`, `pageSize`, `total`
- Add pagination UI: Previous/Next buttons, page indicator
- Update `fetchNotes` to pass pagination params and store total count
- After create/delete, re-fetch maintaining current page

---

## Step 5: Frontend - Update ActionItemsList component

**File: `frontend/src/components/ActionItemsList.jsx`**

- Same pattern as NotesList: add pagination state and controls

---

## Step 6: Backend Tests for pagination boundaries

**File: `backend/tests/test_notes.py`**

- Test: `GET /notes/?page=1&page_size=5` returns correct items
- Test: Empty last page (request page beyond available data)
- Test: Too-large page size (e.g., page_size=1000)
- Test: Default values when page/page_size not provided

**File: `backend/tests/test_action_items.py`**

- Same pagination boundary tests

---

## Step 7: Frontend Tests for pagination

**File: `frontend/src/__tests__/NotesList.test.jsx`**

- Test: Pagination controls render when total > page_size
- Test: Clicking Next loads next page
- Test: Empty state when requesting beyond available pages

---

## Response Format

```json
{
  "items": [...],
  "total": 25,
  "page": 1,
  "page_size": 10
}
```

## Backend Default Values

- `page`: 1
- `page_size`: 10
- Maximum `page_size`: 100 (to prevent abuse)

## Edge Cases to Handle

- Empty last page: Return empty `items` array with correct `total`
- Invalid page (0 or negative): Default to page 1
- Invalid page_size: Clamp to valid range

---

## Implementation Sequence

1. First implement backend pagination schemas and routes
2. Test backend with curl/manual testing
3. Update frontend API functions
4. Update frontend components with pagination UI
5. Add tests for both backend and frontend

---

## Critical Files

- `backend/app/routers/notes.py` - Core endpoint to modify for notes pagination
- `backend/app/routers/action_items.py` - Core endpoint to modify for action items pagination
- `frontend/src/api.js` - API client functions to update with pagination params
- `frontend/src/components/NotesList.jsx` - Frontend component needing pagination UI
- `backend/app/schemas.py` - Add paginated response schemas
