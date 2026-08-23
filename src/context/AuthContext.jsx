import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from '../services/api';
import * as authService from '../services/authService';
import { STORAGE_KEYS } from '../constants';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.user)) || null;
  } catch {
    return null;
  }
}

function persistSession(token, user) {
  if (token) localStorage.setItem(STORAGE_KEYS.token, token);
  else localStorage.removeItem(STORAGE_KEYS.token);
  if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEYS.user);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token));
  const [user, setUser] = useState(readStoredUser);
  const [status, setStatus] = useState(token ? 'loading' : 'guest');

  useEffect(() => {
    let active = true;
    if (!token) {
      setStatus('guest');
      return undefined;
    }
    // Validate the stored token and refresh the user profile.
    authService
      .getMe()
      .then((data) => {
        if (!active) return;
        setUser(data.user);
        persistSession(data.token || token, data.user);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!active) return;
        setToken(null);
        setUser(null);
        persistSession(null, null);
        setStatus('guest');
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
      persistSession(null, null);
      setStatus('guest');
    });
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.token);
    setUser(data.user);
    persistSession(data.token, data.user);
    setStatus('authenticated');
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    setToken(data.token);
    setUser(data.user);
    persistSession(data.token, data.user);
    setStatus('authenticated');
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    persistSession(null, null);
    setStatus('guest');
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      persistSession(localStorage.getItem(STORAGE_KEYS.token), next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      isAuthenticated: status === 'authenticated',
      isAdmin: user?.role === 'admin',
      myPersonId: user?.personId || null,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, status, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
