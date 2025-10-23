// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false); // New state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, requestOtp } = useAuth();
  const navigate = useNavigate();

  // Handle "Send OTP" click
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestOtp(email);
      setOtpSent(true);
      setError('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Handle final signup (with OTP)
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Sign Up</h2>
      {error && <p style={styles.error}>{error}</p>}

      {!otpSent ? (
        // Step 1: Enter email → Send OTP
        <form onSubmit={handleSendOtp} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        // Step 2: Enter OTP → Complete signup
        <form onSubmit={handleSignup} style={styles.form}>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#2c3e50' }}>
            OTP sent to <strong>{email}</strong>
          </p>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              style={styles.input}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Signing up...' : 'Complete Signup'}
          </button>
          <button
            type="button"
            onClick={() => setOtpSent(false)}
            style={{ ...styles.button, backgroundColor: '#95a5a6', marginTop: '0.5rem' }}
          >
            ← Edit Email
          </button>
        </form>
      )}

      <p style={styles.switch}>
        Already have an account?{' '}
        <Link to="/login" style={styles.link}>Login</Link>
      </p>
    </div>
  );
};

// ... (same styles as before)

// Reuse same styles as Login (or customize if needed)
const styles = {
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#2c3e50',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#2ecc71',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  switch: {
    textAlign: 'center',
    marginTop: '1rem',
  },
  link: {
    color: '#3498db',
    textDecoration: 'none',
  },
};

export default Signup;