// src/pages/CoachDashboardPage.jsx
import { useEffect, useState } from 'react';
import pb from '../services/pocketbaseService';
import Layout from '../components/Layout';
import {
  Home,
  Users,
  Calendar,
  Trophy,
  MessageSquare,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';

export default function CoachDashboardPage() {
  const [team, setTeam] = useState(null);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    upcomingMatches: 0,
    newMessages: 0,
    notifications: 0,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // fetch team and stats...
    pb.collection('teams')
      .getFirstListItem(`coach="${pb.authStore.model.id}"`)
      .then(t => {
        setTeam(t);
        // stub stats until real data:
        setStats({
          totalPlayers: t.players.length,
          upcomingMatches: 3,
          newMessages: 8,
          notifications: 5,
        });
      })
      .catch(console.error);
  }, []);

  const copyTeamCode = async () => {
    if (!team?.team_code) return;

    try {
      await navigator.clipboard.writeText(team.team_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy team code:', err);
    }
  };

  return (
    <Layout>
      <>
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Team Code Card */}
        {team && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {team.team_name}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-300 text-sm">Team Code:</span>
                      <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-600">
                        <code className="text-purple-400 font-mono text-lg font-bold tracking-wider">
                          {team.team_code}
                        </code>
                        <span className="text-lg">📋</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Copy Button */}
                <button
                  onClick={copyTeamCode}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${copied
                      ? 'bg-green-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105'
                    }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="font-medium">Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-600/50">
                <p className="text-gray-400 text-sm">
                  Share this code with players to join your team. Keep it secure and only share with trusted members.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Total Players</p>
                <p className="text-3xl font-bold text-white">16</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
            <p className="text-gray-400 text-sm mt-2">80% attendance this month</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Upcoming Matches</p>
                <p className="text-3xl font-bold text-white">3</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <p className="text-gray-400 text-sm mt-2">60% player confirmations</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">New Messages</p>
                <p className="text-3xl font-bold text-white">8</p>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-500" />
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-gray-400 text-sm mt-2">All read in last 24h</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Notifications</p>
                <p className="text-3xl font-bold text-white">5</p>
              </div>
              <Bell className="w-8 h-8 text-red-500" />
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
            <p className="text-gray-400 text-sm mt-2">40% require action</p>
          </div>
        </div>

        {/* Placeholder Sections */}
        <div className="flex space-x-1 mb-6">
          <button className="px-6 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 font-medium">
            Upcoming Matches
          </button>
          <button className="px-6 py-3 text-gray-400 hover:text-white transition-colors">
            Recent Activity
          </button>
        </div>
      </>
    </Layout>
  );
}

