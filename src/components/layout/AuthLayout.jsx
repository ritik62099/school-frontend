// src/components/layout/AuthLayout.jsx
import React from 'react';
import Logins from '../../assets/Logins.png';

const AuthLayout = ({ children, title, illustrationText }) => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Mobile: hide illustration on small screens */}
        <div className="illustration-side">
          <img src={Logins} alt="Illustration" className="illustration-img" />
          <h2 className="illustration-title">{title}</h2>
          <p className="illustration-text">{illustrationText}</p>
        </div>

        <div className="form-card">
          {children}
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f0f2f5;
          padding: 1rem;
          font-family: "Segoe UI", system-ui, sans-serif;
        }
        .auth-container {
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
        .illustration-img { width: 180px; }
        .illustration-title { font-size: 1.75rem; font-weight: 700; margin: 0; }
        .illustration-text { font-size: 1rem; opacity: 0.9; max-width: 300px; }

        .form-card {
          flex: 1;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Shared form styles */
        .input-group { display: flex; flex-direction: column; }
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
        .btn {
          padding: 0.875rem;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-send { background-color: #3498db; }
        .btn-send:hover:not(:disabled) { background-color: #2980b9; }
        .btn-back { background-color: #95a5a6; }
        .btn-back:hover { background-color: #7f8c8d; }
        .btn:disabled { opacity: 0.8; cursor: not-allowed; }

        .alert-error {
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
        .auth-link:hover { text-decoration: underline; }

        /* Mobile: hide illustration on small screens */
        @media (max-width: 768px) {
          .illustration-side { display: none; }
          .auth-container { flex-direction: column; border-radius: 12px; }
          .form-card { padding: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;