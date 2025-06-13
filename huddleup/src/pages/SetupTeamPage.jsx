// src/pages/SetupTeamPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import pb          from '../services/pocketbaseService';

export default function SetupTeamPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [teamName, setTeamName] = useState('');
  const [sport, setSport]       = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const teamCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const newTeam = await pb.collection('teams').create({
        team_name:  teamName,
        sport,                        // now coming from dropdown
        age_group:  ageGroup,
        team_code:  teamCode,
        coach:      pb.authStore.record.id,
      });

      await pb.collection('users').update(pb.authStore.record.id, {
        role: 'coach',
        team: newTeam.id,
      });

      await refreshUser();

      navigate('/dashboard/coach');
    } catch (err) {
      console.error('Failed to create team:', err);
      setError('There was a problem creating your team.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <form
        onSubmit={handleCreateTeam}
        className="bg-gray-800 bg-opacity-80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-md w-full space-y-6"
      >
        <h2 className="text-2xl font-bold text-white text-center">
          Set Up Your Team
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Team Name */}
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          required
          className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
        />

        {/* Sport Dropdown */}
        <select
          value={sport}
          onChange={e => setSport(e.target.value)}
          required
          className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 transition"
        >
          <option value="" disabled>Select Sport</option>
          <option>Football</option>
          <option>Basketball</option>
          <option>Cricket</option>
          <option>Volleyball</option>
          <option>Tennis</option>
          <option>Baseball</option>
          <option>Hockey</option>
        </select>

        {/* Age Group */}
        <select
          value={ageGroup}
          onChange={e => setAgeGroup(e.target.value)}
          required
          className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 transition"
        >
          <option value="" disabled>Select Age Group</option>
          <option>Under-9</option>
          <option>Under-11</option>
          <option>Under-13</option>
          <option>Under-15</option>
          <option>Under-17</option>
          <option>Under-19</option>
          <option>Open</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-transform hover:scale-105"
        >
          {loading ? 'Creating…' : 'Create Team'}
        </button>
      </form>
    </div>
  );
}
