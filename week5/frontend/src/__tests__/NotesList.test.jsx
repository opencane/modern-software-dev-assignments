import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotesList from '../components/NotesList';

// Mock the API module
vi.mock('../api', () => ({
  getNotes: vi.fn(),
  createNote: vi.fn(),
  deleteNote: vi.fn(),
  updateNote: vi.fn(),
  searchNotes: vi.fn(),
}));

import { getNotes, createNote, deleteNote, updateNote, searchNotes } from '../api';

describe('NotesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    searchNotes.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<NotesList />);
    expect(screen.getByText('Loading notes...')).toBeDefined();
  });

  it('renders notes after loading', async () => {
    const mockResponse = {
      items: [
        { id: 1, title: 'Test Note', content: 'Test content' },
        { id: 2, title: 'Another Note', content: 'Another content' },
      ],
      total: 2,
      page: 1,
      page_size: 10,
    };
    searchNotes.mockResolvedValue(mockResponse);

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText('Test Note: Test content')).toBeDefined();
      expect(screen.getByText('Another Note: Another content')).toBeDefined();
    });
  });

  it('renders empty state when no notes', async () => {
    searchNotes.mockResolvedValue({ items: [], total: 0, page: 1, page_size: 10 });

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText('No notes found.')).toBeDefined();
    });
  });

  it('renders error message on failure', async () => {
    searchNotes.mockRejectedValue(new Error('Failed to fetch'));

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeDefined();
    });
  });

  it('can create a new note', async () => {
    searchNotes.mockResolvedValue({ items: [], total: 0, page: 1, page_size: 10 });
    createNote.mockResolvedValue({ id: 1, title: 'New', content: 'Note' });

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.queryByText('Loading notes...')).toBeNull();
    });

    const titleInput = screen.getByPlaceholderText('Title');
    const contentInput = screen.getByPlaceholderText('Content');
    const submitButton = screen.getByText('Add');

    fireEvent.change(titleInput, { target: { value: 'New' } });
    fireEvent.change(contentInput, { target: { value: 'Note' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createNote).toHaveBeenCalledWith({ title: 'New', content: 'Note' });
    });
  });

  it('can delete a note', async () => {
    const mockResponse = {
      items: [{ id: 1, title: 'Test', content: 'Content' }],
      total: 1,
      page: 1,
      page_size: 10,
    };
    searchNotes.mockResolvedValue(mockResponse);
    deleteNote.mockResolvedValue(undefined);

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText('Test: Content')).toBeDefined();
    });

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteNote).toHaveBeenCalledWith(1);
    });
  });

  it('shows result count correctly', async () => {
    const mockResponse = {
      items: [{ id: 1, title: 'Test', content: 'Content' }],
      total: 15,
      page: 1,
      page_size: 10,
    };
    searchNotes.mockResolvedValue(mockResponse);

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText('Showing 1 of 15 notes')).toBeDefined();
    });
  });

  it('shows pagination controls when there are multiple pages', async () => {
    const mockResponse = {
      items: [{ id: 1, title: 'Test', content: 'Content' }],
      total: 25,
      page: 1,
      page_size: 10,
    };
    searchNotes.mockResolvedValue(mockResponse);

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeDefined();
      expect(screen.getByText('Previous')).toBeDefined();
      expect(screen.getByText('Next')).toBeDefined();
    });
  });

  it('optimistically deletes note immediately', async () => {
    const mockResponse = {
      items: [
        { id: 1, title: 'Test', content: 'Content' },
        { id: 2, title: 'Another', content: 'More' },
      ],
      total: 2,
      page: 1,
      page_size: 10,
    };
    searchNotes.mockResolvedValue(mockResponse);
    deleteNote.mockResolvedValue(undefined);

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText('Test: Content')).toBeDefined();
      expect(screen.getByText('Another: More')).toBeDefined();
    });

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    // Note should be removed immediately (optimistic)
    await waitFor(() => {
      expect(screen.queryByText('Test: Content')).toBeNull();
      expect(screen.getByText('Another: More')).toBeDefined();
    });

    expect(deleteNote).toHaveBeenCalledWith(1);
  });

  it('rolls back optimistic delete on error', async () => {
    const mockResponse = {
      items: [{ id: 1, title: 'Test', content: 'Content' }],
      total: 1,
      page: 1,
      page_size: 10,
    };
    searchNotes.mockResolvedValue(mockResponse);
    deleteNote.mockRejectedValue(new Error('Delete failed'));

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText('Test: Content')).toBeDefined();
    });

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Note should still be visible after error (rollback)
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeDefined();
      expect(screen.getByText('Test: Content')).toBeDefined();
    });
  });

  it('optimistically updates note immediately', async () => {
    const mockResponse = {
      items: [{ id: 1, title: 'Test', content: 'Content' }],
      total: 1,
      page: 1,
      page_size: 10,
    };
    searchNotes.mockResolvedValue(mockResponse);
    updateNote.mockResolvedValue({ id: 1, title: 'Updated', content: 'New content' });

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText('Test: Content')).toBeDefined();
    });

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Should show edit inputs
    const titleInput = screen.getByDisplayValue('Test');
    const contentInput = screen.getByDisplayValue('Content');

    fireEvent.change(titleInput, { target: { value: 'Updated' } });
    fireEvent.change(contentInput, { target: { value: 'New content' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Note should be updated immediately (optimistic)
    await waitFor(() => {
      expect(screen.getByText('Updated: New content')).toBeDefined();
    });

    expect(updateNote).toHaveBeenCalledWith(1, { title: 'Updated', content: 'New content' });
  });

  it('rolls back optimistic update on error', async () => {
    const mockResponse = {
      items: [{ id: 1, title: 'Original', content: 'Original content' }],
      total: 1,
      page: 1,
      page_size: 10,
    };
    searchNotes.mockResolvedValue(mockResponse);
    updateNote.mockRejectedValue(new Error('Update failed'));

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText('Original: Original content')).toBeDefined();
    });

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    const titleInput = screen.getByDisplayValue('Original');
    const contentInput = screen.getByDisplayValue('Original content');

    fireEvent.change(titleInput, { target: { value: 'Updated' } });
    fireEvent.change(contentInput, { target: { value: 'New content' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Note should show original content after error (rollback)
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeDefined();
      expect(screen.getByText('Original: Original content')).toBeDefined();
    });
  });
});
