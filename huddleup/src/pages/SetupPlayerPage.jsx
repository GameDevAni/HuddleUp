import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import pb from '../services/pocketbaseService';

export default function SetupPlayerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');     // now free text
  const [teamCode, setTeamCode] = useState('');
  const [error, setError] = useState(null);

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    try {
      // 1. Fetch team by code
      const team = await pb
        .collection('teams')
        .getFirstListItem(`team_code="${teamCode}"`);

      // 2. Update user with phone & position (text)
      await pb.collection('users').update(user.id, {
        phone,
        playing_position: position,
      });

      // 3. Add user to team’s players array
      const updatedPlayers = [...(team.players || []), user.id];
      await pb.collection('teams').update(team.id, {
        players: updatedPlayers,
      });

      // 4. Go to player dashboard
      navigate('/dashboard/player');
    } catch (err) {
      console.error(err);
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

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white mb-3"
          required
        />

        <input
          type="text"
          placeholder="Playing Position (e.g., Striker, Point Guard)"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white mb-3"
          required
        />

        <input
          type="text"
          placeholder="Team Code"
          value={teamCode}
          onChange={(e) => setTeamCode(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white mb-4"
          required
        />

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
