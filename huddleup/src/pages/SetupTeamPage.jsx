import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import pb from '../services/pocketbaseService';

const sports = ['Football', 'Basketball', 'Cricket', 'Tennis', 'Hockey'];
const ageGroups = ['Under-9', 'Under-11', 'Under-13', 'Under-15', 'Under-17', 'Under-19', 'Open'];

// simple 6-char alphanumeric code generator
function generateTeamCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function SetupTeamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [error, setError] = useState(null);

  const handleCreateTeam = async (e) => {
    const teamCode = generateTeamCode();
    console.log('🆔 Generated team code:', teamCode);
    e.preventDefault();
    try {
      await pb.collection('teams').create({
        team_name: teamName,
        sport,
        age_group: ageGroup,
        coach: user.id,
        players: [], // start empty
        team_code: teamCode,
      });
      navigate('/dashboard/coach');
    } catch (err) {
      const resp = err.response?.data;
      console.error('Create team error data:', resp);
      if (resp?.data) {
        // e.g. { age_group: { message: "...", ... }, team_code: { message: "...", ... } }
        Object.entries(resp.data).forEach(([field, info]) => {
          console.error(`• ${field}:`, info.message || info);
        });
      }
      setError('Failed to create team. Check console for details.');
    }

  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white px-4">
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-10">
        <div className="text-left">
          <h1 className="text-4xl font-bold mb-4">Welcome Coach!</h1>
          <p className="mb-6 text-lg text-gray-300">
            Create your team, invite players, and start managing matches with ease.
          </p>
          <div className="flex gap-4">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p>👥 Manage Players</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p>📅 Schedule Matches</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p>🏆 Track Performance</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleCreateTeam}
          className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4">Set Up Your Team</h2>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <input
            type="text"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white mb-3"
            required
          />
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white mb-3"
            required
          >
            <option value="">Select a sport</option>
            {sports.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white mb-4"
            required
          >
            <option value="">Select age group</option>
            {ageGroups.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded"
          >
            Create Team
          </button>
        </form>
      </div>
    </div>
  );
}
