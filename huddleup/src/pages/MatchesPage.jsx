import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import pb from '../services/pocketbaseService';

export default function MatchesPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [form, setForm] = useState({
    opponent: '',
    date_time: '',
    location: '',
    notes: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1) load coach’s team
  useEffect(() => {
    pb.collection('teams')
      .getFirstListItem(`coach="${user.id}"`)
      .then(setTeam)
      .catch(console.error);
  }, [user.id]);

  // 2) load upcoming matches once team is set
  useEffect(() => {
    if (!team) return;
    pb.collection('matches')
      .getFullList({
        filter: `team="${team.id}" && date_time >= "${new Date().toISOString()}"`,
        sort: 'date_time',
      })
      .then(setMatches)
      .catch(console.error);
  }, [team]);

  // 3) handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {

      // ① Convert to full ISO timestamp
      const isoDate = new Date(form.date_time).toISOString();
      console.log('🗓️ Creating match with date_time =', isoDate);

      await pb.collection('matches').create({
        team:      team.id,
        opponent:  form.opponent,
        date_time: isoDate,
        location:  form.location,
        notes:     form.notes,
      });
      // reload list
      const list = await pb.collection('matches').getFullList({
        filter: `team="${team.id}" && date_time >= "${new Date().toISOString()}"`,
        sort: 'date_time',
      });
      setMatches(list);
      // clear form
      setForm({ opponent: '', date_time: '', location: '', notes: '' });
    } catch (err) {
      console.error(err);
      setError('Failed to schedule match.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Schedule a Match</h1>

      <form 
        onSubmit={handleSubmit} 
        className="bg-gray-800 p-6 rounded-lg mb-8 space-y-4 border border-gray-700"
      >
        {error && <p className="text-red-500">{error}</p>}

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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? 'Scheduling…' : 'Schedule Match'}
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">Upcoming Matches</h2>
      <div className="space-y-4">
        {matches.map(m => (
          <div 
            key={m.id} 
            className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-center"
          >
            <div>
              <p className="text-lg font-medium">{m.opponent}</p>
              <p className="text-gray-400 text-sm">
                {new Date(m.date_time).toLocaleString()} @ {m.location}
              </p>
              {m.notes && <p className="text-gray-300 text-sm mt-1">{m.notes}</p>}
            </div>
          </div>
        ))}
        {matches.length === 0 && (
          <p className="text-gray-400">No upcoming matches scheduled.</p>
        )}
      </div>
    </Layout>
  );
}
