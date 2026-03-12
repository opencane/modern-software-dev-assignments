import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActionItemsList from '../components/ActionItemsList';

// Mock the API module
vi.mock('../api', () => ({
  getActionItems: vi.fn(),
  createActionItem: vi.fn(),
  completeActionItem: vi.fn(),
  deleteActionItem: vi.fn(),
}));

import { getActionItems, createActionItem, completeActionItem, deleteActionItem } from '../api';

describe('ActionItemsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    getActionItems.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<ActionItemsList />);
    expect(screen.getByText('Loading action items...')).toBeDefined();
  });

  it('renders action items after loading', async () => {
    const mockItems = [
      { id: 1, description: 'Task 1', completed: false },
      { id: 2, description: 'Task 2', completed: true },
    ];
    getActionItems.mockResolvedValue(mockItems);

    render(<ActionItemsList />);

    await waitFor(() => {
      expect(screen.getByText('Task 1 [open]')).toBeDefined();
      expect(screen.getByText('Task 2 [done]')).toBeDefined();
    });
  });

  it('renders empty state when no items', async () => {
    getActionItems.mockResolvedValue([]);

    render(<ActionItemsList />);

    await waitFor(() => {
      expect(screen.getByText('No action items yet.')).toBeDefined();
    });
  });

  it('renders error message on failure', async () => {
    getActionItems.mockRejectedValue(new Error('Failed to fetch'));

    render(<ActionItemsList />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeDefined();
    });
  });

  it('can create a new action item', async () => {
    getActionItems.mockResolvedValue([]);
    createActionItem.mockResolvedValue({ id: 1, description: 'New Task', completed: false });

    render(<ActionItemsList />);

    await waitFor(() => {
      expect(screen.queryByText('Loading action items...')).toBeNull();
    });

    const input = screen.getByPlaceholderText('Description');
    const submitButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createActionItem).toHaveBeenCalledWith({ description: 'New Task' });
    });
  });

  it('can complete an action item', async () => {
    const mockItems = [{ id: 1, description: 'Task', completed: false }];
    getActionItems.mockResolvedValue(mockItems);
    completeActionItem.mockResolvedValue({ id: 1, description: 'Task', completed: true });

    render(<ActionItemsList />);

    await waitFor(() => {
      expect(screen.getByText('Task [open]')).toBeDefined();
    });

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(completeActionItem).toHaveBeenCalledWith(1);
    });
  });

  it('can delete an action item', async () => {
    const mockItems = [{ id: 1, description: 'Task', completed: false }];
    getActionItems.mockResolvedValue(mockItems);
    deleteActionItem.mockResolvedValue(undefined);

    render(<ActionItemsList />);

    await waitFor(() => {
      expect(screen.getByText('Task [open]')).toBeDefined();
    });

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteActionItem).toHaveBeenCalledWith(1);
    });
  });

  it('does not show Complete button for completed items', async () => {
    const mockItems = [{ id: 1, description: 'Task', completed: true }];
    getActionItems.mockResolvedValue(mockItems);

    render(<ActionItemsList />);

    await waitFor(() => {
      expect(screen.getByText('Task [done]')).toBeDefined();
    });

    expect(screen.queryByText('Complete')).toBeNull();
  });
});
