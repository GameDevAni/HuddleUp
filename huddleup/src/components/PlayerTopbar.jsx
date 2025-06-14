// src/components/PlayerTopbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, Settings, LogOut, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';
import SetStatusModal from './SetStatusModal';

export default function PlayerTopbar() {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { refreshUser } = useAuth();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditOpen] = useState(false);
  const menuRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
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
          <Bell className="w-5 h-5 text-gray-400" />
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <span className="text-white font-medium">{user.name}</span>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-2 rounded-full hover:bg-gray-700 transition"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    setEditOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700"
                >
                  Edit profile
                </button>

                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                  onClick={() => setShowStatusModal(true)}
                >
                  Set Your Status
                </button>

                <div className="border-t border-gray-700" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Edit Profile Modal (always in the tree) */}
      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditOpen(false)}
      />
      <SetStatusModal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        currentStatus={user.status}
        onStatusChange={(newStatus) => refreshUser && refreshUser()} // or update your local state
      />
    </>
  );
}
