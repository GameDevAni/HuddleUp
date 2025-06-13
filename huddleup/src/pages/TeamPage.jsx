// src/pages/TeamPage.jsx

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import pb from '../services/pocketbaseService';
import Layout from '../components/Layout';
import AddPlayerModal from '../components/AddPlayerModal';
import { MoreVertical, Plus } from 'lucide-react';
export default function TeamPage() {
  const { user } = useAuth();
  // const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([
    {
      id: '1',
      name: 'Virat Kohli',
      playing_position: 'Striker',
      status: 'Active',
      email: 'virat.kohli@example.com',
      phone: '+91 98765 43210',
    },
    {
      id: '2',
      name: 'MS Dhoni',
      playing_position: 'Goalkeeper',
      status: 'Injured',
      email: 'ms.dhoni@example.com',
      phone: '+91 91234 56789',
    },
    {
      id: '3',
      name: 'Sachin Tendulkar',
      playing_position: 'Midfielder',
      status: 'Unavailable',
      email: 'sachin.tendulkar@example.com',
      phone: '+91 99887 66554',
    },
  ]);
  const [openMenu, setOpenMenu] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const removePlayer = (id) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setOpenMenu(null);
  };

  // stub invite handler
  async function sendInviteEmail({ name, email }, team, coachName) {
    const resp = await fetch('/api/send-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: `Invite to join ${team.team_name} on HuddleUp`,
        text: `Hello ${name},\n\nCoach ${coachName} has invited you to join "${team.team_name}". Use code "${team.team_code}" to sign up.\n`,
        html: `<p>Hello ${name},</p>
                <p>Coach <strong>${coachName}</strong> has invited you to join "<strong>${team.team_name}</strong>".</p>
                <p>Your team code is: <code>${team.team_code}</code></p>`,
      }),
    });
    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error || 'Failed to send invite');
    }
    return true;
  }

  // Dummy team object for demonstration
  const team = { team_name: "Test Team", team_code: "ABC123" };

  const handleInvite = async ({ name, email }) => {
    try {
      await sendInviteEmail({ name, email }, team, user.name);
      alert(`Invite sent to ${email}!`);
    } catch (err) {
      console.error('Invitation error:', err);
      alert(`Failed to send invite: ${err.message}`);
    }
  };

    return (
      <Layout>
        {/* Header + Add Player */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Your Team</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Player</span>
          </button>
        </div>

        {/* Invite Modal (no-op) */}
        <AddPlayerModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onInvite={handleInvite}
        />

        {/* Players Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Position</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Contact</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-300">⋮</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {players.map((p, idx) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{p.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {p.playing_position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'Active'
                          ? 'bg-green-600 text-green-100'
                          : p.status === 'Injured'
                            ? 'bg-red-600 text-red-100'
                            : 'bg-yellow-600 text-yellow-100'
                        }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    <div className="flex flex-col">
                      <span>{p.email}</span>
                      <span>{p.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === idx ? null : idx)}
                      className="p-1 hover:bg-gray-700 rounded-full"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>

                    {openMenu === idx && (
                      <div
                        className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10"
                        onMouseLeave={() => setOpenMenu(null)}
                      >
                        <button
                          onClick={() => removePlayer(p.id)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-200 text-sm"
                        >
                          Remove Player
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {players.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                    No players in the roster.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Layout>
    );
  }
