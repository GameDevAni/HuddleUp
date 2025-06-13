// src/pages/TeamPage.jsx

import { useState, useEffect } from 'react';
import { useAuth }            from '../context/AuthContext';
import Layout                 from '../components/Layout';
import AddPlayerModal         from '../components/AddPlayerModal';
import pb                     from '../services/pocketbaseService';
import { MoreVertical }       from 'lucide-react';

export default function TeamPage() {
  const { user }                = useAuth();
  const [team, setTeam]         = useState(null);
  const [players, setPlayers]   = useState([]);
  const [error, setError]       = useState(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  // 1) load just the team record (so we know team.id & team.coach)
  useEffect(() => {
    pb.collection('teams')
      .getFirstListItem(`coach="${user.id}"`)
      .then(t => setTeam(t))
      .catch(err => {
        console.error(err);
        setError('Could not load your team.');
      });
  }, [user.id]);

  // 2) fetch all users whose team field matches team.id
  const fetchRoster = async () => {
    if (!team?.id) return;
    try {
      const list = await pb
        .collection('users')
        .getFullList({          // or getList(page, perPage, {...})
          filter: `team = "${team.id}"`,
          sort:   'name',
        });
      setPlayers(list.filter(p => p.id !== team.coach));
    } catch (err) {
      console.error(err);
      setError('Failed to load roster.');
    }
  };

  // 3) initial roster load + real-time subscription on users
  useEffect(() => {
    fetchRoster();
    if (!team?.id) return;

    const unsub = pb
      .collection('users')
      .subscribe(`team = "${team.id}"`, evt => {
        // on create/update/delete of any matching user, re-fetch:
        fetchRoster();
      });

    return () => {
      if (typeof unsub === 'function') unsub();
      else if (unsub.unsubscribe) unsub.unsubscribe();
    };
  }, [team]);

  // 4) remove a player by clearing their team link
  const handleRemove = async (playerId) => {
    try {
      await pb.collection('users').update(playerId, { team: null });
      // subscription → fetchRoster → UI updates
    } catch (err) {
      console.error(err);
      setError('Could not remove player.');
    }
  };

  if (error) {
    return <Layout><p className="text-red-500">{error}</p></Layout>;
  }
  if (!team) {
    return <Layout><p className="text-gray-400">Loading team…</p></Layout>;
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Your Team</h1>
        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          Add Player
        </button>
      </div>

      <AddPlayerModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={() => { setAddModalOpen(false); fetchRoster(); }}
      />

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-300">Name</th>
              <th className="px-4 py-2 text-left text-gray-300">Position</th>
              <th className="px-4 py-2 text-left text-gray-300">Contact</th>
              <th className="px-4 py-2 text-left text-gray-300">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {players.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-white">{p.name}</td>
                <td className="px-4 py-3 text-gray-200">{p.playing_position}</td>
                <td className="px-4 py-3 text-gray-200">
                  {p.phone || p.email}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.status === 'injured'
                        ? 'text-red-400'
                        : p.status === 'unavailable'
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }
                  >
                    {p.status || 'available'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${p.name}?`)) handleRemove(p.id);
                    }}
                    className="p-1 hover:bg-gray-700 rounded-full"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-gray-400 text-center">
                  No players have joined yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
