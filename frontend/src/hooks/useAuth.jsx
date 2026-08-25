import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function getStoredToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem('token');
  } catch (err) {
    console.warn('Unable to read auth token from storage:', err);
    return null;
  }
}

function clearStoredToken() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem('token');
  } catch (err) {
    console.warn('Unable to clear auth token from storage:', err);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  // Validate token and fetch user details on load/refresh
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/v1/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success) {
            setUser(resData.data.user);
            setToken(storedToken);
          } else {
            // Token is invalid/expired
            handleClearAuth();
          }
        } else {
          handleClearAuth();
        }
      } catch (err) {
        console.error('Error initializing auth profile:', err);
        handleClearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleClearAuth = () => {
    clearStoredToken();
    setUser(null);
    setToken(null);
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        const { token: receivedToken, user: loggedUser } = resData.data;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('token', receivedToken);
        }
        setToken(receivedToken);
        setUser(loggedUser);
        return { success: true, role: loggedUser.role };
      } else {
        return {
          success: false,
          error: resData.error?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        };
      }
    } catch (err) {
      console.error('Login request failed:', err);
      return { success: false, error: 'ไม่สามารถเชื่อมต่อระบบหลังบ้านได้' };
    }
  };

  const logout = () => {
    handleClearAuth();
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
