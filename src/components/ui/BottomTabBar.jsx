// src/components/ui/BottomTabBar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomTabBar = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine label and path for the second tab
  let secondTabLabel, secondTabPath;
  if (userRole === 'teacher') {
    secondTabLabel = 'Students';
    secondTabPath = '/my-students';
  } else {
    // For admin or student role — show 'Teachers'
    secondTabLabel = 'Teachers';
    secondTabPath = '/teachers';
  }

  const tabs = [
    { label: 'Home', path: '/dashboard', icon: '🏠' },
    { label: secondTabLabel, path: secondTabPath, icon: userRole === 'teacher' ? '🧑‍🎓' : '👨‍🏫' },
    // { label: 'Profile', path: '/profile', icon: '👤' }
  ];

  return (
    <div style={styles.tabBar}>
      {tabs.map(tab => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          style={{
            ...styles.tab,
            ...(location.pathname === tab.path ? styles.activeTab : {})
          }}
        >
          <span style={styles.icon}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

const styles = {
  tabBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderTop: '1px solid #e2e8f0',
    padding: '0.75rem 0',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: '#94a3b8',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  activeTab: {
    color: '#2563eb',
    fontWeight: '600',
  },
  icon: {
    fontSize: '1.25rem',
    marginBottom: '0.25rem',
  }
};

export default BottomTabBar;