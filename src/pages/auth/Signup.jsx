// src/pages/auth/Signup.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../assets/user.png';

const styles = {
  container: {
    width: '100%',
    maxWidth: '420px',
    margin: '0 auto',
    padding: '24px 16px',
    boxSizing: 'border-box',
  },
  logoWrapper: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  logoImg: {
    width: '60px',
    maxWidth: '100%',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#2c3e50',
    textAlign: 'center',
    margin: 0,
  },
  error: {
    marginTop: '14px',
    marginBottom: '10px',
    padding: '8px 10px',
    borderRadius: '6px',
    background: '#ffe5e5',
    color: '#c0392b',
    fontSize: '0.9rem',
  },
  form: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  button: {
    width: '100%',
  },
  switchText: {
    marginTop: '18px',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#7f8c8d',
  },
  link: {
    color: '#3498db',
    fontWeight: 600,
    textDecoration: 'none',
  },
};

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <AuthLayout
      title="Join Us!"
      illustrationText="Create an account to get started."
    >
      <div style={styles.container}>
        
        <div style={styles.logoWrapper}>
          <img src={Logo} alt="User Icon" style={styles.logoImg} />
        </div>

        <h1 style={styles.title}>Sign Up</h1>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%' }}
          />
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%' }}
          />
          <Input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%' }}
          />

          <Button disabled={loading} style={styles.button}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;
