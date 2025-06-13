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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    upcomingMatches: 0,
    newMessages: 0,
    notifications: 0,
  });
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // 1) get the coach's team
        const t = await pb
          .collection('teams')
          .getFirstListItem(`coach="${user.id}"`);
        setTeam(t);

        // 2) basic stats
        setStats((s) => ({
          ...s,
          totalPlayers: t.players?.length || 0,
        }));

        // 3) fetch upcoming matches (>= now)
        const now = new Date().toISOString();
        const matches = await pb
          .collection('matches')
          .getFullList({
            filter: `team="${t.id}" && date_time >= "${now}"`,
            sort: 'date_time',
            limit: 3,
          });

        setUpcomingMatches(matches);
        setStats((s) => ({
          ...s,
          upcomingMatches: matches.length,
        }));

        // (you can fetch newMessages & notifications similarly)
      } catch (err) {
        console.error('Dashboard load error:', err);
      }
    }

    loadDashboard();
  }, [user.id]);

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
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Team Code Card */}
      {team && (
        <div className="mb-8 bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{team.team_name}</h2>
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
        <StatCard label="Total Players" value={stats.totalPlayers} icon={<Users className="w-6 h-6 text-purple-500" />} bar={stats.totalPlayers ? 1 : 0} />
        <StatCard label="Upcoming Matches" value={stats.upcomingMatches} icon={<Calendar className="w-6 h-6 text-blue-500" />} bar={stats.upcomingMatches ? 0.7 : 0} />
        <StatCard label="New Messages" value={stats.newMessages} icon={<MessageSquare className="w-6 h-6 text-orange-500" />} bar={stats.newMessages ? 0.5 : 0} />
        <StatCard label="Notifications" value={stats.notifications} icon={<Bell className="w-6 h-6 text-red-500" />} bar={stats.notifications ? 0.3 : 0} />
      </div>

      {/* Upcoming Matches Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Upcoming Matches</h2>
          <button
            onClick={() => navigate('/matches')}
            className="text-purple-400 text-sm hover:underline"
          >
            View All
          </button>
        </div>

        <div className="space-y-4">
          {upcomingMatches.length === 0 ? (
            <p className="text-gray-400 col-span-full">No upcoming matches.</p>
          ) : (
            upcomingMatches.map((m) => (
              <div
                key={m.id}
                className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col space-y-2"
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
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

// small helper components
function StatCard({ label, value, icon, bar }) {
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
        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${bar * 100}%` }} />
      </div>
      <p className="text-gray-400 text-sm"> </p>
    </div>
  );
}
