// // src/pages/admin/AdminLayout.jsx
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// export default function AdminLayout({ children }) {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   return (
//     <>
//       <style>{`
//         .admin-container {
//           display: flex;
//           min-height: 100vh;
//           background-color: #f8fafc;
//         }
//         .sidebar {
//           width: 240px;
//           background: #1e293b;
//           color: white;
//           padding: 20px 0;
//         }
//         .sidebar-header {
//           padding: 0 20px 20px;
//           border-bottom: 1px solid #334155;
//         }
//         .sidebar-header h3 {
//           font-size: 18px;
//           font-weight: 600;
//         }
//         .nav-link {
//           display: flex;
//           align-items: center;
//           padding: 12px 20px;
//           color: #cbd5e1;
//           text-decoration: none;
//           font-size: 15px;
//         }
//         .nav-link:hover, .nav-link.active {
//           background: #334155;
//           color: white;
//         }
//         .main-content {
//           flex: 1;
//           padding: 24px;
//         }
//         .header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 24px;
//         }
//         .user-info {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }
//         .logout-btn {
//           background: #ef4444;
//           color: white;
//           border: none;
//           padding: 8px 16px;
//           border-radius: 6px;
//           cursor: pointer;
//           font-weight: 500;
//         }
//         .logout-btn:hover {
//           background: #dc2626;
//         }
//       `}</style>

//       <div className="admin-container">
//         <div className="sidebar">
//           <div className="sidebar-header">
//             <h3>School Admin</h3>
//           </div>
//           <a href="/admin/dashboard" className="nav-link active">Dashboard</a>
//           <a href="/admin/teachers" className="nav-link">Teacher Approval</a>
//           <a href="/admin/students" className="nav-link">Manage Students</a>
//         </div>

//         <div className="main-content">
//           <div className="header">
//             <h1>Admin Dashboard</h1>
//             <div className="user-info">
//               <span>Welcome, {user?.name}</span>
//               <button onClick={handleLogout} className="logout-btn">Logout</button>
//             </div>
//           </div>
//           {children}
//         </div>
//       </div>
//     </>
//   );
// }

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        /* ... your existing styles ... */
        .nav-link {
          /* ... existing styles ... */
        }
        .nav-link:hover, .nav-link.active {
          background: #334155;
          color: white;
        }
        /* ... rest of styles ... */
      `}</style>

      <div className="admin-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>School Admin</h3>
          </div>
          <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/admin/teachers" className={`nav-link ${isActive('/admin/teachers') ? 'active' : ''}`}>
            Teacher Approval
          </Link>
          <Link to="/admin/students" className={`nav-link ${isActive('/admin/students') ? 'active' : ''}`}>
            Manage Students
          </Link>
        </div>

        <div className="main-content">
          <div className="header">
            <h1>Admin Dashboard</h1>
            <div className="user-info">
              <span>Welcome, {user?.name}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}