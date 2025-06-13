// src/components/EditProfileModal.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import pb from '../services/pocketbaseService';

export default function EditProfileModal({ open, onClose }) {
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const u = pb.authStore.record || {};
    setPhone(u.phone || '');
    setPosition(u.playing_position || '');
    setError('');
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await pb
        .collection('users')
        .update(pb.authStore.record.id, {
          phone,
          playing_position: position,
        });

      // 2) re-fetch the FULL user record (including role, team, etc)
      const fullUser = await pb
        .collection('users')
        .getOne(pb.authStore.record.id);

      // 3) save the full record back into authStore
      pb.authStore.save(fullUser, pb.authStore.token);
      // store it in authStore so your UI updates:
      pb.authStore.save(updated, pb.authStore.token);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.data?.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-semibold text-white mb-4">Edit Profile</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Position</label>
            <input
              type="text"
              value={position}
              onChange={e => setPosition(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white font-medium transition ${loading ? 'bg-gray-600' : 'bg-purple-600 hover:bg-purple-700'
              }`}
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
