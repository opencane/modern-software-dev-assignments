import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotesList from '../components/NotesList';

// Mock the API module
vi.mock('../api', () => ({
  getNotes: vi.fn(),
  createNote: vi.fn(),
  deleteNote: vi.fn(),
}));

import { getNotes, createNote, deleteNote } from '../api';

describe('NotesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    getNotes.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<NotesList />);
    expect(screen.getByText('Loading notes...')).toBeDefined();
  });

  it('renders notes after loading', async () => {
    const mockNotes = [
      { id: 1, title: 'Test Note', content: 'Test content' },
      { id: 2, title: 'Another Note', content: 'Another content' },
    ];
    getNotes.mockResolvedValue(mockNotes);

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText('Test Note: Test content')).toBeDefined();
      expect(screen.getByText('Another Note: Another content')).toBeDefined();
    });
  });

  it('renders empty state when no notes', async () => {
    getNotes.mockResolvedValue([]);

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet.')).toBeDefined();
    });
  });

  it('renders error message on failure', async () => {
    getNotes.mockRejectedValue(new Error('Failed to fetch'));

    render(<NotesList />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeDefined();
    });
  });

  it('can create a new note', async () => {
    getNotes.mockResolvedValue([]);
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
    const mockNotes = [{ id: 1, title: 'Test', content: 'Content' }];
    getNotes.mockResolvedValue(mockNotes);
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
});
