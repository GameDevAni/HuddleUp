// src/components/PlayerTopbar.jsx
import { Bell, MessageSquare } from 'lucide-react';
import { useAuth }            from '../context/AuthContext';

export default function PlayerTopbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-white">Huddle<span className="text-purple-500">Up</span></h1>
      <div className="flex items-center space-x-4">
        <Bell className="w-5 h-5 text-gray-400" />
        <MessageSquare className="w-5 h-5 text-gray-400" />
        <span className="text-white font-medium">{user.name}</span>
        <button onClick={logout} className="text-gray-400 hover:text-white">
          Logout
        </button>
      </div>
    </header>
  );
}
