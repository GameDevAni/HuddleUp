// src/pages/MatchesPage.jsx

import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ScheduleMatchModal from '../components/ScheduleMatchModal';
import EditMatchModal from '../components/EditMatchModal';
import pb from '../services/pocketbaseService';

export default function MatchesPage() {
  const { user } = useAuth();

  const [team, setTeam]                   = useState(null);
  const [matches, setMatches]             = useState([]);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingMatch, setEditingMatch]   = useState(null);
  const [error, setError]                 = useState(null);

  // 1) Load the coach’s team on mount
  useEffect(() => {
    pb.collection('teams')
      .getFirstListItem(`coach="${user.id}"`)
      .then(setTeam)
      .catch(console.error);
  }, [user.id]);

  // 2) Whenever the team is loaded, fetch its upcoming matches
  useEffect(() => {
    if (!team) return;
    fetchMatches();
  }, [team]);

  // Helper to fetch and set matches
  async function fetchMatches() {
    try {
      const nowIso = new Date().toISOString();
      const list = await pb.collection('matches').getFullList({
        filter: `team="${team.id}" && date_time >= "${nowIso}"`,
        sort:   'date_time',
      });
      setMatches(list);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Could not load matches.');
    }
  }

  // Called by ScheduleMatchModal
  async function handleSchedule({ opponent, date_time, location, notes }) {
    if (!team) throw new Error('Team not loaded');
    const iso = new Date(date_time).toISOString();
    await pb.collection('matches').create({
      team:      team.id,
      opponent,
      date_time: iso,
      location,
      notes,
    });
    await fetchMatches();
  }

  // Called by EditMatchModal to save edits
  async function handleSave(id, data) {
    await pb.collection('matches').update(id, data);
    await fetchMatches();
  }

  // Called by EditMatchModal to cancel (delete) a match
  async function handleCancel(id) {
    await pb.collection('matches').delete(id);
    await fetchMatches();
  }

  return (
    <Layout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Upcoming Matches</h1>
        <button
          onClick={() => setScheduleModalOpen(true)}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Schedule a Match</span>
        </button>
      </div>

      {/* Schedule Match Modal */}
      <ScheduleMatchModal
        isOpen={isScheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSchedule={handleSchedule}
      />

      {/* Edit Match Modal */}
      <EditMatchModal
        isOpen={Boolean(editingMatch)}
        match={editingMatch}
        onClose={() => setEditingMatch(null)}
        onSave={handleSave}
        onCancelMatch={handleCancel}
      />

      {/* Error */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Matches List */}
      <div className="space-y-4">
        {matches.length === 0 ? (
          <p className="text-gray-400">No upcoming matches.</p>
        ) : (
          matches.map((m) => (
            <div
              key={m.id}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col space-y-3"
            >
              {/* Top row: opponent + badge + edit button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-semibold text-white">vs {m.opponent}</p>
                </div>
                <button
                  onClick={() => setEditingMatch(m)}
                  className="text-sm text-white-400 bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg"
                >
                  Edit Details
                </button>
              </div>

              {/* Date / Time / Location */}
              <div className="flex items-center space-x-6 text-gray-400 text-sm">
                <span className="flex items-center space-x-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {new Date(m.date_time).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(m.date_time).toLocaleTimeString(undefined, {
                      hour: 'numeric', minute: '2-digit'
                    })}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{m.location}</span>
                </span>
              </div>

              {/* Notes, if any */}
              {m.notes && <p className="text-gray-300 text-sm">{m.notes}</p>}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
