// Root component: auth context, routes, header and footer layout.
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import QuestionsPage from './pages/QuestionsPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import logo from './assets/logo.svg';
import './App.css';

// Layout: header (logo, nav), main content (routes), footer.
function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-left">
          <Link to="/" className="logo">
            <img src={logo} alt="" className="logo-img" />
            AskFlow
          </Link>
          <span className="logo-tagline">Ask. Answer. Learn.</span>
        </div>
        <nav className="app-nav">
          {user ? (
            <>
              <span className="app-user">Hi, {user.name}</span>
              <button type="button" className="btn-secondary" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn-primary nav-button">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<QuestionsPage />} />
          <Route path="/questions/:id" element={<QuestionDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="footer-brand">AskFlow</span>
            <span className="footer-divider">·</span>
            <span className="footer-text">
              Q&amp;A forum for students &amp; developers
            </span>
          </div>
          <div className="footer-right">
            <span className="footer-tech">React</span>
            <span className="footer-dot">·</span>
            <span className="footer-tech">Node.js</span>
            <span className="footer-dot">·</span>
            <span className="footer-tech">MongoDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Wraps the app with auth (AuthProvider) and routing (BrowserRouter).
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

