// // src/pages/Signup.jsx
// import React, { useState } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';
// import Logosignup from '../../assets/user.png';
// import Logins from '../../assets/Logins.png';

// const Signup = () => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const { signup, requestOtp } = useAuth();
//   const navigate = useNavigate();

//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       await requestOtp(email);
//       setOtpSent(true);
//       setError('');
//     } catch (err) {
//       setError(err.message);
//     }
//     setLoading(false);
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       await signup(name, email, password, otp);
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.message);
//     }
//     setLoading(false);
//   };

//   return (
//     <>
      // <style>{`
      //   .signup-page {
      //     min-height: 100vh;
      //     display: flex;
      //     justify-content: center;
      //     align-items: center;
      //     background-color: #f0f2f5;
      //     padding: 1rem;
      //     font-family: "Segoe UI", system-ui, sans-serif;
      //   }
      //   .signup-container {
      //     display: flex;
      //     background-color: #fff;
      //     border-radius: 16px;
      //     box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      //     overflow: hidden;
      //     max-width: 900px;
      //     width: 100%;
      //   }
      //   .illustration-side {
      //     flex: 1;
      //     background-color: #2ecc71;
      //     color: white;
      //     padding: 2.5rem;
      //     display: flex;
      //     flex-direction: column;
      //     justify-content: center;
      //     align-items: center;
      //     text-align: center;
      //     gap: 1.25rem;
      //   }
      //   .illustration-img {
      //     width: 180px;
      //     height: auto;
      //   }
      //   .illustration-title {
      //     font-size: 1.75rem;
      //     font-weight: 700;
      //     margin: 0;
      //   }
      //   .illustration-text {
      //     font-size: 1rem;
      //     opacity: 0.9;
      //     max-width: 300px;
      //   }
      //   .form-card {
      //     flex: 1;
      //     padding: 2.5rem;
      //     display: flex;
      //     flex-direction: column;
      //     gap: 1.5rem;
      //   }
      //   .logo {
      //     text-align: center;
      //     margin-bottom: 0.5rem;
      //   }
      //   .logo-img {
      //     width: 60px;
      //     height: auto;
      //   }
      //   .form-title {
      //     font-size: 1.8rem;
      //     font-weight: 700;
      //     color: #2c3e50;
      //     text-align: center;
      //     margin: 0;
      //   }
      //   .signup-form {
      //     display: flex;
      //     flex-direction: column;
      //     gap: 1.25rem;
      //   }
      //   .input-group {
      //     display: flex;
      //     flex-direction: column;
      //   }
      //   .form-input {
      //     padding: 0.875rem;
      //     font-size: 1rem;
      //     border: 1px solid #ddd;
      //     border-radius: 8px;
      //     transition: border-color 0.2s;
      //   }
      //   .form-input:focus {
      //     outline: none;
      //     border-color: #2ecc71;
      //   }
      //   .btn {
      //     padding: 0.875rem;
      //     color: white;
      //     border: none;
      //     border-radius: 8px;
      //     font-size: 1rem;
      //     font-weight: 600;
      //     cursor: pointer;
      //     transition: background-color 0.2s;
      //   }
      //   .btn-send {
      //     background-color: #2ecc71;
      //   }
      //   .btn-send:hover:not(:disabled) {
      //     background-color: #27ae60;
      //   }
      //   .btn-back {
      //     background-color: #95a5a6;
      //   }
      //   .btn-back:hover {
      //     background-color: #7f8c8d;
      //   }
      //   .btn:disabled {
      //     opacity: 0.8;
      //     cursor: not-allowed;
      //   }
      //   .alert-error {
      //     background-color: #fee;
      //     color: #c33;
      //     padding: 0.75rem;
      //     border-radius: 8px;
      //     text-align: center;
      //     border: 1px solid #fcc;
      //   }
      //   .otp-info {
      //     text-align: center;
      //     color: #2c3e50;
      //     margin-bottom: 0.5rem;
      //     font-size: 0.95rem;
      //   }
      //   .switch-text {
      //     text-align: center;
      //     font-size: 0.95rem;
      //     color: #666;
      //   }
      //   .auth-link {
      //     color: #3498db;
      //     font-weight: 600;
      //     text-decoration: none;
      //   }
      //   .auth-link:hover {
      //     text-decoration: underline;
      //   }

      //   /* Mobile Responsive */
      //   @media (max-width: 768px) {
      //     .signup-container {
      //       flex-direction: column;
      //       border-radius: 12px;
      //     }
      //     .illustration-side {
      //       padding: 1.5rem;
      //     }
      //     .illustration-img {
      //       width: 140px;
      //     }
      //     .illustration-title {
      //       font-size: 1.4rem;
      //     }
      //     .form-card {
      //       padding: 2rem 1.5rem;
      //     }
      //     .form-title {
      //       font-size: 1.6rem;
      //     }
      //   }

      //   @media (max-width: 480px) {
      //     .illustration-side {
      //       padding: 1.25rem;
      //     }
      //     .illustration-img {
      //       width: 120px;
      //     }
      //     .illustration-title {
      //       font-size: 1.25rem;
      //     }
      //     .illustration-text {
      //       font-size: 0.9rem;
      //     }
      //     .form-card {
      //       padding: 1.75rem 1.25rem;
      //     }
      //     .form-title {
      //       font-size: 1.5rem;
      //     }
      //     .form-input, .btn {
      //       font-size: 0.95rem;
      //       padding: 0.75rem;
      //     }
      //     .otp-info {
      //       font-size: 0.9rem;
      //     }
      //   }
      // `}</style>

