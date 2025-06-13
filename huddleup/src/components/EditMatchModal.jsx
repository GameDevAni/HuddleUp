import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EditMatchModal({ isOpen, match, onClose, onSave, onCancelMatch }) {
  const [form, setForm] = useState({
    opponent: '',
    date_time: '',
    location: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  // when match changes, seed the form
  useEffect(() => {
    if (!match) return;
    setForm({
      opponent: match.opponent,
      date_time: match.date_time.slice(0,16), // "YYYY-MM-DDTHH:MM"
      location: match.location,
      notes:    match.notes || '',
    });
    setError(null);
  }, [match]);

  if (!isOpen || !match) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Edit Match Details</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form
          onSubmit={async e => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            try {
              // prepare ISO datetime
              const isoDT = new Date(form.date_time).toISOString();
              await onSave(match.id, { 
                opponent: form.opponent,
                date_time: isoDT,
                location: form.location,
                notes: form.notes,
              });
              onClose();
            } catch (err) {
              setError(err.message || 'Save failed');
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm mb-1 text-gray-200">Opponent</label>
            <input
              type="text"
              value={form.opponent}
              onChange={e => setForm(f => ({ ...f, opponent: e.target.value }))}
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-200">Date & Time</label>
            <input
              type="datetime-local"
              step="1"
              value={form.date_time}
              onChange={e => setForm(f => ({ ...f, date_time: e.target.value }))}
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-200">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-200">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div className="flex justify-between items-center space-x-4">
            <button
              type="button"
              onClick={async () => {
                if (confirm('Cancel this match?')) {
                  await onCancelMatch(match.id);
                  onClose();
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded"
            >
              Cancel Match
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
