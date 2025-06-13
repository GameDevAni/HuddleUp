// src/components/PlayerSidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Calendar,
  Trophy,
  MessageSquare,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu
} from 'lucide-react';

export default function PlayerSidebar({ collapsed, onToggle }) {
  const { pathname } = useLocation();

  const navItems = [
    { to: '/dashboard/player', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { to: '/player/team', label: 'Team', icon: <Users className="w-5 h-5" /> },
    { to: '/player/matches', label: 'Matches', icon: <Calendar className="w-5 h-5" /> },
    { to: '/chat', label: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <aside
      className={`bg-gray-800 border-r border-gray-700 transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-purple-600 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">
              Huddle<span className="text-purple-500">Up</span>
            </h1>
          </div>
        )}
        <button onClick={onToggle} className="p-1.5 text-gray-400 hover:text-white transition-colors">
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 mt-4">
        {navItems.map(({ to, label, icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center px-4 py-2 mb-2 rounded-lg transition-colors ${active
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
                }`}
            >
              {icon}
              {!collapsed && <span className="ml-3">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <Link
        to="/login"
        className="flex items-center px-4 py-2 mb-4 text-gray-300 hover:bg-gray-700"
      >
        <LogOut className="w-5 h-5" />
        {!collapsed && <span className="ml-3">Logout</span>}
      </Link>
    </aside>
  );
}
