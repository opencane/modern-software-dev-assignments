# Task 10 Plan: Test Coverage Improvements

## Overview

This plan outlines test coverage improvements across three areas: 400/404 error scenarios, concurrency/transactional behavior, and frontend integration tests.

---

## Part 1: Backend Tests for 400/404 Scenarios

### Endpoints requiring tests

| Endpoint | Method | Error Scenarios to Test |
|----------|--------|-------------------------|
| `/notes/` | POST | 400 - missing title, missing content, empty strings |
| `/notes/{note_id}` | GET | 404 - non-existent note |
| `/action-items/` | POST | 400 - missing description, empty string |
| `/action-items/{item_id}/complete` | PUT | 404 - non-existent item |

### Tests to add in `backend/tests/test_notes.py`

```python
def test_create_note_missing_title(client):
    """POST /notes/ with missing title returns 422 (Pydantic validation)"""
    r = client.post("/notes/", json={"content": "test"})
    assert r.status_code == 422

def test_create_note_empty_title(client):
    """POST /notes/ with empty title returns 422"""
    r = client.post("/notes/", json={"title": "", "content": "test"})
    assert r.status_code == 422

def test_get_note_not_found(client):
    """GET /notes/999 returns 404"""
    r = client.get("/notes/999")
    assert r.status_code == 404
    assert "not found" in r.json()["detail"].lower()
```

### Tests to add in `backend/tests/test_action_items.py`

```python
def test_create_action_item_missing_description(client):
    """POST /action-items/ without description returns 422"""
    r = client.post("/action-items/", json={})
    assert r.status_code == 422

def test_complete_action_item_not_found(client):
    """PUT /action-items/999/complete returns 404"""
    r = client.put("/action-items/999/complete")
    assert r.status_code == 404
```

---

## Part 2: Backend Tests for Concurrency/Transactional Behavior

### New file: `backend/tests/test_transactions.py`

```python
# Test that concurrent creates don't cause race conditions
def test_concurrent_note_creation(client):
    """Multiple concurrent POST requests to create notes should all succeed"""
    import concurrent.futures
    payloads = [{"title": f"Note {i}", "content": f"Content {i}"} for i in range(10)]

    def create_note(payload):
        return client.post("/notes/", json=payload)

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(create_note, p) for p in payloads]
        results = [f.result() for f in futures]

    # All should succeed
    assert all(r.status_code == 201 for r in results)

# Test bulk operation atomicity (requires bulk-complete endpoint from Task 4)
def test_bulk_complete_atomicity(client):
    """If one item in bulk-complete fails, all should roll back"""
    # Create some valid items, then try bulk with an invalid ID
    # Verify either all succeed or all fail
```

---

## Part 3: Frontend Integration Tests

### New file: `frontend/src/__tests__/SearchNotes.test.jsx`

```javascript
describe('NotesList search', () => {
  it('renders search input', async () => {
    getNotes.mockResolvedValue([]);
    render(<NotesList />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search notes...')).toBeDefined();
    });
  });

  it('calls searchNotes when search is submitted', async () => {
    getNotes.mockResolvedValue([]);
    searchNotes.mockResolvedValue([{ id: 1, title: 'Found', content: 'Result' }]);
    render(<NotesList />);

    const searchInput = screen.getByPlaceholderText('Search notes...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.submit(searchInput);

    await waitFor(() => {
      expect(searchNotes).toHaveBeenCalledWith('test');
    });
  });
});
```

### New file: `frontend/src/__tests__/Pagination.test.jsx`

```javascript
describe('NotesList pagination', () => {
  it('shows pagination controls when there are many notes', async () => {
    const manyNotes = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1, title: `Note ${i}`, content: `Content ${i}`
    }));
    getNotes.mockResolvedValue(manyNotes);
    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeDefined();
    });
  });

  it('loads next page when next button is clicked', async () => {
    // Test page 2 loads different items
  });
});
```

### New file: `frontend/src/__tests__/OptimisticUpdates.test.jsx`

```javascript
describe('NotesList optimistic updates', () => {
  it('immediately shows updated note before server confirms', async () => {
    const mockNotes = [{ id: 1, title: 'Original', content: 'Original content' }];
    getNotes.mockResolvedValue(mockNotes);
    updateNote.mockResolvedValue({ id: 1, title: 'Updated', content: 'New content' });

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText('Original: Original content')).toBeDefined();
    });

    // Click edit and update
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Updated' } });
    fireEvent.click(screen.getByText('Save'));

    // Should show updated immediately (optimistic)
    await waitFor(() => {
      expect(screen.getByText('Updated: New content')).toBeDefined();
    });
  });

  it('reverts on error when update fails', async () => {
    // Test that error handling restores original state
  });
});
```

---

## Implementation Sequence

1. **Phase 1: Backend 400/404 tests** - Modify test_notes.py and test_action_items.py
2. **Phase 2: Concurrency tests** - Create test_transactions.py
3. **Phase 3: Frontend integration tests** - Create new test files

---

## Critical Files

- `backend/tests/test_notes.py` - Add 400/404 validation tests
- `backend/tests/test_action_items.py` - Add 400/404 validation tests
- `backend/tests/test_transactions.py` - New file for concurrency/transaction tests
- `frontend/src/__tests__/NotesList.test.jsx` - Add search and optimistic update tests
- `frontend/src/__tests__/Pagination.test.jsx` - New file for pagination tests
