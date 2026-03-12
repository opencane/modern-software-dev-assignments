import { useState, useEffect } from 'react';
import { getActionItems, createActionItem, completeActionItem, deleteActionItem } from '../api';

function ActionItemsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [description, setDescription] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActionItems();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setError(null);
      await createActionItem({ description });
      setDescription('');
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleComplete = async (id) => {
    try {
      setError(null);
      await completeActionItem(id);
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError(null);
      await deleteActionItem(id);
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p>Loading action items...</p>;
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit">Add</button>
      </form>

      {items.length === 0 ? (
        <p>No action items yet.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.description} [{item.completed ? 'done' : 'open'}]
              {!item.completed && (
                <button
                  onClick={() => handleComplete(item.id)}
                  style={{ marginLeft: '0.5rem' }}
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => handleDelete(item.id)}
                style={{ marginLeft: '0.5rem' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ActionItemsList;
