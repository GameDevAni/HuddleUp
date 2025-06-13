import { createBrowserRouter, Navigate } from 'react-router-dom';


// Pages
import SetupPlayerPage from './pages/SetupPlayerPage';
import LoginPage from "./components/auth/Login";
import SignupPage from "./components/auth/Signup";
import SelectRolePage from './pages/SelectRolePage';
import SetupTeamPage from './pages/SetupTeamPage';
import CoachDashboardPage from './pages/CoachDashboardPage';
import PlayerDashboardPage from './pages/PlayerDashboardPage';
import TeamPage from './pages/TeamPage';
import MatchesPage from './pages/MatchesPage';
import ChatPage from './pages/ChatPage';
import PlayerMatchesPage from './pages/PlayerMatchesPage';
import PlayerTeamPage from './pages/PlayerTeamPage';


// Route protection
import ProtectedRoute from './components/ProtectedRoute';

export const router = createBrowserRouter([
  // 🌐 Default redirect from root to login
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  // 📋 Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },

  // 🔐 Auth-protected base
  {
    element: <ProtectedRoute />, // must be logged in
    children: [
      {
        path: '/setup-player',
        element: <SetupPlayerPage />,
      },
      {
        path: '/select-role',
        element: <SelectRolePage />,
      },
      {
        path: '/setup-team',
        element: <SetupTeamPage />,
      },

      // 🟪 Coach-only route
      {
        element: <ProtectedRoute allowedRoles={['coach']} />,
        children: [
          { path: '/dashboard/coach', element: <CoachDashboardPage /> },
          { path: '/team', element: <TeamPage /> },
          { path: '/matches', element: <MatchesPage /> },
          {path: '/chat', element: <ChatPage /> },
          // ...
        ],
      },

      // 🟦 Player-only route

      {
        element: <ProtectedRoute allowedRoles={['player']} />,
        children: [
          { path: '/setup-player', element: <SetupPlayerPage /> },
          { path: '/dashboard/player', element: <PlayerDashboardPage /> },
          { path: '/player/matches',     element: <PlayerMatchesPage /> },
          { path: '/player/team',        element: <PlayerTeamPage /> },
        ],
      },
    ],
  },
]);

// after you create your router:
export default router;
