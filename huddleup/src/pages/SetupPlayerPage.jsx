// src/pages/SetupPlayerPage.jsx

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import pb from '../services/pocketbaseService';

export default function SetupPlayerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [error, setError] = useState(null);

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setError(null);

    // ——————————————————————————————
    // 1) Normalize & log the entered code
    // ——————————————————————————————
    const code = teamCode.trim().toUpperCase();
    console.log('🔍 Looking up team_code:', code);

    let team;
    try {
      team = await pb
        .collection('teams')
        .getFirstListItem(`team_code="${code}"`);
      console.log('✅ Found team:', team);
    } catch (err) {
      if (err.status === 404) {
        return setError('Invalid team code. Please check and try again.');
      }
      console.error('❌ Error fetching team:', err);
      return setError('Unexpected error fetching team—see console.');
    }

    // ——————————————————————————————
    // 2) Determine the correct user record ID
    // ——————————————————————————————
    const recordId = user?.id || pb.authStore.model?.id;
    console.log('👤 Updating user record with ID:', recordId);

    if (!recordId) {
      console.error('⚠️ No user ID found in context or authStore!');
      return setError('Auth error—please log out and log back in.');
    }

    // ——————————————————————————————
    // 3) Update the user with phone & position
    // ——————————————————————————————
    try {
      console.log('🔄 PATCH /collections/users/records', recordId, {
        phone,
        playing_position: position,
      });
      await pb.collection('users').update(recordId, {
        phone,
        playing_position: position,
      });
      console.log('✅ User updated successfully');
    } catch (err) {
      console.error(
        '❌ Error updating user:',
        JSON.stringify(err.response?.data, null, 2)
      );
      return setError('Failed to save your profile—see console.');
    }

    // ——————————————————————————————
    // 4) Add the user to the team’s players array
    // ——————————————————————————————
    try {
      const updatedPlayers = [...(team.players || []), recordId];
      console.log(
        '🔄 PATCH /collections/teams/records',
        team.id,
        { players: updatedPlayers }
      );
      await pb.collection('teams').update(team.id, {
        players: updatedPlayers,
      });
      console.log('✅ Team updated successfully');
    } catch (err) {
      console.error(
        '❌ Error updating team:',
        JSON.stringify(err.response?.data, null, 2)
      );
      return setError('Failed to join team—see console.');
    }

    // ——————————————————————————————
    // 5) All good—go to dashboard
    // ——————————————————————————————
    navigate('/dashboard/player', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <form
        onSubmit={handleJoinTeam}
        className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Join Your Team</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <label className="block mb-4">
          <span className="text-sm">Phone Number</span>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full p-2 rounded bg-gray-700 text-white mt-1"
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Playing Position</span>
          <input
            type="text"
            value={position}
            onChange={e => setPosition(e.target.value)}
            placeholder="e.g. Striker, Point Guard"
            className="w-full p-2 rounded bg-gray-700 text-white mt-1"
            required
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm">Team Code</span>
          <input
            type="text"
            value={teamCode}
            onChange={e => setTeamCode(e.target.value)}
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
