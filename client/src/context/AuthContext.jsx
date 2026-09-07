import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { registerUser, loginUser, getCurrentUser } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Save credentials to state and localStorage
   */
  const setAuthData = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setAuthError(null);
  };

  /**
   * Clear credentials and log out
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthError(null);
  }, []);

  /**
   * Validate session on initial application mount
   */
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await getCurrentUser();
        if (result.success && result.data?.user) {
          setUser(result.data.user);
          localStorage.setItem('user', JSON.stringify(result.data.user));
        }
      } catch {
        // Token was invalid or expired
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for session expiration events dispatched by Axios interceptor
    const handleSessionExpired = () => {
      logout();
    };

    window.addEventListener('auth:session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session_expired', handleSessionExpired);
    };
  }, [logout]);

  /**
   * User Registration Action
   */
  const register = async (name, email, password) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await registerUser({ name, email, password });
      if (result.success && result.data) {
        setAuthData(result.data.token, result.data.user);
        return { success: true };
      }
      return { success: false, message: 'Registration failed.' };
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.message ||
        'Registration failed. Please check your details.';
      setAuthError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * User Login Action
   */
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await loginUser({ email, password });
      if (result.success && result.data) {
        setAuthData(result.data.token, result.data.user);
        return { success: true };
      }
      return { success: false, message: 'Login failed.' };
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.message ||
        'Invalid email or password.';
      setAuthError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setAuthError(null);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    authError,
    register,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to access authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
