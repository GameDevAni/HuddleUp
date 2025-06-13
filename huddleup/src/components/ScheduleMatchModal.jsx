import { useState } from 'react';
import { X } from 'lucide-react';

export default function ScheduleMatchModal({ isOpen, onClose, onSchedule }) {
  const [form, setForm] = useState({
    opponent: '',
    date_time: '',
    location: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Schedule a Match</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form
          onSubmit={async e => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            try {
              await onSchedule(form);
              setForm({ opponent: '', date_time: '', location: '', notes: '' });
              onClose();
            } catch (err) {
              setError(err.message || 'Failed to schedule match');
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm mb-1">Opponent</label>
            <input
              type="text"
              value={form.opponent}
              onChange={e => setForm(f => ({ ...f, opponent: e.target.value }))}
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Date & Time</label>
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
            <label className="block text-sm mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-blue-700 text-white p-2 rounded"
          >
            {loading ? 'Scheduling…' : 'Schedule Match'}
          </button>
        </form>
      </div>
    </div>
  );
}
