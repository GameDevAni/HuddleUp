// src/pages/PlayerTeamPage.jsx

import { useState, useEffect } from 'react';
import { useAuth }            from '../context/AuthContext';
import PlayerLayout from '../components/PlayerLayout';
import pb                     from '../services/pocketbaseService';
import { Mail }               from 'lucide-react';

export default function PlayerTeamPage() {
  const { user }    = useAuth();
  const [team,      setTeam]    = useState(null);
  const [players,   setPlayers] = useState([]);
  const [coach,     setCoach]   = useState(null);
  const [error,     setError]   = useState(null);

  // load initial roster + coach
  useEffect(() => {
    async function loadRoster() {
      try {
        const me = await pb
          .collection('users')
          .getOne(user.id, {
            expand: 'team,team.players,team.coach'
          });
        const t = me.expand.team;
        setTeam(t);
        setPlayers(t?.expand.players || []);
        setCoach(t?.expand.coach || null);
      } catch (err) {
        console.error('Failed to load team:', err);
        setError('Could not load your team.');
      }
    }
    loadRoster();
  }, [user.id]);

  // subscribe to live roster updates
  useEffect(() => {
    if (!team?.id) return;
    const sub = pb
      .collection('teams')
      .subscribe(`id = "${team.id}"`, e => {
        if (e.action === 'update' && e.record.expand?.players) {
          setPlayers(e.record.expand.players);
        }
      });
    return () => {
      if (typeof sub === 'function') sub();
      else if (sub?.unsubscribe) sub.unsubscribe();
    };
  }, [team]);

  if (error) {
    return (
      <PlayerLayout>
        <p className="text-red-500">{error}</p>
      </PlayerLayout>
    );
  }
  if (!team) {
    return (
      <PlayerLayout>
        <p className="text-gray-400">Loading your team…</p>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout>
      <h1 className="text-3xl font-bold text-white mb-6">Team Roster</h1>

      {/* Coach Contact */}
      {coach && (
        <div className="mb-6 bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-gray-300">Coach</p>
            <h2 className="text-xl text-white font-semibold">{coach.name}</h2>
            <p className="text-gray-400">{coach.email}</p>
          </div>
          <button
            onClick={() => window.location = `mailto:${coach.email}`}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            <Mail className="w-4 h-4 inline-block mr-1" />
            Email
          </button>
        </div>
      )}

      {/* Player Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-300">Name</th>
              <th className="px-4 py-2 text-left text-gray-300">Position</th>
              <th className="px-4 py-2 text-left text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {players.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-white">{p.name}</td>
                <td className="px-4 py-3 text-gray-200">{p.playing_position}</td>
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
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-gray-400 text-center">
                  No teammates yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PlayerLayout>
  );
}
