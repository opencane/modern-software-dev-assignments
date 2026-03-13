import { useState, useEffect } from 'react';
import { getNotes, createNote, deleteNote, searchNotes, updateNote } from '../api';

function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState('created_desc');
  const [totalNotes, setTotalNotes] = useState(0);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchNotes(searchQuery, currentPage, pageSize, sortBy);
      setNotes(data.items);
      setTotalNotes(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [currentPage, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  // Also re-fetch when searchQuery changes (debounced via submit)
  useEffect(() => {
    // This is handled by handleSearchSubmit
  }, [searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setError(null);
      await createNote({ title, content });
      setTitle('');
      setContent('');
      fetchNotes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    // Optimistic delete: store current notes for rollback
    const previousNotes = [...notes];

    // Immediately remove note from state
    setNotes(notes.filter(note => note.id !== id));
    setTotalNotes(totalNotes - 1);
    setError(null);

    try {
      await deleteNote(id);
    } catch (err) {
      // Rollback on error
      setNotes(previousNotes);
      setTotalNotes(previousNotes.length);
      setError(err.message);
    }
  };

  const handleEditStart = (note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleEditSave = async (id) => {
    if (!editTitle.trim() || !editContent.trim()) return;

    // Optimistic update: store previous state for rollback
    const previousNotes = [...notes];

    // Immediately update note in state
    setNotes(notes.map(note =>
      note.id === id ? { ...note, title: editTitle, content: editContent } : note
    ));
    setError(null);
    setEditingId(null);

    try {
      await updateNote(id, { title: editTitle, content: editContent });
    } catch (err) {
      // Rollback on error
      setNotes(previousNotes);
      setError(err.message);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchNotes();
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset to first page on sort change
  };

  const totalPages = Math.ceil(totalNotes / pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return <p>Loading notes...</p>;
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">Add</button>
      </form>

      {/* Search and Sort Controls */}
      <div style={{ margin: '1rem 0' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'inline' }}>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <select value={sortBy} onChange={handleSortChange} style={{ marginLeft: '0.5rem' }}>
          <option value="created_desc">Newest</option>
          <option value="created_asc">Oldest</option>
          <option value="title_asc">Title A-Z</option>
          <option value="title_desc">Title Z-A</option>
        </select>
      </div>

      {/* Result count */}
      <p>Showing {notes.length} of {totalNotes} notes</p>

      {notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              {editingId === note.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Content"
                  />
                  <button onClick={() => handleEditSave(note.id)}>Save</button>
                  <button onClick={handleEditCancel} style={{ marginLeft: '0.5rem' }}>Cancel</button>
                </>
              ) : (
                <>
                  {note.title}: {note.content}
                  <button
                    onClick={() => handleEditStart(note)}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span style={{ margin: '0 0.5rem' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default NotesList;
