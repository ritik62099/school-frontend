

// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as jwtDecode from 'jwt-decode';
import { endpoints } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const isValidToken = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode.jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (err) {
    console.warn('Invalid or expired token:', err.message);
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr && isValidToken(token)) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error('Corrupted user data in localStorage:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await fetch(endpoints.auth.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await res.text();
      throw new Error(`Invalid server response: ${text.substring(0, 150)}`);
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setCurrentUser(data.user);
  };


// In AuthProvider
const signup = async (name, email, password) => {
  const res = await fetch(endpoints.auth.signup, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }), // No OTP
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Signup failed');
  }

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  setCurrentUser(data.user);
};

// Remove requestOtp function entirely

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    setCurrentUser,
    login,
    signup,
    
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};