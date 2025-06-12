import { useAuth } from '../context/AuthContext';

export default function PlayerDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome {user?.name || ''}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Upcoming Matches</h2>
          <p className="text-sm text-gray-300">See details of your scheduled games.</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Team Chat</h2>
          <p className="text-sm text-gray-300">Stay in touch with your coach and teammates.</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Announcements</h2>
          <p className="text-sm text-gray-300">Coach updates and last-minute alerts.</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">My Profile</h2>
          <p className="text-sm text-gray-300">Your stats, preferences, and settings.</p>
        </div>
      </div>
    </div>
  );
}
