// src/pages/CoachDashboardPage.jsx
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import pb from '../services/pocketbaseService';

export default function CoachDashboardPage() {
  const { user, logout } = useAuth();
  const [team, setTeam] = useState(null);

  useEffect(() => {
    // fetch the one team where this user is coach
    pb.collection('teams')
      .getFirstListItem(`coach="${user.id}"`)
      .then(setTeam)
      .catch(console.error);
  }, [user.id]);

  const copyCode = () => {
    navigator.clipboard.writeText(team.team_code);
    alert('Team code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome Coach {user.name}</h1>
        <button
          onClick={logout}
          className="text-red-400 hover:underline"
        >
          Logout
        </button>
      </div>

      {team && (
        <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Your Team Code</h2>
          <div className="mt-2 flex items-center gap-4">
            <span className="text-2xl font-mono text-purple-400">
              {team.team_code}
            </span>
            <button
              onClick={copyCode}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
            >
              Copy
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Share this with players so they can join your team.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your existing feature cards... */}
      </div>
    </div>
  );
}
