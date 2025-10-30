// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // ✅ Wait until auth loading is complete
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#64748b'
      }}>
        Loading...
      </div>
    );
  }

  // ✅ If not logged in, go to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // ✅ All good — render the page
  return children;
};

export default ProtectedRoute;