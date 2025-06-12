// src/pages/SetupPlayerPage.jsx

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import pb from '../services/pocketbaseService';

export default function SetupPlayerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');    // free-text input
  const [teamCode, setTeamCode] = useState('');
  const [error, setError] = useState(null);

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // 1. Look up the team by its code
      const team = await pb
        .collection('teams')
        .getFirstListItem(`team_code="${teamCode}"`);

      // 2. Update the user profile
      await pb.collection('users').update(user.id, {
        phone,
        playing_position: position,
      });

      // 3. Add this user to the team's players array
      const updatedPlayers = [...(team.players || []), user.id];
      await pb.collection('teams').update(team.id, {
        players: updatedPlayers,
      });

      // 4. Redirect to player dashboard
      navigate('/dashboard/player');
    } catch (err) {
      console.error('Join team failed:', err.response?.data || err);
      setError('Could not join with that team code.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <form
        onSubmit={handleJoinTeam}
        className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Join Your Team</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <label className="block mb-2">
          <span className="text-sm">Phone Number</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +1 (555) 123-4567"
            className="w-full p-2 rounded bg-gray-700 text-white mt-1"
            required
          />
        </label>

        <label className="block mb-2">
          <span className="text-sm">Playing Position</span>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Striker, Point Guard, Setter"
            className="w-full p-2 rounded bg-gray-700 text-white mt-1"
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Team Code</span>
          <input
            type="text"
            value={teamCode}
            onChange={(e) => setTeamCode(e.target.value)}
            placeholder="Enter the code from your coach"
            className="w-full p-2 rounded bg-gray-700 text-white mt-1"
            required
          />
        </label>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded"
        >
          Join Team
        </button>
      </form>
    </div>
  );
}
