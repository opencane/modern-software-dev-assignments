# Task 9 Plan: Query Performance and Indexes

## Context

Task 9 requires adding SQLite indexes to improve query performance, particularly for search operations on notes. The plan addresses both the current needs and future requirements from Task 5 (tags feature).

---

## Phase 1: Add Indexes to Note Model

### Update `backend/app/models.py`

Add `index=True` to columns or use explicit `Index` objects:

```python
# Option A: Simple approach
title = Column(String(200), nullable=False, index=True)
content = Column(Text, nullable=False, index=True)

# Option B: Explicit index (recommended)
class Note(Base):
    __tablename__ = "notes"
    __table_args__ = (
        Index('ix_notes_title', 'title'),
        Index('ix_notes_content', 'content'),
    )
```

---

## Phase 2: Add Indexes for Tags Join Table

When Task 5 is implemented, add indexes for the `note_tags` join table:

```python
# In the note_tags association table (when created in Task 5)
__table_args__ = (
    Index('ix_note_tags_note_id', 'note_id'),
    Index('ix_note_tags_tag_id', 'tag_id'),
    Index('ix_note_tags_note_id_tag_id', 'note_id', 'tag_id'),
)
```

---

## Phase 3: Add Indexes for ActionItems

Add index on `completed` column for filtering:

```python
class ActionItem(Base):
    # ... existing columns
    __table_args__ = (
        Index('ix_action_items_completed', 'completed'),
    )
```

---

## Phase 4: Verify Improved Query Plans

Create a verification script or test to check query plans:

```python
# Example verification in test
def test_query_plan_uses_index():
    result = session.execute(text(
        "EXPLAIN QUERY PLAN SELECT * FROM notes WHERE title LIKE '%test%'"
    ))
    plan = str(result.fetchall())
    assert 'ix_notes_title' in plan  # Should use the index
```

---

## Phase 5: Add Performance Tests with Larger Datasets

Add new test file or extend existing tests:

```python
@pytest.fixture
def large_dataset(db):
    """Seed database with 1000 notes for performance testing."""
    notes = [
        Note(title=f"Note {i}", content=f"Content {i}")
        for i in range(1000)
    ]
    db.add_all(notes)
    db.commit()

def test_search_performance_with_index(large_dataset, db):
    """Verify search completes in reasonable time with index."""
    import time
    start = time.time()
    results = db.execute(
        select(Note).where(Note.title.contains("Note 500"))
    ).scalars().all()
    elapsed = time.time() - start
    assert elapsed < 1.0  # Should complete within 1 second
    assert len(results) > 0
```

---

## Phase 6: Update Database Seed

**File: `data/seed.sql`**

Add index creation statements:

```sql
CREATE INDEX IF NOT EXISTS ix_notes_title ON notes(title);
CREATE INDEX IF NOT EXISTS ix_notes_content ON notes(content);
CREATE INDEX IF NOT EXISTS ix_action_items_completed ON action_items(completed);
```

---

## File Changes Required

1. `backend/app/models.py` - Add index definitions to Note and ActionItem models
2. `backend/tests/test_notes.py` - Add query plan verification and performance tests
3. `data/seed.sql` - Add index creation for production database

---

## Verification Steps

1. Run `make test` to ensure all existing tests pass
2. Verify query plans show index usage (should see `SEARCH` instead of `SCAN`)
3. Performance test should show search completes within acceptable time

---

## Critical Files

- `backend/app/models.py` - Core logic to modify: add index definitions
- `backend/tests/test_notes.py` - Tests to extend: add query plan and performance tests
- `data/seed.sql` - Schema to update: add index creation for existing databases
- `backend/app/db.py` - Database configuration for reference
- `backend/tests/conftest.py` - Test fixture patterns to follow
