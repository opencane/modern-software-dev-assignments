from __future__ import annotations

import logging
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Generator, Optional

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "app.db"


class DatabaseError(Exception):
    """Base exception for database errors."""
    pass


class NotFoundError(DatabaseError):
    """Raised when a resource is not found."""
    pass


def ensure_data_directory_exists() -> None:
    """Ensure the data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


@contextmanager
def get_connection() -> Generator[sqlite3.Connection, None, None]:
    """Get a database connection with proper cleanup."""
    ensure_data_directory_exists()
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
    except sqlite3.Error as e:
        logger.error(f"Database error: {e}")
        connection.rollback()
        raise DatabaseError(f"Database operation failed: {e}") from e
    finally:
        connection.close()


def init_db() -> None:
    """Initialize the database with required tables."""
    ensure_data_directory_exists()
    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS action_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_id INTEGER,
                text TEXT NOT NULL,
                done INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (note_id) REFERENCES notes(id)
            );
            """
        )
        connection.commit()
        logger.info("Database initialized successfully")


def insert_note(content: str) -> int:
    """Insert a new note and return its ID."""
    if not content or not content.strip():
        raise ValueError("Note content cannot be empty")

    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute("INSERT INTO notes (content) VALUES (?)", (content.strip(),))
        connection.commit()
        note_id = int(cursor.lastrowid)
        logger.info(f"Created note with id: {note_id}")
        return note_id


def list_notes() -> list[dict]:
    """List all notes ordered by ID descending."""
    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute("SELECT id, content, created_at FROM notes ORDER BY id DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_note(note_id: int) -> Optional[dict]:
    """Get a note by ID."""
    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute(
            "SELECT id, content, created_at FROM notes WHERE id = ?",
            (note_id,),
        )
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def delete_note(note_id: int) -> bool:
    """Delete a note by ID. Returns True if deleted, False if not found."""
    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        connection.commit()
        deleted = cursor.rowcount > 0
        if deleted:
            logger.info(f"Deleted note with id: {note_id}")
        return deleted


def insert_action_items(items: list[str], note_id: Optional[int] = None) -> list[int]:
    """Insert action items and return their IDs."""
    if not items:
        return []

    with get_connection() as connection:
        cursor = connection.cursor()
        ids: list[int] = []
        for item in items:
            if not item or not item.strip():
                continue
            cursor.execute(
                "INSERT INTO action_items (note_id, text) VALUES (?, ?)",
                (note_id, item.strip()),
            )
            ids.append(int(cursor.lastrowid))
        connection.commit()
        logger.info(f"Created {len(ids)} action items for note_id: {note_id}")
        return ids


def list_action_items(note_id: Optional[int] = None) -> list[dict]:
    """List action items, optionally filtered by note_id."""
    with get_connection() as connection:
        cursor = connection.cursor()
        if note_id is None:
            cursor.execute(
                "SELECT id, note_id, text, done, created_at FROM action_items ORDER BY id DESC"
            )
        else:
            cursor.execute(
                "SELECT id, note_id, text, done, created_at FROM action_items WHERE note_id = ? ORDER BY id DESC",
                (note_id,),
            )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_action_item(action_item_id: int) -> Optional[dict]:
    """Get an action item by ID."""
    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute(
            "SELECT id, note_id, text, done, created_at FROM action_items WHERE id = ?",
            (action_item_id,),
        )
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def mark_action_item_done(action_item_id: int, done: bool) -> bool:
    """Mark an action item as done/undone. Returns True if updated, False if not found."""
    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute(
            "UPDATE action_items SET done = ? WHERE id = ?",
            (1 if done else 0, action_item_id),
        )
        connection.commit()
        updated = cursor.rowcount > 0
        if updated:
            logger.info(f"Marked action item {action_item_id} as done={done}")
        return updated
