// src/pages/PlayerMatchesPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PlayerLayout from '../components/PlayerLayout';
import pb from '../services/pocketbaseService';
import { Calendar } from 'lucide-react';

export default function PlayerMatchesPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [rsvps, setRsvps] = useState({}); // { [matchId]: { id, status } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1) Load team, upcoming matches, and any existing RSVPs
  useEffect(() => {
    async function loadData() {
      try {
        // a) load your player record & expand team
        const me = await pb
          .collection('users')
          .getOne(user.id, { expand: 'team' });
        const t = me.expand.team;
        if (!t) {
          setError('You have not joined a team yet.');
          setLoading(false);
          return;
        }
        setTeam(t);

        // b) fetch next 3 upcoming matches for your team
        const now = new Date().toISOString();
        const upcoming = await pb
          .collection('matches')
          .getFullList({
            filter: `team="${t.id}" && date_time >= "${now}"`,
            sort: 'date_time',
            limit: 3,
          });
        setMatches(upcoming);

        // c) load your RSVPs for these matches
        //    we fetch all your responses, then pick out the ones we need
        const responses = await pb
          .collection('match_responses')
          .getFullList({
            filter: `player="${user.id}" && match = "${upcoming.map(m => m.id).join(',')}"`
          });

        const map = {};
        responses.forEach(r => {
          map[r.match] = { id: r.id, status: r.status };
        });
        setRsvps(map);
      } catch (err) {
        console.error('Failed to load matches or RSVPs:', err);
        setError('Could not load your matches. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user.id]);

  // 2) RSVP handler: create or update your response
  const handleRsvp = async (matchId, choice) => {
    try {
      const existing = rsvps[matchId];
      if (existing) {
        // Update the existing match_responses record
        await pb
          .collection('match_responses')
          .update(existing.id, { status: choice });
        setRsvps(m => ({
          ...m,
          [matchId]: { ...existing, status: choice }
        }));
      } else {
        // Create a new match_responses record
        const rec = await pb
          .collection('match_responses')
          .create({
            match: matchId,
            player: user.id,
            status: choice,
          });
        setRsvps(m => ({
          ...m,
          [matchId]: { id: rec.id, status: rec.status }
        }));
      }
    } catch (err) {
      console.error('RSVP error:', err);
      console.error('Status field error:', err.data?.status);
    }
  };

  if (loading) {
    return (
      <PlayerLayout>
        <p className="text-gray-400">Loading your matches…</p>
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

  return (
    <PlayerLayout>
      <h1 className="text-3xl font-bold text-white mb-6">Your Upcoming Matches</h1>
      <div className="space-y-6">
        {matches.length === 0 && (
          <p className="text-gray-400">No upcoming matches.</p>
        )}
        {matches.map(m => {
          const resp = rsvps[m.id]?.status;
          return (
            <div
              key={m.id}
              className="bg-gray-800 p-6 rounded-lg border border-gray-700"
            >
              <p className="text-xl font-semibold text-white mb-1">
                vs {m.opponent}
              </p>
              <p className="text-gray-400 text-sm flex items-center mb-4">
                <Calendar className="w-5 h-5 mr-2" />
                {new Date(m.date_time).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                @{' '}
                {new Date(m.date_time).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>

              <div className="flex space-x-3">
                {[
                  { key: 'Confirmed', label: '✅ Confirm', color: 'green' },
                  { key: 'Declined', label: '❌ Decline', color: 'red' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleRsvp(m.id, opt.key)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${resp === opt.key
                      ? opt.color === 'green'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PlayerLayout>
  );
}
