// src/components/Topbar.jsx
import {
  Home,
  Users,
  Calendar,
  Trophy,
  MessageSquare,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Trophy className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              Huddle<span className="text-purple-500">Up</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </div>
          <span className="text-white font-medium">Coach {user.name}</span>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user.name.charAt(0)}
            </span>
          </div>
          <button
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
