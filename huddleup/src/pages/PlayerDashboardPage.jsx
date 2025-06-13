// src/pages/PlayerDashboardPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PlayerLayout from '../components/PlayerLayout';
import pb from '../services/pocketbaseService';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Home,
  MessageSquare,
  Bell,
  Mail,
} from 'lucide-react';

export default function PlayerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [coach, setCoach] = useState(null);
  const [matches, setMatches] = useState([]);
  const [rsvps, setRsvps] = useState({}); // matchId → status
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // 1) re-fetch fresh user to get team
        const me = await pb.collection('users').getOne(user.id);
        if (!me.team) {
          setTeam(null);
          return;
        }
        // 2) fetch team + coach
        const t = await pb
          .collection('teams')
          .getOne(me.team, { expand: 'coach' });
        setTeam(t);
        setCoach(t.expand.coach);

        // 3) fetch upcoming matches
        const now = new Date().toISOString();
        const upcoming = await pb
          .collection('matches')
          .getFullList({
            filter: `team="${t.id}" && date_time >= "${now}"`,
            sort: 'date_time',
            limit: 3,
          });
        setMatches(upcoming);

        // 4) fetch your RSVPs for those matches
        const matchIds = upcoming.map(m => m.id);
        let rsvps = {};
        if (matchIds.length > 0) {
          const resp = await pb.collection('match_responses').getFullList({
            filter: `player="${me.id}" && match~"${matchIds.join('" || match~"')}"`,
          });
          // Map: matchId -> status
          resp.forEach(r => { rsvps[r.match] = r.status; });
        }
        setRsvps(rsvps);
      } catch (err) {
        console.error('PlayerDashboard load error', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user.id]);

  if (loading) {
    return (
      <PlayerLayout>
        <p className="text-gray-400">Loading your dashboard…</p>
      </PlayerLayout>
    );
  }
  return (
    <PlayerLayout>
      <h1 className="text-3xl font-bold text-white mb-6">Player Dashboard</h1>

      {/* Team Snapshot */}
      {team && coach && (
        <div className="mb-8 bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="space-y-2 mb-4 md:mb-0">
            <h2 className="text-2xl font-semibold text-white">{team.team_name}</h2>
            <p className="text-gray-300">Coach:</p>
            <p className="text-white font-medium">{coach.name}</p>
            <p className="text-gray-400">{coach.email}</p>
            <button
              onClick={() => (window.location = `mailto:${coach.email}`)}
              className="mt-2 inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Coach
            </button>
          </div>
          <div className="text-right">
            <p className="text-gray-300 text-sm">Team Code</p>
            <code className="block bg-gray-900 px-3 py-2 rounded mt-1 font-mono text-lg text-purple-400">
              {team.team_code}
            </code>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Upcoming Matches</p>
            <p className="text-3xl font-bold text-white">{matches.length}</p>
          </div>
          <Calendar className="w-8 h-8 text-blue-500" />
        </div>



        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">New Messages</p>
            <p className="text-3xl font-bold text-white">—</p>
          </div>
          <MessageSquare className="w-8 h-8 text-orange-500" />
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Notifications</p>
            <p className="text-3xl font-bold text-white">—</p>
          </div>
          <Bell className="w-8 h-8 text-red-500" />
        </div>
      </div>

      {/* Upcoming Matches List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Upcoming Matches</h2>
        </div>
        <div className="space-y-4">
          {matches.length === 0 && (
            <p className="text-gray-400">No upcoming matches.</p>
          )}
          {matches.map(m => (
            <div
              key={m.id}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0"
            >
              <div>
                <p className="text-lg font-medium text-white">vs {m.opponent}</p>
                <p className="text-gray-400 text-sm flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(m.date_time).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}{' '}
                    @{' '}
                    {new Date(m.date_time).toLocaleTimeString(undefined, {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </p>
              </div>
              <button
                onClick={() => navigate('/player/matches')}
                className="mt-2 md:mt-0 inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >
                Go RSVP
              </button>
            </div>
          ))}


        </div>
      </div>
    </PlayerLayout>
  );
}
