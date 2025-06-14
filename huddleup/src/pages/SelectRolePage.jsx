import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pb from '../services/pocketbaseService';
import { useEffect } from 'react';
import { User, Users, Trophy, Target } from 'lucide-react';

export default function SelectRolePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already has a role
    if (user?.role === 'coach') navigate('/dashboard/coach');
    else if (user?.role === 'player') navigate('/dashboard/player');
  }, [user, navigate]);

  const handleRoleSelect = async (role) => {
    try {
      // ✅ Update role in Pocketbase
      await pb.collection('users').update(user.id, { role });

      // ✅ Refresh local user object
      await pb.collection('users').authRefresh(); // or fetch user again
      const updatedUser = pb.authStore.record;

      // ✅ Redirect based on updated role
      if (updatedUser.role === 'coach') {
        navigate('/setup-team');
      } else {
        navigate('/setup-player');
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-purple-600 rounded-xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Huddle<span className="text-purple-500">Up</span>
            </h1>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Welcome</h2>
          <p className="text-xl text-gray-400">Choose your role to get started</p>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Coach Option */}
          <div 
            onClick={() => handleRoleSelect('coach')}
            className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer transform hover:scale-105 group"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-2xl mb-6 group-hover:bg-purple-500 transition-colors">
                <Users className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Coach</h3>
              
              <ul className="text-gray-300 space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>Manage team roster and lineups</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>Plan and schedule matches</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>Track player performance</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>Communicate with players</span>
                </li>
              </ul>
              
              <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors group-hover:bg-purple-500">
                Continue as Coach
              </button>
            </div>
          </div>
        <div 
            onClick={() => handleRoleSelect('player')}
            className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer transform hover:scale-105 group"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-2xl mb-6 group-hover:bg-purple-500 transition-colors">
                <User className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Player</h3>
              
              <ul className="text-gray-300 space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>View match schedules and lineups</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>Track personal statistics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>Communicate with team</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>Join team activities</span>
                </li>
              </ul>
              
              <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors group-hover:bg-purple-500">
                Continue as Player
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
