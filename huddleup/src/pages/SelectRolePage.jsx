// src/pages/SelectRolePage.jsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pb from '../services/pocketbaseService';

export default function SelectRolePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // On mount (or when user changes), redirect if role is set
  useEffect(() => {
    if (!user) return;       // auth still loading
    if (!user.role) return;  // no role yet — show buttons

    if (user.role === 'coach') {
      // coach → either setup or dashboard
      pb.collection('teams')
        .getFirstListItem(`coach="${user.id}"`)
        .then(() => navigate('/dashboard/coach', { replace: true }))
        .catch(() => navigate('/setup-team',    { replace: true }));
    }

    if (user.role === 'player') {
      // player → check if already on a team
      pb.collection('teams')
        .getFirstListItem(`players ~ "${user.id}"`)
        .then(() => navigate('/dashboard/player', { replace: true }))
        .catch((err) => {
          if (err.status === 404) {
            // not on any team yet
            navigate('/setup-player', { replace: true });
          } else {
            console.error('Error checking player team:', err);
          }
        });
    }
  }, [user, navigate]);

  // Only show buttons if the user has no role yet
  if (user?.role) return null;

  const handleRoleSelect = async (role) => {
    try {
      await pb
        .collection('users')
        .update(user.id, { role });
      // once role is set, the above useEffect will run and redirect accordingly
    } catch (err) {
      console.error('Failed to set role:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <h2 className="text-2xl font-bold mb-6">Select Your Role</h2>
      <div className="flex gap-6">
        <button
          onClick={() => handleRoleSelect('coach')}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-lg font-semibold shadow"
        >
          I am a Coach
        </button>
        <button
          onClick={() => handleRoleSelect('player')}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-lg font-semibold shadow"
        >
          I am a Player
        </button>
      </div>
    </div>
  );
}
