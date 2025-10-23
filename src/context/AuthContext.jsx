// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Helper: Validate JWT token (Vite-compatible)
const isValidToken = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode.jwtDecode(token); // 🔑 Must use .jwtDecode in Vite
    const currentTime = Date.now() / 1000; // JWT exp is in seconds
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
        console.error('Corrupted user data in localStorage');
        // Clean up invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
      }
    } else {
      // Token missing, expired, or user data missing → log out
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
    }

    setLoading(false);
  }, []);

const login = async (email, password) => {
  const res = await fetch('https://school-api-gd9l.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error('Invalid response from server: ' + text.substring(0, 100));
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  setCurrentUser(data.user);
};

  const requestOtp = async (email) => {
    const res = await fetch('https://school-api-gd9l.onrender.com/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return data.message;
  };

  const signup = async (name, email, password, otp) => {
    const res = await fetch('https://school-api-gd9l.onrender.com/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setCurrentUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // ✅ Expose setCurrentUser so components can update user state (e.g., after refresh)
  const value = {
    currentUser,
    setCurrentUser, // ← THIS WAS MISSING — NOW ADDED!
    login,
    signup,
    requestOtp,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// // src/context/AuthContext.jsx
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import * as jwtDecode from 'jwt-decode';

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// // ✅ Helper: Validate JWT token (Vite-compatible)
// const isValidToken = (token) => {
//   if (!token) return false;
//   try {
//     const decoded = jwtDecode.jwtDecode(token); // 🔑 Must use .jwtDecode in Vite
//     const currentTime = Date.now() / 1000; // JWT exp is in seconds
//     return decoded.exp > currentTime;
//   } catch (err) {
//     console.warn('Invalid or expired token:', err.message);
//     return false;
//   }
// };

// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const userStr = localStorage.getItem('user');

//     if (token && userStr && isValidToken(token)) {
//       try {
//         const user = JSON.parse(userStr);
//         setCurrentUser(user);
//       } catch (e) {
//         console.error('Corrupted user data in localStorage');
//         // Clean up invalid data
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         setCurrentUser(null);
//       }
//     } else {
//       // Token missing, expired, or user data missing → log out
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       setCurrentUser(null);
//     }

//     setLoading(false);
//   }, []);

//   const login = async (email, password) => {
//     const res = await fetch('http://localhost:5000/api/auth/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.message || 'Login failed');
//     }

//     // Save fresh auth data
//     localStorage.setItem('token', data.token);
//     localStorage.setItem('user', JSON.stringify(data.user));
//     setCurrentUser(data.user);
//   };

//   const requestOtp = async (email) => {
//     const res = await fetch('http://localhost:5000/api/auth/request-otp', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.message || 'Failed to send OTP');
//     }

//     return data.message;
//   };

//   const signup = async (name, email, password, otp) => {
//     const res = await fetch('http://localhost:5000/api/auth/signup', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name, email, password, otp }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.message || 'Signup failed');
//     }

//     localStorage.setItem('token', data.token);
//     localStorage.setItem('user', JSON.stringify(data.user));
//     setCurrentUser(data.user);
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setCurrentUser(null);
//   };

//   const value = {
//     currentUser,
//     login,
//     signup,
//     requestOtp,
//     logout,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };