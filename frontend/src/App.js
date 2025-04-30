import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import UserLayout from './components/layouts/UserLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Authentication Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import LogViewer from './pages/user/LogViewer';
import AlertsPage from './pages/user/Alerts';
import ReportsPage from './pages/user/Reports';
import NetworkMap from './pages/user/NetworkMap';
import CompliancePage from './pages/user/Compliance';
import VulnerabilitiesPage from './pages/user/Vulnerabilities';
import UserProfile from './pages/user/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import IntegrationsPage from './pages/admin/Integrations';
import SystemSettings from './pages/admin/SystemSettings';
import SecurityDashboard from './pages/admin/SecurityDashboard';

// Security Components
import MobileRouteRedirect from './components/security/MobileRouteRedirect';
import MobileSecurityDashboard from './components/security/mobile/MobileSecurityDashboard';

// Protected Route Component
const ProtectedRoute = ({ element, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return element;
};

function App() {
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#2563eb', // Blue
      },
      secondary: {
        main: '#7c3aed', // Purple
      },
      error: {
        main: '#ef4444', // Red
      },
      warning: {
        main: '#f59e0b', // Amber
      },
      info: {
        main: '#3b82f6', // Light blue
      },
      success: {
        main: '#10b981', // Green
      },
      background: {
        default: '#f9fafb',
        paper: '#ffffff',
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* User Routes */}
            <Route path="/" element={<ProtectedRoute element={<UserLayout />} />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="logs" element={<LogViewer />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="network" element={<NetworkMap />} />
              <Route path="compliance" element={<CompliancePage />} />
              <Route path="vulnerabilities" element={<VulnerabilitiesPage />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute element={<AdminLayout />} requiredRole="admin" />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="security" element={<SecurityDashboard />} />
            </Route>

            {/* Security Routes */}
            <Route path="/security">
              <Route index element={<MobileRouteRedirect />} />
              <Route path="mobile" element={<MobileSecurityDashboard />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
