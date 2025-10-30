// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../assets/login.png';

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
    <AuthLayout
      title="Welcome Back!"
      illustrationText="Sign in to continue to your dashboard."
    >
      <div className="logo" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <img src={Logo} alt="School Logo" style={{ width: '60px' }} />
      </div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2c3e50', textAlign: 'center', margin: 0 }}>
        Login
      </h1>
      
      {error && <div className="alert-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      
      <p className="switch-text">
        Don’t have an account?{' '}
        <Link to="/signup" className="auth-link">Sign Up</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;