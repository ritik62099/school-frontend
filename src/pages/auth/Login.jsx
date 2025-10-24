

// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Logologin from '../../assets/login.png';
import Logins from '../../assets/Logins.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
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
            alt="Login illustration"
            style={styles.illustrationImg}
          />
          <h2 style={styles.illustrationTitle}>Welcome Back!</h2>
          <p style={styles.illustrationText}>Sign in to continue to your dashboard.</p>
        </div>

        {/* Login Form */}
        <div style={styles.formCard}>
          <div style={styles.logo}>
            <img 
              src={Logologin} 
              alt="School Logo" 
              style={styles.logoImg}
            />
          </div>
          <h1 style={styles.title}>Login</h1>
          {error && <div style={styles.alertError}>{error}</div>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.8 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p style={styles.switch}>
            Don’t have an account?{' '}
            <Link to="/signup" style={styles.link}>Sign Up</Link>
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
    backgroundColor: '#3498db',
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
    backgroundColor: '#3498db',
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

export default Login;