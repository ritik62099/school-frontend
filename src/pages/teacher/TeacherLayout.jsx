// src/pages/teacher/TeacherLayout.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TeacherLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{`
        .teacher-container {
          display: flex;
          min-height: 100vh;
          background-color: #f0fdf4;
        }
        .sidebar {
          width: 220px;
          background: #065f46;
          color: white;
          padding: 20px 0;
        }
        .sidebar-header {
          padding: 0 20px 20px;
          border-bottom: 1px solid #0d9488;
        }
        .nav-link {
          display: block;
          padding: 12px 20px;
          color: #ccfbf1;
          text-decoration: none;
          font-size: 15px;
        }
        .nav-link:hover, .nav-link.active {
          background: #0d9488;
          color: white;
        }
        .main-content {
          flex: 1;
          padding: 24px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
        .logout-btn:hover {
          background: #dc2626;
        }
      `}</style>

      <div className="teacher-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>Teacher Panel</h3>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>
              Classes: {user?.assignedClasses?.join(', ') || '—'}
            </div>
          </div>
          <a href="/teacher/attendance" className="nav-link">Attendance</a>
          <a href="/teacher/marks" className="nav-link">Marks</a>
          <a href="/teacher/id-card" className="nav-link">ID Card</a>
          <a href="/teacher/admit-card" className="nav-link">Admit Card</a>
        </div>

        <div className="main-content">
          <div className="header">
            <h1>Teacher Dashboard</h1>
            <div>
              <span>Hello, {user?.name}</span>
              <button onClick={handleLogout} className="logout-btn" style={{ marginLeft: '12px' }}>
                Logout
              </button>
            </div>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}