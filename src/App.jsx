import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FeedPage from './pages/FeedPage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import PremiumPage from './pages/PremiumPage';
import TrendingPage from './pages/TrendingPage';
import MyPostsPage from './pages/MyPostsPage';
import AdminPanel from './pages/AdminPanel';
import './index.css';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="loading" style={{ marginTop: '100px' }}>
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="main-content">
        <div className="empty-state">
          <div className="empty-state-icon">🚫</div>
          <h3>Access Denied</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading" style={{ marginTop: '100px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="app">
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
        <Route path="/trending" element={<ProtectedRoute><TrendingPage /></ProtectedRoute>} />
        <Route path="/my-posts" element={<ProtectedRoute><MyPostsPage /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
        <Route path="/post/:id" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
        <Route path="/premium" element={<ProtectedRoute><PremiumPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
