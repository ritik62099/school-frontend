


import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../ui/Sidebar';

export default function AdminLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.layout}>
      <Sidebar user={currentUser} />

      <main
        style={{
          ...styles.main,
          marginLeft: isMobile ? 0 : 230,   // ✅ KEY FIX
        }}
      >
        <header style={styles.header}>
          <h1 style={{ margin: 0 }}>Admin Panel</h1>
          <div>
            <span style={{ marginRight: '1rem' }}>
              Welcome, {currentUser?.name}
            </span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
  },
  main: {
    width: '100%',
    padding: '1.5rem',
  },
  header: {
    background: '#2563eb',
    color: 'white',
    padding: '1rem 1.25rem',
    borderRadius: 12,
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  logoutBtn: {
    background: '#ef4444',
    border: 'none',
    padding: '0.4rem 1rem',
    color: 'white',
    borderRadius: 999,
    cursor: 'pointer',
  },
};
