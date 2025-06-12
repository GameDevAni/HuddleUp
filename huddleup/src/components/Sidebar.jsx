// src/components/Sidebar.jsx
import {
  Home,
  Users,
  Calendar,
  Trophy,
  MessageSquare,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard/coach', icon: Home, label: 'Dashboard' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/matches', icon: Calendar, label: 'Matches' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar({ collapsed, onToggle }) {
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

      <nav className="flex-1 overflow-y-auto mt-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 hover:bg-gray-700 
               ${isActive ? 'bg-gray-700' : ''}`
            }
          >
            <Icon className="w-5 h-5" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
