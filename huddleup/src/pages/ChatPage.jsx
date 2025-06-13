import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import pb from '../services/pocketbaseService';

export default function ChatPage() {
  const { user } = useAuth();
  const [teamId, setTeamId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef();

  // 1) loadTeam: fetch all and pick ours
  useEffect(() => {
    async function loadTeam() {
      try {
        const allTeams = await pb.collection('teams').getFullList();
        const t = allTeams.find(t =>
          t.coach === user.id ||
          (Array.isArray(t.players) && t.players.includes(user.id))
        );
        if (!t) throw new Error("No team found for this user");
        console.log('🔹 Loaded team:', t);
        setTeamId(t.id);
      } catch (err) {
        console.error('❌ Chat loadTeam error:', err);
      }
    }
    loadTeam();
  }, [user.id]);

  // 2) once we have a team, load + subscribe
  useEffect(() => {
    if (!teamId) return;

    console.log('🔍 Fetching messages for teamId:', teamId);

    // 1) Initial load via getList (page 1, up to 500 msgs)
    pb.collection('messages')
      .getList(1, 500, {
        filter: `team = "${teamId}"`,   // note spaces around =
        sort: 'created',              // use the 'created' field
        expand: 'sender',               // so we can show sender.name
      })
      .then(({ items }) => {
        console.log('✅ Fetched messages:', items);
        setMessages(items);
      })
      .catch(err => {
        console.error('❌ Error fetching messages:', err);
      });

    // 2) Subscribe to new ones
    const unsub = pb
      .collection('messages')
      .subscribe(`team = "${teamId}"`, (e) => {
        console.log('📬 Realtime event:', e);
        if (e.action === 'create') {
          pb.collection('messages')
            .getOne(e.record.id, { expand: 'sender' })
            .then(m => {
              console.log('➕ New message arrived:', m);
              setMessages(msgs => [...msgs, m]);
            })
            .catch(err => console.error('❌ Error fetching new message:', err));
        }
      });

    return () => {
      // cleanup the subscription
      if (typeof unsub === 'function') unsub();
      else if (unsub && typeof unsub.unsubscribe === 'function') unsub.unsubscribe();
    };
  }, [teamId]);

  // 3) send a message
  const handleSend = async e => {
    e.preventDefault();
    if (!text.trim() || !teamId) return;
    try {
      await pb.collection('messages').create({
        team: teamId,
        sender: user.id,
        text: text.trim(),
      });
      setText('');
    } catch (err) {
      console.error('❌ Send failed:', err);
    }
  };

  // 4) scroll to bottom
  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  if (!teamId) {
    return (
      <Layout>
        <p className="text-gray-400">Loading chat…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-white">Team Chat</h1>
      <div
        ref={listRef}
        className="bg-gray-800 p-4 rounded-lg h-[60vh] overflow-y-auto space-y-3 mb-4"
      >
        {messages.map(m => {
          const me = m.expand?.sender?.id === user.id;
          return (
            <div
              key={m.id}
              className={`flex ${me ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${me ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-200'
                  }`}
              >
                {!me && (
                  <p className="text-xs font-semibold text-gray-300">
                    {m.expand?.sender?.name}
                  </p>
                )}
                <p>{m.text}</p>
                <p className="text-[0.65rem] text-gray-400 text-right mt-1">
                  {new Date(m.created).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSend} className="flex space-x-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 p-2 rounded bg-gray-700 text-white"
        />
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded"
        >
          Send
        </button>
      </form>
    </Layout>
  );
}
