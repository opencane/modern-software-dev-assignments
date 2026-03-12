# Task 4 Plan: Action Items Filters and Bulk Complete

## Overview

This plan implements filtering and bulk operations for action items, following existing patterns in the codebase.

---

## 1. Backend Changes

### 1.1 Add filter query param to GET /action-items

**File: `backend/app/routers/action_items.py`**

Modify the `list_items` function to accept an optional `completed` query parameter:

```python
from typing import Optional

@router.get("/", response_model=list[ActionItemRead])
def list_items(
    completed: Optional[bool] = None,
    db: Session = Depends(get_db)
) -> list[ActionItemRead]:
    query = select(ActionItem)
    if completed is not None:
        query = query.where(ActionItem.completed == completed)
    rows = db.execute(query).scalars().all()
    return [ActionItemRead.model_validate(row) for row in rows]
```

### 1.2 Add bulk-complete endpoint

**File: `backend/app/routers/action_items.py`**

Add new endpoint for bulk operations with transaction support:

```python
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError

class BulkCompleteRequest(BaseModel):
    ids: list[int]

@router.post("/bulk-complete", response_model=list[ActionItemRead])
def bulk_complete_items(
    payload: BulkCompleteRequest,
    db: Session = Depends(get_db)
) -> list[ActionItemRead]:
    try:
        items = []
        for item_id in payload.ids:
            item = db.get(ActionItem, item_id)
            if not item:
                raise HTTPException(
                    status_code=404,
                    detail=f"Action item {item_id} not found"
                )
            item.completed = True
            items.append(item)

        db.commit()  # Commit all changes in single transaction
        return [ActionItemRead.model_validate(item) for item in items]
    except SQLAlchemyError:
        db.rollback()  # Rollback on any error
        raise HTTPException(
            status_code=500,
            detail="Failed to complete items - transaction rolled back"
        )
```

---

## 2. Frontend Changes

### 2.1 Update API client

**File: `frontend/src/api.js`**

Add new API functions:

```javascript
export async function getActionItems(completed = null) {
  const params = completed !== null ? `?completed=${completed}` : '';
  return fetchJSON(`/action-items/${params ? params.slice(0, -1) : ''}`);
}

export async function bulkCompleteActionItems(ids) {
  return fetchJSON('/action-items/bulk-complete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}
```

### 2.2 Update ActionItemsList component

**File: `frontend/src/components/ActionItemsList.jsx`**

Add state for filter and selection:
- Filter state: `null | true | false`
- Selected IDs: Set or array
- Bulk complete handler
- Filter toggle buttons, checkboxes for items, "Complete Selected" button

---

## 3. Backend Tests

**File: `backend/tests/test_action_items.py`**

Add tests for:
- `test_filter_completed_true` - Filter returns only completed items
- `test_filter_completed_false` - Filter returns only incomplete items
- `test_bulk_complete_success` - Bulk complete marks items as complete
- `test_bulk_complete_with_invalid_id` - 404 error for invalid ID
- `test_bulk_complete_transaction_rollback` - Transaction rolls back on error

---

## 4. Frontend Tests

**File: `frontend/src/__tests__/ActionItemsList.test.jsx`**

Add tests for:
- Fetching items with filter when filter is set
- Selecting multiple items and bulk completing

---

## Implementation Sequence

1. **Backend - Filter**: Add query param to existing GET endpoint
2. **Backend - Bulk**: Add bulk-complete endpoint with transaction
3. **Backend - Tests**: Add backend tests for new endpoints
4. **Frontend - API**: Add new API functions
5. **Frontend - Component**: Add filter UI and bulk action UI
6. **Frontend - Tests**: Add frontend tests for new functionality

---

## Potential Challenges

- **Transaction rollback testing**: SQLite in-memory tests may not easily simulate transaction failures
- **Filter state management**: Ensure filter state properly triggers refetch of items
- **Checkbox selection UX**: Handle edge cases like selecting completed items

---

## Critical Files

- `backend/app/routers/action_items.py` - Core logic: add filter parameter and bulk-complete endpoint
- `frontend/src/api.js` - API client: add new functions for filter and bulk complete
- `frontend/src/components/ActionItemsList.jsx` - React component: update with filter toggles and bulk UI
- `backend/tests/test_action_items.py` - Tests for new functionality
