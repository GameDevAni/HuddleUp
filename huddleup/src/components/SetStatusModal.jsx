import { useState } from 'react';
import pb from '../services/pocketbaseService';

export default function SetStatusModal({ open, onClose, currentStatus, onStatusChange }) {
  const [status, setStatus] = useState(currentStatus || 'available');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      // Update the player's status in PB
      const me = pb.authStore.model;
      await pb.collection('users').update(me.id, { status });
      onStatusChange(status);
      onClose();
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-xs">
        <h3 className="text-lg font-bold mb-4 text-white">Set Your Status</h3>
        <select
          className="w-full p-2 rounded bg-gray-700 text-white mb-4"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
          <option value="injured">Injured</option>
        </select>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
