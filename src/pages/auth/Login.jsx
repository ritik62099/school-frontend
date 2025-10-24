// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
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
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f0f2f5;
          padding: 1rem;
          font-family: "Segoe UI", system-ui, sans-serif;
        }
        .login-container {
          display: flex;
          background-color: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
          max-width: 900px;
          width: 100%;
        }
        .illustration-side {
          flex: 1;
          background-color: #3498db;
          color: white;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          gap: 1.25rem;
        }
        .illustration-img {
          width: 180px;
          height: auto;
        }
        .illustration-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
        }
        .illustration-text {
          font-size: 1rem;
          opacity: 0.9;
          max-width: 300px;
        }
        .form-side {
          flex: 1;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .logo {
          text-align: center;
          margin-bottom: 0.5rem;
        }
        .logo-img {
          width: 60px;
          height: auto;
        }
        .form-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #2c3e50;
          text-align: center;
          margin: 0;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .input-group {
          display: flex;
          flex-direction: column;
        }
        .form-input {
          padding: 0.875rem;
          font-size: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: #3498db;
        }
        .submit-btn {
          padding: 0.875rem;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .submit-btn:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }
        .submit-btn:hover:not(:disabled) {
          background-color: #2980b9;
        }
        .error-alert {
          background-color: #fee;
          color: #c33;
          padding: 0.75rem;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #fcc;
        }
        .switch-text {
          text-align: center;
          font-size: 0.95rem;
          color: #666;
        }
        .auth-link {
          color: #3498db;
          font-weight: 600;
          text-decoration: none;
        }
        .auth-link:hover {
          text-decoration: underline;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
            border-radius: 12px;
          }
          .illustration-side {
            padding: 1.5rem;
          }
          .illustration-img {
            width: 140px;
          }
          .illustration-title {
            font-size: 1.4rem;
          }
          .form-side {
            padding: 2rem 1.5rem;
          }
          .form-title {
            font-size: 1.6rem;
          }
        }

        @media (max-width: 480px) {
          .illustration-side {
            padding: 1.25rem;
          }
          .illustration-img {
            width: 120px;
          }
          .illustration-title {
            font-size: 1.25rem;
          }
          .illustration-text {
            font-size: 0.9rem;
          }
          .form-side {
            padding: 1.75rem 1.25rem;
          }
          .form-title {
            font-size: 1.5rem;
          }
          .form-input, .submit-btn {
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div className="login-page">
        <div className="login-container">
          {/* Illustration Side */}
          <div className="illustration-side">
            <img
              src={Logins}
              alt="Login illustration"
              className="illustration-img"
            />
            <h2 className="illustration-title">Welcome Back!</h2>
            <p className="illustration-text">Sign in to continue to your dashboard.</p>
          </div>

          {/* Login Form */}
          <div className="form-side">
            <div className="logo">
              <img 
                src={Logologin} 
                alt="School Logo" 
                className="logo-img"
              />
            </div>
            <h1 className="form-title">Login</h1>
            {error && <div className="error-alert">{error}</div>}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <p className="switch-text">
              Don’t have an account?{' '}
              <Link to="/signup" className="auth-link">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;