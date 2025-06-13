// src/components/AddPlayerModal.jsx
import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddPlayerModal({ isOpen, onClose, onInvite }) {
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invite a Player</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form
          onSubmit={async e => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
              await onInvite({ name, email });
              setName('');
              setEmail('');
              onClose();
            } catch (err) {
              setError(err.message || 'Invite failed');
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm mb-1">Player Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Player Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded"
          >
            {loading ? 'Sending…' : 'Send Invite'}
          </button>
        </form>
      </div>
    </div>
  );
}
