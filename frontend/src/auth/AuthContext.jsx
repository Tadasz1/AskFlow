// Auth for the whole app: current user, token, login/register/logout and authFetch.
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user/token from localStorage on mount (e.g. after refresh).
  useEffect(() => {
    const stored = window.localStorage.getItem('forum_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        window.localStorage.removeItem('forum_auth');
      }
    }
    setLoading(false);
  }, []);

  /** Persist auth to state and localStorage. */
  const saveAuth = (data) => {
    setUser(data.user);
    setToken(data.token);
    window.localStorage.setItem('forum_auth', JSON.stringify(data));
  };

  /** Clear user, token, and localStorage. */
  const clearAuth = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem('forum_auth');
  };

  /** POST /login; on success saves token and user via saveAuth. */
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    saveAuth(data);
  };

  /** POST /register; on success auto-logs in by calling login. */
  const register = async (name, email, password) => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg =
        data?.errors?.[0]?.msg ||
        data?.message ||
        'Registration failed';
      throw new Error(msg);
    }
    await login(email, password);
  };

  const logout = () => {
    clearAuth();
  };

  /** fetch() wrapper that adds Authorization: Bearer <token> and parses JSON; throws on non-ok. */
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || 'Request failed');
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        authFetch,
        API_BASE,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access auth context (user, token, loading, login, register, logout, authFetch, API_BASE). */
export function useAuth() {
  return useContext(AuthContext);
}

