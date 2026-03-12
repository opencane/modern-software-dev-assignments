# Task 5 Plan: Tags Feature with Many-to-Many Relation

## Context

The project needs a tags feature with many-to-many relationships between notes and tags. This involves adding a Tag model, a join table, backend endpoints, and frontend UI to display tags as chips and filter notes by tag.

---

## Phase 1: Backend - Add Tag Model and Many-to-Many Table

### 1. Update `backend/app/models.py`

- Add `Tag` model with `id` (Integer, PK) and `name` (String, unique, indexed)
- Add `note_tags` association table with columns: `note_id` (FK to notes), `tag_id` (FK to tags)
- Add `tags` relationship to `Note` model using the association table

### 2. Update `backend/app/schemas.py`

- Add `TagCreate` schema (name: str)
- Add `TagRead` schema (id: int, name: str)
- Add `NoteReadWithTags` that extends `NoteRead` with `tags: list[TagRead]`

---

## Phase 2: Backend - Add Tag Endpoints

### 1. Create new router `backend/app/routers/tags.py`

- `GET /tags/` - List all tags
- `POST /tags/` - Create a new tag
- `DELETE /tags/{tag_id}` - Delete a tag by ID

### 2. Update `backend/app/routers/notes.py`

- Add `POST /notes/{note_id}/tags` - Attach tags to a note
- Add `DELETE /notes/{note_id}/tags/{tag_id}` - Detach a tag from a note
- Add `GET /notes/by-tag/{tag_id}` - Get notes filtered by tag
- Optionally add `tag` query parameter to `GET /notes/` for filtering

### 3. Register the tags router in `backend/app/main.py`

- Import and include tags router

---

## Phase 3: Frontend - Add Tag API Functions

### Update `frontend/src/api.js`

- `getTags()` - Fetch all tags
- `createTag(name)` - Create a new tag
- `deleteTag(id)` - Delete a tag
- `addTagToNote(noteId, tagId)` - Attach tag to note
- `removeTagFromNote(noteId, tagId)` - Detach tag from note
- `getNotesByTag(tagId)` - Get notes filtered by tag

---

## Phase 4: Frontend - Add Tag UI Components

### 1. Create `frontend/src/components/TagsList.jsx`

- Display all available tags
- Form to create new tags
- Delete button for each tag

### 2. Create `frontend/src/components/TagFilter.jsx`

- Dropdown or chip list to filter notes by tag
- "All notes" option to clear filter

### 3. Update `frontend/src/components/NotesList.jsx`

- Fetch and display tags with each note as chips
- Integrate tag filter functionality
- Add UI to attach/detach tags from notes

### 4. Update `frontend/src/App.jsx`

- Add TagsList component alongside NotesList

---

## Phase 5: Add Tests

### 1. Backend tests (`backend/tests/test_tags.py`)

- Test tag CRUD operations
- Test many-to-many relationship (attach/detach tags)
- Test filtering notes by tag
- Test error cases (404 for non-existent tags, 400 for invalid input)

### 2. Frontend tests

- Add tests for TagsList component
- Add tests for tag filtering in NotesList

---

## File Changes Summary

| File | Action |
|------|--------|
| `backend/app/models.py` | Add Tag model and note_tags table |
| `backend/app/schemas.py` | Add TagCreate, TagRead, NoteReadWithTags |
| `backend/app/routers/tags.py` | Create new router for tag CRUD |
| `backend/app/routers/notes.py` | Add tag attachment/detachment endpoints |
| `backend/app/main.py` | Include tags router |
| `frontend/src/api.js` | Add tag API functions |
| `frontend/src/components/TagsList.jsx` | Create new component |
| `frontend/src/components/TagFilter.jsx` | Create new component |
| `frontend/src/components/NotesList.jsx` | Update to display tags and filter |
| `frontend/src/App.jsx` | Add TagsList to UI |
| `backend/tests/test_tags.py` | Create backend tests |

---

## Critical Files

- `backend/app/models.py` - Add Tag model and note_tags join table with relationships
- `backend/app/schemas.py` - Add TagCreate, TagRead schemas and NoteReadWithTags
- `backend/app/routers/notes.py` - Add tag attachment/detachment endpoints
- `frontend/src/components/NotesList.jsx` - Add tag display as chips and filtering
- `frontend/src/api.js` - Add tag API functions
