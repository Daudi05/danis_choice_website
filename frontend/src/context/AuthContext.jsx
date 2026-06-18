import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      // Only restore user if a token actually exists alongside it
      const token = localStorage.getItem('dc_token');
      if (!token) {
        // Clean up stale user data with no token
        localStorage.removeItem('dc_user');
        localStorage.removeItem('dc_refresh');
        return null;
      }
      return JSON.parse(localStorage.getItem('dc_user') || 'null');
    } catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    const { access_token, refresh_token, user } = res.data.data;
    localStorage.setItem('dc_token',   access_token);
    localStorage.setItem('dc_refresh', refresh_token);
    localStorage.setItem('dc_user',    JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    const { access_token, refresh_token, user } = res.data.data;
    localStorage.setItem('dc_token',   access_token);
    localStorage.setItem('dc_refresh', refresh_token);
    localStorage.setItem('dc_user',    JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('dc_token');
    localStorage.removeItem('dc_refresh');
    localStorage.removeItem('dc_user');
    setUser(null);
  }, []);

  const isAdmin    = () => user?.role === 'admin';
  // Check both: user object exists AND a token is present
  const isLoggedIn = () => !!user && !!localStorage.getItem('dc_token');

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);