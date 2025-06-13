// src/pages/PlayerTeamPage.jsx
import { useState, useEffect } from 'react';
import { useAuth }            from '../context/AuthContext';
import PlayerLayout           from '../components/PlayerLayout';
import pb                     from '../services/pocketbaseService';

export default function PlayerTeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!user?.team) {
      setError("You haven't joined a team yet.");
      setLoading(false);
      return;
    }

    let subscription;

    async function loadMembers() {
      setLoading(true);
      try {
        const list = await pb
          .collection('users')
          .getFullList({
            filter: `team="${user.team}"`,
            sort:   'name',
          });
        setMembers(list);
        setError('');
      } catch (err) {
        console.error('PlayerTeamPage.loadMembers error', err);
        setError('Could not load your team members.');
      } finally {
        setLoading(false);
      }
    }

    loadMembers();

    subscription = pb
      .collection('users')
      .subscribe(`team="${user.team}"`, loadMembers);

    return () => {
      // guard against undefined
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [user.team]);

  if (loading) {
    return (
      <PlayerLayout>
        <p className="text-gray-400">Loading your team…</p>
      </PlayerLayout>
    );
  }

  if (error) {
    return (
      <PlayerLayout>
        <p className="text-red-500">{error}</p>
      </PlayerLayout>
    );
  }

  // split into coach vs. players
  const coach   = members.find(m => m.role === 'coach');
  const players = members.filter(m => m.role === 'player');

  return (
    <PlayerLayout>
      <h1 className="text-3xl font-bold mb-6 text-white">Your Team</h1>

      {coach && (
        <div className="mb-6 bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-semibold text-white">
              {coach.team_name || 'Team'}
            </h2>
            <p className="text-gray-300">Coach:</p>
            <p className="text-white font-medium">{coach.name}</p>
            <p className="text-gray-400">{coach.email}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-300 text-sm">Team Code</p>
            <code className="block bg-gray-900 px-3 py-2 rounded mt-1 font-mono text-lg text-purple-400">
              {user.team}
            </code>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-300">Name</th>
              <th className="px-4 py-2 text-left text-gray-300">Position</th>
              <th className="px-4 py-2 text-left text-gray-300">Status</th>
              <th className="px-4 py-2 text-left text-gray-300">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {players.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-white">{p.name}</td>
                <td className="px-4 py-3 text-gray-200">{p.playing_position || '-'}</td>
                <td className="px-4 py-3">
                  <span className={
                    p.status === 'injured'     ? 'text-red-400'   :
                    p.status === 'unavailable' ? 'text-yellow-400':
                                                 'text-green-400'
                  }>
                    {p.status || 'active'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-200">{p.phone || p.email || '-'}</td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-gray-400 text-center">
                  No teammates have joined yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PlayerLayout>
  );
}
