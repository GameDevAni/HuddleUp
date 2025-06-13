// src/pages/PlayerMatchesPage.jsx

import { useState, useEffect } from 'react';
import { useAuth }            from '../context/AuthContext';
import PlayerLayout from '../components/PlayerLayout';
import pb                     from '../services/pocketbaseService';
import { Calendar }           from 'lucide-react';

export default function PlayerMatchesPage() {
  const { user } = useAuth();
  const [team,   setTeam]   = useState(null);
  const [matches, setMatches] = useState([]);
  const [rsvps,  setRsvps]  = useState({}); // map: matchId → { id, status }

  // 1) load your team & next 3 matches
  useEffect(() => {
    async function load() {
      // fetch yourself with team expanded
      const me = await pb
        .collection('users')
        .getOne(user.id, { expand: 'team' });
      const t = me.expand.team;
      if (!t) return;
      setTeam(t);

      // fetch upcoming matches for your team
      const now = new Date().toISOString();
      const upcoming = await pb
        .collection('matches')
        .getFullList({
          filter: `team="${t.id}" && date_time >= "${now}"`,
          sort:   'date_time',
          limit:  3,
        });
      setMatches(upcoming);

      // fetch your RSVP records for those matches
      const responses = await pb
        .collection('match_responses')
        .getFullList({
          filter: `player="${user.id}"`,
        });
      // build a map for quick lookup
      const map = {};
      responses.forEach(r => {
        map[r.match] = { id: r.id, status: r.status };
      });
      setRsvps(map);
    }
    load();
  }, [user.id]);

  // 2) handle RSVP click
  const handleRsvp = async (matchId, choice) => {
    const existing = rsvps[matchId];
    try {
      if (existing) {
        // update the existing response
        await pb
          .collection('match_responses')
          .update(existing.id, { status: choice });
        setRsvps(m => ({
          ...m,
          [matchId]: { ...existing, status: choice }
        }));
      } else {
        // create a new RSVP
        const rec = await pb
          .collection('match_responses')
          .create({
            match:  matchId,
            player: user.id,
            status: choice,
          });
        setRsvps(m => ({
          ...m,
          [matchId]: { id: rec.id, status: choice }
        }));
      }
    } catch (err) {
      console.error('RSVP failed:', err);
    }
  };

  return (
    <PlayerLayout>
      <h1 className="text-3xl font-bold text-white mb-6">
        Your Matches
      </h1>

      <div className="space-y-6">
        {matches.length === 0 ? (
          <p className="text-gray-400">No upcoming matches.</p>
        ) : (
          matches.map(m => (
            <div
              key={m.id}
              className="bg-gray-800 p-6 rounded-lg border border-gray-700"
            >
              {/* Match info */}
              <p className="text-xl font-semibold text-white mb-1">
                vs {m.opponent}
              </p>
              <p className="text-gray-400 text-sm flex items-center mb-4">
                <Calendar className="w-5 h-5 mr-2" />
                {new Date(m.date_time).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
                {' '}at{' '}
                {new Date(m.date_time).toLocaleTimeString(undefined, {
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>

              {/* RSVP buttons */}
              <div className="flex space-x-3">
                {['confirmed', 'declined'].map(choice => {
                  const label = choice === 'confirmed' ? 'Confirm' : 'Decline';
                  const isActive = rsvps[m.id]?.status === choice;
                  return (
                    <button
                      key={choice}
                      onClick={() => handleRsvp(m.id, choice)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        isActive
                          ? choice === 'confirmed'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </PlayerLayout>
  );
}

