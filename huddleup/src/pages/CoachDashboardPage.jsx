import { useAuth } from '../context/AuthContext';

export default function CoachDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome Coach {user?.name || ''}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Player Management</h2>
          <p className="text-sm text-gray-300">Add or remove players from your team.</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Match Scheduler</h2>
          <p className="text-sm text-gray-300">Schedule upcoming matches and notify your team.</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Announcements</h2>
          <p className="text-sm text-gray-300">Send match updates or reminders.</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Team Chat</h2>
          <p className="text-sm text-gray-300">Real-time chat with your players.</p>
        </div>
      </div>
    </div>
  );
}
