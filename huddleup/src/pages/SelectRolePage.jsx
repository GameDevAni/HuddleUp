import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pb from '../services/pocketbaseService';
import { useEffect } from 'react';

export default function SelectRolePage() {
  const { user } = useAuth();
  const navigate = useNavigate();



  const handleRoleSelect = async (role) => {
    console.log('select-role: user.id=', user?.id, ' user.role=', user?.role);

    if (!user || !user.id) {
    console.error('No user loaded, redirecting to login.');
    return navigate('/login', { replace: true });
  }

    try {
      // ✅ Update role in Pocketbase
      await pb.collection('users').update(user.id, { role });
      

      // ✅ Refresh local user object
      await pb.collection('users').authRefresh(); // or fetch user again
      const updatedUser = pb.authStore.record;

      // ✅ Redirect based on updated role
      if (updatedUser.role === 'coach') {
        navigate('/setup-team', { replace: true });
      } else {
        navigate('/setup-player', { replace: true });
      }
    } catch (err) {
      console.error('Failed to update role:', err);
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
