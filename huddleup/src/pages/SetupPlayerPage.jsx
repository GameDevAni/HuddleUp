// src/pages/SetupPlayerPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Users, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import pb from '../services/pocketbaseService';

export default function SetupPlayerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1) Find the team by its code
      const team = await pb
        .collection('teams')
        .getFirstListItem(`team_code="${teamCode}"`);

      // 2) Update *this* user's record
      //    Use the authStore ID to be 100% sure:
      const myUserId = pb.authStore.record.id;
      console.log('Updating user:', myUserId, 'with team', team.id);
      await pb
        .collection('users')
        .update(myUserId, {
          phone,
          playing_position: position,
          team: team.id,
        });


      // 3) Redirect to the player dashboard
      navigate('/dashboard/player');
    } catch (err) {
      console.error('🔴 Failed to join team', err);
      // if PB returned field-level errors, they’re in err.data
      if (err.data) {
        console.error('Field errors:', err.data);
      }
      setError('Failed to join: ' + (err.data?.team?.message
        || err.data?.playing_position?.message
        || err.data?.phone?.message
        || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-2xl p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Join Your Team</h2>
        <p className="text-gray-400 mb-6 text-center">
          Enter your details to connect with your coach and teammates.
        </p>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleJoinTeam} className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              placeholder="Enter Phone Number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter Playing Position"
              value={position}
              onChange={e => setPosition(e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="relative">
            <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter Team Code"
              value={teamCode}
              onChange={e => setTeamCode(e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-transform hover:scale-105"
          >
            {loading ? 'Joining…' : 'Join Team'}
          </button>
        </form>
      </div>
    </div>
  );
}
