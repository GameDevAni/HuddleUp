// src/pages/CoachDashboardPage.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import pb from '../services/pocketbaseService';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  Users,
  Calendar,
  MessageSquare,
  Bell,
  Trophy,
  Copy,
  Check,
} from 'lucide-react';

export default function CoachDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    upcomingMatches: 0,
    newMessages: 0,
    notifications: 0,
  });
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [copied, setCopied] = useState(false);

  // 1) Load team record & initial upcoming matches
  useEffect(() => {
    async function loadTeamAndMatches() {
      try {
        // a) fetch your team
        const t = await pb
          .collection('teams')
          .getFirstListItem(`coach="${user.id}"`);
        setTeam(t);

        // b) fetch your next 3 upcoming matches
        const now = new Date().toISOString();
        let matches = await pb
          .collection('matches')
          .getFullList({
            filter: `team="${t.id}" && date_time >= "${now}"`,
            sort: 'date_time',
            limit: 3,
          });

        // 4) for each match, fetch the count of confirmed RSVPs
        matches = await Promise.all(matches.map(async (m) => {
          // fetch every RSVP for this match
          const responses = await pb
            .collection('match_responses')
            .getFullList({
              filter: `match="${m.id}"`,
              sort: 'created',     // optional
            });

          // DEBUG: inspect what you actually got
          console.log('match_responses for', m.id, responses);

          // manually count the ones whose status equals your PB option value
          const confirmedCount = responses.filter(r => r.status === 'Confirmed').length;

          return {
            ...m,
            confirmedCount,
          };
        }));

        setUpcomingMatches(matches);

        setUpcomingMatches(matches);
        setStats(s => ({ ...s, upcomingMatches: matches.length }));
      } catch (err) {
        console.error('Dashboard load error:', err);
      }
    }
    loadTeamAndMatches();
  }, [user.id]);

  // 2) Load roster & subscribe to live updates (for Total Players)
  useEffect(() => {
    if (!team?.id) return;

    // helper to fetch current roster
    async function fetchRoster() {
      const list = await pb
        .collection('users')
        .getFullList({
          filter: `team = "${team.id}"`,
          sort: 'name',
        });
      // exclude the coach themselves:
      const roster = list.filter(u => u.id !== user.id);
      setPlayers(roster);
      setStats(s => ({ ...s, totalPlayers: roster.length }));
    }

    fetchRoster();

    const sub = pb
      .collection('users')
      .subscribe(`team = "${team.id}"`, () => {
        fetchRoster();
      });

    return () => {
      if (typeof sub === 'function') sub();
      else if (sub.unsubscribe) sub.unsubscribe();
    };
  }, [team, user.id]);

  // 3) copy code helper
  const copyTeamCode = () => {
    if (!team?.team_code) return;
    navigator.clipboard.writeText(team.team_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      </div>

      {/* Team Code Card */}
      {team && (
        <div className="mb-8 bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{team.team_name}</h2>
              <div className="mt-1 flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-600">
                <code className="text-purple-400 font-mono text-lg tracking-wider">
                  {team.team_code}
                </code>
                <span className="text-lg">📋</span>
              </div>
            </div>
          </div>
          <button
            onClick={copyTeamCode}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${copied
              ? 'bg-green-600 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105'
              }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Players"
          value={stats.totalPlayers}
          icon={<Users className="w-6 h-6 text-purple-500" />}
          progress={stats.totalPlayers / Math.max(stats.totalPlayers, 10)}
        />
        <StatCard
          label="Upcoming Matches"
          value={stats.upcomingMatches}
          icon={<Calendar className="w-6 h-6 text-blue-500" />}
          progress={stats.upcomingMatches / 3}
        />
        <StatCard
          label="New Messages"
          value={stats.newMessages}
          icon={<MessageSquare className="w-6 h-6 text-orange-500" />}
          progress={stats.newMessages / 10}
        />
        <StatCard
          label="Notifications"
          value={stats.notifications}
          icon={<Bell className="w-6 h-6 text-red-500" />}
          progress={stats.notifications / 10}
        />
      </div>

      {/* Upcoming Matches */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Upcoming Matches</h2>
          <button
            onClick={() => navigate('/matches')}
            className="text-sm text-gray-300 bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {upcomingMatches.length === 0 ? (
            <p className="text-gray-400">No upcoming matches.</p>
          ) : (
            upcomingMatches.map(m => (
              <div
                key={m.id}
                className="bg-gray-800 p-4 rounded-lg border border-gray-700"
              >
                <p className="text-lg font-medium text-white">vs {m.opponent}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(m.date_time).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}{' '}
                  @{' '}
                  {new Date(m.date_time).toLocaleTimeString(undefined, {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                <p className="flex items-center text-gray-400 text-sm space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{m.location}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  ✅ Confirmed: <span className="text-white">{m.confirmedCount}</span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

// small helper component for stats
function StatCard({ label, value, icon, progress }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        {icon}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div
          className="h-full bg-purple-500 rounded-full"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
      <p className="text-gray-400 text-sm">
        {/* you can customize subtext here */}
      </p>
    </div>
  );
}
