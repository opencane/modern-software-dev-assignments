# Task 2 Plan: Notes Search with Pagination and Sorting

## Overview

Task 2 requires enhancing the existing `/notes/search/` endpoint to support:
- Search query (`q`) with case-insensitive matching on title/content
- Pagination (`page`, `page_size`)
- Sorting (`sort` parameter with options like `created_desc`, `title_asc`)
- Response format with `items`, `total`, `page`, `page_size`

And updating the React frontend to display search UI with result count and pagination controls.

---

## Backend Implementation

### Step 1: Update Schemas (`backend/app/schemas.py`)

Add new schemas for paginated response and search parameters:

```python
class NoteSearchParams(BaseModel):
    q: Optional[str] = None
    page: int = 1
    page_size: int = 10
    sort: str = "created_desc"  # Options: created_asc, created_desc, title_asc, title_desc

class NoteSearchResponse(BaseModel):
    items: list[NoteRead]
    total: int
    page: int
    page_size: int
```

### Step 2: Update Notes Router (`backend/app/routers/notes.py`)

Modify the search endpoint to:
1. Add query parameters for pagination and sorting
2. Implement SQLAlchemy query composition with:
   - Case-insensitive filtering using `func.lower()`
   - Ordering based on `sort` parameter
   - Pagination using `.offset()` and `.limit()`
3. Return paginated response with metadata

---

## Frontend Implementation

### Step 3: Update API Client (`frontend/src/api.js`)

Modify `searchNotes` function to accept pagination and sorting parameters:

```javascript
export async function searchNotes(query, page = 1, pageSize = 10, sort = 'created_desc') {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  params.append('page', page);
  params.append('page_size', pageSize);
  params.append('sort', sort);
  return fetchJSON(`/notes/search/?${params.toString()}`);
}
```

### Step 4: Update NotesList Component (`frontend/src/components/NotesList.jsx`)

Add:
- Search input field
- Sort dropdown (options: Newest, Oldest, Title A-Z, Title Z-A)
- Result count display ("Showing X of Y notes")
- Pagination controls (Previous, Next, page indicator)
- State for: `searchQuery`, `currentPage`, `pageSize`, `sortBy`, `totalNotes`

---

## Testing

### Step 5: Backend Tests (`backend/tests/test_notes.py`)

Add tests for:
1. Basic search with query returns matching notes
2. Case-insensitive search works on title and content
3. Pagination returns correct subset of results
4. Pagination metadata (`total`, `page`, `page_size`) is correct
5. Sorting by created date (asc/desc)
6. Sorting by title (asc/desc)
7. Empty search returns all notes paginated
8. Search with no matches returns empty array with total=0
9. Invalid page number returns empty results
10. Edge case: page_size larger than total items

### Step 6: Frontend Tests (`frontend/src/__tests__/NotesList.test.jsx`)

Add tests for:
1. Search input triggers API call with query
2. Sort dropdown changes API call parameters
3. Pagination controls call API with correct page
4. Result count displays correctly
5. Empty search results shows appropriate message

---

## Implementation Order

1. Update schemas (`schemas.py`)
2. Update backend router (`routers/notes.py`)
3. Test backend endpoint manually
4. Update frontend API client (`api.js`)
5. Update frontend component (`NotesList.jsx`)
6. Run backend tests (`make test`)
7. Run frontend tests (`make web-test`)

---

## Edge Cases to Handle

- Empty search query: return all notes paginated
- Search with no matches: return empty array, total=0
- Invalid sort parameter: default to `created_desc`
- Page number > total pages: return empty items array
- Very large page_size: cap at reasonable maximum (e.g., 100)

---

## Critical Files

- `backend/app/routers/notes.py` - Core logic to modify: add pagination and sorting to search endpoint
- `backend/app/schemas.py` - Add response schemas for pagination metadata
- `frontend/src/components/NotesList.jsx` - Add search UI, pagination controls
- `frontend/src/api.js` - Update searchNotes to accept pagination params
- `backend/tests/test_notes.py` - Add tests for pagination and sorting
