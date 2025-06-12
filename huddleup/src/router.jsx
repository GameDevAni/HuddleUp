import { createBrowserRouter, Navigate } from 'react-router-dom';

// Pages
import SetupPlayerPage from './pages/SetupPlayerPage';
import LoginPage from "./components/auth/Login";
import SignupPage from "./components/auth/Signup";
import SelectRolePage from './pages/SelectRolePage';
import SetupTeamPage from './pages/SetupTeamPage';
import CoachDashboardPage from './pages/CoachDashboardPage';
import PlayerDashboardPage from './pages/PlayerDashboardPage';

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
          {
            path: '/dashboard/coach',
            element: <CoachDashboardPage />,
          },
        ],
      },

      // 🟦 Player-only route
      {
        element: <ProtectedRoute allowedRoles={['player']} />,
        children: [
          { path: '/dashboard/player', element: <PlayerDashboardPage /> },
        ],
      },
    ],
  },
]);
