import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PlayerLayout from '../components/PlayerLayout';
import pb from '../services/pocketbaseService';

export default function PlayerDashboardPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        // re-load the user with `team` expanded
        const me = await pb.collection('users').getOne(user.id, {
          expand: 'team',
        });
        setTeam(me.expand?.team || null);
      } catch (err) {
        console.error('Error fetching user/team', err);
      }
    }
    fetchUser();
  }, [user.id]);

  return (
    <PlayerLayout>
      <h1 className="text-3xl font-bold text-white mb-6">Player Dashboard</h1>

      {team ? (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <p className="text-gray-400">You’ve joined:</p>
          <h2 className="text-2xl font-semibold text-white">{team.team_name}</h2>
        </div>
      ) : (
        <p className="text-gray-400">You haven’t joined a team yet.</p>
      )}
    </PlayerLayout>
  );
}
