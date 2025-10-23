// src/pages/PendingApproval.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PendingApproval = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Account Pending Approval</h2>
        <p style={styles.message}>
          Your teacher account is under review. 
          Please wait for admin approval.
        </p>
        <p style={styles.note}>
          ⏳ You will receive an email once approved.
        </p>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '500px'
  },
  title: {
    color: '#e67e22',
    marginBottom: '1rem'
  },
  message: {
    fontSize: '1.1rem',
    color: '#2c3e50',
    marginBottom: '1.5rem'
  },
  note: {
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: '1.5rem'
  },
  logoutBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  }
};

export default PendingApproval;