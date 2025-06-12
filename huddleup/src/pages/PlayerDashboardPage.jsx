// src/pages/PlayerDashboardPage.jsx

import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import pb from '../services/pocketbaseService';

export default function PlayerDashboardPage() {
  const { user, logout } = useAuth();
  const [team, setTeam] = useState(null);

  useEffect(() => {
    // Fetch the team where players includes this user
    pb.collection('teams')
      .getFirstListItem(`players ~ "${user.id}"`)
      .then(setTeam)
      .catch((err) => {
        if (err.status !== 404) console.error('Error fetching player team:', err);
      });
  }, [user.id]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome {user.name}</h1>
        <button onClick={logout} className="text-red-400 hover:underline">
          Logout
        </button>
      </div>

      {team ? (
        <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">You’ve Joined:</h2>
          <p className="mt-2 text-2xl font-bold">{team.team_name}</p>
        </div>
      ) : (
        <p className="text-gray-400 mb-6">
          You haven't joined a team yet. Please use your team code.
        </p>
      )}

      {/* TODO: Replace these cards with your real modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Upcoming Matches</h2>
          <p className="text-sm text-gray-300">Your next games will appear here.</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Team Chat</h2>
          <p className="text-sm text-gray-300">Chat with your coach and teammates.</p>
        </div>
      </div>
    </div>
  );
}
