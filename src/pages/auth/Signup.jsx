// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Logosignup from '../../assets/user.png';
import Logins from '../../assets/Logins.png';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, requestOtp } = useAuth();
  const navigate = useNavigate();

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
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        {/* Illustration Side */}
        <div style={styles.illustration}>
          <img
            src={Logins}
            alt="Signup illustration"
            style={styles.illustrationImg}
          />
          <h2 style={styles.illustrationTitle}>Join Us!</h2>
          <p style={styles.illustrationText}>Create an account to get started.</p>
        </div>

        {/* Signup Form */}
        <div style={styles.formCard}>
          <div style={styles.logo}>
            <img 
              src={Logosignup}
              alt="School Logo" 
              style={styles.logoImg}
            />
          </div>
          <h1 style={styles.title}>Sign Up</h1>
          {error && <div style={styles.alertError}>{error}</div>}

          {!otpSent ? (
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
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={styles.input}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  backgroundColor: '#2ecc71',
                  opacity: loading ? 0.8 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} style={styles.form}>
              <p style={styles.otpInfo}>
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
                  inputMode="numeric"
                  style={styles.input}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  backgroundColor: '#2ecc71',
                  opacity: loading ? 0.8 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Signing up...' : 'Complete Signup'}
              </button>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                style={{
                  ...styles.button,
                  backgroundColor: '#95a5a6',
                  marginTop: '0.75rem',
                }}
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
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: '1rem',
    fontFamily: '"Segoe UI", system-ui, sans-serif',
  },
  container: {
    display: 'flex',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    maxWidth: '900px',
    width: '100%',
  },
  illustration: {
    flex: 1,
    backgroundColor: '#2ecc71',
    color: 'white',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    gap: '1.25rem',
  },
  illustrationImg: {
    width: '180px',
    height: 'auto',
  },
  illustrationTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    margin: 0,
  },
  illustrationText: {
    fontSize: '1rem',
    opacity: 0.9,
    maxWidth: '300px',
  },
  formCard: {
    flex: 1,
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  logoImg: {
    width: '60px',
    height: 'auto',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '0.875rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '0.875rem',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  alertError: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '0.75rem',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #fcc',
  },
  otpInfo: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '0.5rem',
    fontSize: '0.95rem',
  },
  switch: {
    textAlign: 'center',
    fontSize: '0.95rem',
    color: '#666',
  },
  link: {
    color: '#3498db',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Signup;