# Task 6 Plan: Improve Extraction Logic and Endpoints

## Context

Task 6 requires extending the extraction service to parse additional patterns from note content and exposing these extractions via a new API endpoint with optional persistence.

## Current State

- **Extraction Logic**: `backend/app/services/extract.py` has `extract_action_items(text)` that only parses lines ending with "!" or starting with "TODO:"
- **Models**: `backend/app/models.py` has `Note` and `ActionItem` models, but no `Tag` model
- **Endpoints**: No extraction endpoint exists yet
- **Tests**: Basic extraction test exists in `backend/tests/test_extract.py`

---

## Phase 1: Add Tag Model and Database Changes

*Note: This may overlap with Task 5*

1. **Update `backend/app/models.py`**:
   - Add `Tag` model with `id` and `name` fields
   - Add `note_tags` association table for many-to-many relationship
   - Add relationship to `Note` model (notes.tags)

---

## Phase 2: Extend Extraction Service

### 1. Update `backend/app/services/extract.py`

- Add `extract_hashtags(text)` function to parse `#hashtags` pattern
  - Use regex `#(\w+)` to find hashtags
  - Return list of tag names (without # prefix)

- Add `extract_checkbox_tasks(text)` function to parse `- [ ] task text` pattern
  - Use regex `^- \[ \] (.+)$` to find checkbox tasks
  - Return list of task descriptions

- Create a combined `extract_all(text)` function returning:
  - `hashtags`: list of tag names
  - `action_items`: list of checkbox tasks
  - `legacy_items`: existing TODO:/! items

---

## Phase 3: Add Extraction Endpoint

### 1. Update `backend/app/schemas.py`

- Add `ExtractionResult` schema with `hashtags`, `action_items`, `legacy_items`
- Add `ExtractRequest` schema with optional `apply: bool = False`

### 2. Update `backend/app/routers/notes.py`

- Add `POST /notes/{note_id}/extract` endpoint
- Query note by ID, return 404 if not found
- Call extraction functions on note.content
- If `apply=true`:
  - Create new `Tag` objects for hashtags (use get-or-create pattern)
  - Add tags to note via association table
  - Create new `ActionItem` objects for checkbox tasks
  - Commit all changes to database
- Return extraction results

---

## Phase 4: Add Tests

### 1. Update `backend/tests/test_extract.py`

- Test `extract_hashtags()`: single/multiple hashtags, edge cases
- Test `extract_checkbox_tasks()`: single/multiple checkbox tasks, edge cases
- Test `extract_all()`: combined extraction

### 2. Add `backend/tests/test_extraction_endpoint.py`

- Test extraction returns correct data (apply=false)
- Test extraction with apply=true persists tags
- Test extraction with apply=true persists action items
- Test 404 for non-existent note
- Test idempotency (running apply twice doesn't duplicate)

---

## File Changes Summary

| File | Changes |
|------|---------|
| `backend/app/models.py` | Add Tag model, note_tags table, Note-Tag relationship |
| `backend/app/services/extract.py` | Add extract_hashtags, extract_checkbox_tasks, extract_all functions |
| `backend/app/schemas.py` | Add ExtractionResult, ExtractRequest schemas |
| `backend/app/routers/notes.py` | Add POST /notes/{id}/extract endpoint |
| `backend/tests/test_extract.py` | Add tests for new extraction functions |
| `backend/tests/test_extraction_endpoint.py` | New file for endpoint tests |

---

## Edge Cases to Handle

- Duplicate hashtags in text (dedupe)
- Empty extraction results
- Note not found (404)
- apply=true with no extractions (no-op, no error)
- Idempotency: re-running apply=true should not create duplicates

---

## Dependencies

- Task 5 (Tags) partially completes the Tag model - if not done, include Tag model in this task

---

## Critical Files

- `backend/app/models.py` - Need to add Tag model and Note-Tag relationship
- `backend/app/services/extract.py` - Core extraction logic to extend
- `backend/app/routers/notes.py` - Add new extraction endpoint
- `backend/app/schemas.py` - Add request/response schemas
- `backend/tests/conftest.py` - Test fixture pattern to follow
