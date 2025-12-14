


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminMenu, getTeacherMenu } from '../../config/sidebarMenu';
import SchoolLogo from '../../assets/logo.png';

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const menu =
    user?.role === 'admin'
      ? adminMenu
      : getTeacherMenu(user?.teacherSummary) || [];

  const go = (path) => {
    navigate(path);
    if (isMobile) setOpen(false);
  };

  return (
    <>
      {/* ☰ Hamburger (mobile only) */}
      {isMobile && (
        <button onClick={() => setOpen(prev => !prev)} style={styles.hamburger}>
  {open ? '✕' : '☰'}
</button>
      )}

      {/* Overlay */}
      {isMobile && open && (
        <div style={styles.overlay} onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          transform: isMobile && !open ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        <div style={styles.inner}>
          <div style={styles.logoWrap}>
  <img
    src={SchoolLogo}
    alt="Ambika International School"
    style={styles.logoImg}
  />
  <span style={styles.logoText}>AMBIKA INTERNATIONAL SCHOOL</span>
</div>


          {menu.map(item => (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              style={{
                ...styles.item,
                ...(location.pathname === item.path ? styles.active : {}),
              }}
            >
              <span style={styles.icon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
};

const styles = {
  sidebar: {
    width: 230,
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    background: 'linear-gradient(180deg,#1e3a8a,#1e40af)',
    color: '#fff',
    overflowY: 'auto',
    transition: 'transform 0.3s ease',
    zIndex: 1001,
  },
  inner: { padding: '1.5rem 1rem' },
  logoWrap: {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  marginBottom: '2rem',
},

logoImg: {
  width: 36,
  height: 36,
  objectFit: 'contain',
  borderRadius: 50,
  background: '#fff',
  padding: 4,
},

logoText: {
  fontSize: '0.95rem',
  fontWeight: 700,
  lineHeight: 1.2,
},

  item: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: '#c7d2fe',
    padding: '0.75rem 1rem',
    borderRadius: 10,
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '0.35rem',
    fontSize: '0.95rem',
    textAlign: 'left',
  },
  active: {
    background: 'rgba(255,255,255,0.18)',
    color: '#fff',
    fontWeight: 600,
  },
  icon: { width: 22, textAlign: 'center' },

  hamburger: {
    position: 'fixed',
    top: 16,
    left: 16,
    zIndex: 1100,
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '0.45rem 0.7rem',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 1000,
  },
};

export default Sidebar;
