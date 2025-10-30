// src/pages/auth/Signup.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../assets/user.png';

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
      <div className="logo" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <img src={Logo} alt="User Icon" style={{ width: '60px' }} />
      </div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2c3e50', textAlign: 'center', margin: 0 }}>
        Sign Up
      </h1>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <Button disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </form>

      <p className="switch-text">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">Login</Link>
      </p>
    </AuthLayout>
  );
};

export default Signup;