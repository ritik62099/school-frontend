

// src/components/ui/BottomTabBar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomTabBar = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: 'Home', path: '/dashboard', icon: '🏠' },
    {
      label: userRole === 'admin' ? 'Teachers' : 'Students',
      path: userRole === 'admin' ? '/teachers' : '/my-students',
      icon: userRole === 'admin' ? '👨‍🏫' : '🧑‍🎓'
    }
  ];

  return (
    <div style={styles.bar}>
      {tabs.map(tab => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          style={{
            ...styles.tab,
            ...(location.pathname === tab.path ? styles.active : {})
          }}
        >
          <span style={{ fontSize: 20 }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

const styles = {
  bar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '0.7rem',
    borderTop: '1px solid #e5e7eb',
    boxShadow: '0 -5px 15px rgba(0,0,0,.1)',
  },
  tab: {
    border: 'none',
    background: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#94a3b8',
    fontSize: '0.75rem',
    cursor: 'pointer',
    padding: '0.4rem 0.8rem',
    borderRadius: 12,
  },
  active: {
    background: '#eff6ff',
    color: '#2563eb',
    fontWeight: 600,
  },
};

export default BottomTabBar;