//       <div className="signup-page">
//         <div className="signup-container">
//           {/* Illustration Side */}
//           <div className="illustration-side">
//             <img
//               src={Logins}
//               alt="Signup illustration"
//               className="illustration-img"
//             />
//             <h2 className="illustration-title">Join Us!</h2>
//             <p className="illustration-text">Create an account to get started.</p>
//           </div>

//           {/* Signup Form */}
//           <div className="form-card">
//             <div className="logo">
//               <img 
//                 src={Logosignup}
//                 alt="User Icon" 
//                 className="logo-img"
//               />
//             </div>
//             <h1 className="form-title">Sign Up</h1>
//             {error && <div className="alert-error">{error}</div>}

//             {!otpSent ? (
//               <form onSubmit={handleSendOtp} className="signup-form">
//                 <div className="input-group">
//                   <input
//                     type="text"
//                     placeholder="Full Name"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     required
//                     className="form-input"
//                   />
//                 </div>
//                 <div className="input-group">
//                   <input
//                     type="email"
//                     placeholder="Email Address"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     className="form-input"
//                   />
//                 </div>
//                 <div className="input-group">
//                   <input
//                     type="password"
//                     placeholder="Password (min 6 chars)"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     minLength={6}
//                     className="form-input"
//                   />
//                 </div>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="btn btn-send"
//                 >
//                   {loading ? 'Sending OTP...' : 'Send OTP'}
//                 </button>
//               </form>
//             ) : (
//               <form onSubmit={handleSignup} className="signup-form">
//                 <p className="otp-info">
//                   OTP sent to <strong>{email}</strong>
//                 </p>
//                 <div className="input-group">
//                   <input
//                     type="text"
//                     placeholder="Enter 6-digit OTP"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     required
//                     maxLength={6}
//                     inputMode="numeric"
//                     className="form-input"
//                   />
//                 </div>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="btn btn-send"
//                 >
//                   {loading ? 'Signing up...' : 'Complete Signup'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setOtpSent(false)}
//                   className="btn btn-back"
//                 >
//                   ← Edit Email
//                 </button>
//               </form>
//             )}

//             <p className="switch-text">
//               Already have an account?{' '}
//               <Link to="/login" className="auth-link">Login</Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Signup;

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password); // No OTP
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
            <style>{`
        .signup-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f0f2f5;
          padding: 1rem;
          font-family: "Segoe UI", system-ui, sans-serif;
        }
        .signup-container {
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
          background-color: #2ecc71;
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
        .form-card {
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
        .signup-form {
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
          border-color: #2ecc71;
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
        .btn-send {
          background-color: #2ecc71;
        }
        .btn-send:hover:not(:disabled) {
          background-color: #27ae60;
        }
        .btn-back {
          background-color: #95a5a6;
        }
        .btn-back:hover {
          background-color: #7f8c8d;
        }
        .btn:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }
        .alert-error {
          background-color: #fee;
          color: #c33;
          padding: 0.75rem;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #fcc;
        }
        .otp-info {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
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
          .signup-container {
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
          .form-card {
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
          .form-card {
            padding: 1.75rem 1.25rem;
          }
          .form-title {
            font-size: 1.5rem;
          }
          .form-input, .btn {
            font-size: 0.95rem;
            padding: 0.75rem;
          }
          .otp-info {
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div className="signup-page">
        <div className="signup-container">
          <div className="illustration-side">
            <img src={Logins} alt="Signup illustration" className="illustration-img" />
            <h2 className="illustration-title">Join Us!</h2>
            <p className="illustration-text">Create an account to get started.</p>
          </div>

          <div className="form-card">
            <div className="logo">
              <img src={Logosignup} alt="User Icon" className="logo-img" />
            </div>
            <h1 className="form-title">Sign Up</h1>
            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="form-input"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-send"
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>

            <p className="switch-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;