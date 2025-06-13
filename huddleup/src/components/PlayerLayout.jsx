// src/components/PlayerLayout.jsx
import { useState } from 'react';
import PlayerSidebar from './PlayerSidebar';
import PlayerTopbar  from './PlayerTopbar';

export default function PlayerLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <PlayerSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <div className="flex-1 flex flex-col">
        <PlayerTopbar />

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
