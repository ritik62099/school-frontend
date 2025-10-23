// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("If this email is registered, a reset link has been sent.");
  };

  return (
    <>
      <style>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #fff3e0, #f5f5f5);
          padding: 20px;
        }
        .auth-card {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 450px;
        }
        .auth-title {
          text-align: center;
          margin-bottom: 24px;
          color: #e65100;
          font-size: 28px;
          font-weight: 600;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
        }
        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 16px;
        }
        input:focus {
          outline: none;
          border-color: #e65100;
          box-shadow: 0 0 0 2px rgba(230,81,0,0.2);
        }
        .auth-btn {
          width: 100%;
          padding: 12px;
          background: #e65100;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }
        .auth-btn:hover {
          background: #bf360c;
        }
        .auth-footer {
          text-align: center;
          margin-top: 20px;
          color: #555;
        }
        .auth-footer a {
          color: #e65100;
          text-decoration: none;
          font-weight: 600;
        }
        .auth-footer a:hover {
          text-decoration: underline;
        }
        .success {
          color: #2e7d32;
          margin-top: 12px;
          text-align: center;
          font-size: 14px;
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Forgot Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Enter your email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {message && <div className="success">{message}</div>}
            <button type="submit" className="auth-btn">Send Reset Link</button>
          </form>
          <div className="auth-footer">
            <p>
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}