


// src/pages/TeachersList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { endpoints } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import BottomTabBar from '../../components/ui/BottomTabBar';

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const isMobile = useMemo(() => window.innerWidth <= 768, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(endpoints.teachers.list, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to load teachers');
        const data = await res.json();
        setTeachers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(endpoints.teachers.approve(id), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        setTeachers((prev) =>
          prev.map((t) => (t._id === id ? { ...t, isApproved: true } : t))
        );
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to approve teacher');
      }
    } catch {
      alert('Server error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(endpoints.teachers.delete(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        setTeachers((prev) => prev.filter((t) => t._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete teacher');
      }
    } catch {
      alert('Server error');
    }
  };

  // ✅ NEW: Reset / change password (only admin ko token se allow karo backend pe)
  const handleResetPassword = async (id, name) => {
    const newPassword = window.prompt(`Enter new password for "${name}":`);
    if (!newPassword) return;

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await fetch(endpoints.teachers.resetPassword(id), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to reset password');
        return;
      }

      alert('Password reset successfully!');
      // password front-end pe kabhi show nahi karna
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  const showBottomTab =
    isMobile &&
    ['/dashboard', '/my-students', '/attendance', '/teachers', '/profile'].includes(location.pathname);

  return (
    <>
      <style>{`
        .teachers-page {
          background: linear-gradient(to bottom right, #e0f2fe, #ecfdf5);
          min-height: 100vh;
          padding: 2rem 1rem ${showBottomTab ? '80px' : '2rem'};
          font-family: 'Segoe UI', sans-serif;
          color: #1e293b;
        }

        .teachers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
          gap: 0.8rem;
        }

        .teachers-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1e3a8a;
        }

        .teachers-back-btn {
          background: #2563eb;
          color: white;
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .teachers-back-btn:hover {
          background: #1d4ed8;
        }

        .teachers-table-container {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
          overflow-x: auto;
        }

        table.teachers-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }

        table.teachers-table th {
          background-color: #2563eb;
          color: white;
          padding: 1rem;
          text-align: left;
          font-size: 0.95rem;
          font-weight: 600;
        }

        table.teachers-table td {
          padding: 0.9rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-size: 0.95rem;
        }

        table.teachers-table tr:hover {
          background-color: #f8fafc;
        }

        .teachers-approve-btn,
        .teachers-delete-btn,
        .teachers-reset-btn {
          border: none;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          font-size: 0.85rem;
        }

        .teachers-approve-btn {
          background-color: #16a34a;
          color: white;
        }
        .teachers-approve-btn:hover {
          background-color: #15803d;
        }

        .teachers-delete-btn {
          background-color: #dc2626;
          color: white;
          margin-left: 0.5rem;
        }
        .teachers-delete-btn:hover {
          background-color: #b91c1c;
        }

        .teachers-reset-btn {
          background-color: #f59e0b;
          color: white;
          margin-left: 0.5rem;
        }
        .teachers-reset-btn:hover {
          background-color: #d97706;
        }

        .teachers-status {
          font-weight: 700;
          color: #16a34a;
        }

        .teachers-error, .teachers-empty {
          text-align: center;
          padding: 1.5rem;
          border-radius: 10px;
          background: white;
          max-width: 500px;
          margin: 2rem auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          font-weight: 600;
        }
        .teachers-error { color: #b91c1c; }
        .teachers-empty { color: #64748b; }

        /* Mobile Cards */
        .mobile-cards {
          display: none;
          flex-direction: column;
          gap: 1rem;
        }

        .teacher-card {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.07);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .teacher-card h3 {
          font-size: 1.1rem;
          color: #1e3a8a;
          margin: 0;
        }

        .teacher-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: #475569;
        }

        .teacher-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .teachers-table-container { display: none; }
          .mobile-cards { display: flex; }
          .teachers-title { font-size: 1.5rem; }
        }
      `}</style>

      <div className="teachers-page">
        <div className="teachers-header">
          <h1 className="teachers-title">👩‍🏫 Teachers List</h1>
          <button onClick={() => navigate('/dashboard')} className="teachers-back-btn">
            ← Back
          </button>
        </div>

        {loading && <p className="teachers-empty">Loading teachers...</p>}
        {error && <p className="teachers-error">❌ {error}</p>}

        {!loading && !error && teachers.length === 0 && (
          <p className="teachers-empty">No teachers found yet.</p>
        )}

        {!loading && teachers.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="teachers-table-container">
              <table className="teachers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    {teachers.some(t => t.subject) && <th>Subject</th>}
                    <th>Joining Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t._id}>
                      <td>{t.name}</td>
                      <td>{t.email}</td>
                      {t.subject && <td>{t.subject}</td>}
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>
                        {t.isApproved ? (
                          <span className="teachers-status">✅ Approved</span>
                        ) : (
                          <button
                            onClick={() => handleApprove(t._id)}
                            className="teachers-approve-btn"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(t._id, t.name)}
                          className="teachers-delete-btn"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleResetPassword(t._id, t.name)}
                          className="teachers-reset-btn"
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-cards">
              {teachers.map((t) => (
                <div key={t._id} className="teacher-card">
                  <h3>{t.name}</h3>
                  <div className="teacher-info"><span>Email:</span> {t.email}</div>
                  {t.subject && (
                    <div className="teacher-info">
                      <span>Subject:</span> {t.subject}
                    </div>
                  )}
                  <div className="teacher-info">
                    <span>Joined:</span> {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                  <div className="teacher-info">
                    <span>Status:</span> {t.isApproved ? '✅ Approved' : '⏳ Pending'}
                  </div>
                  <div className="teacher-buttons">
                    {!t.isApproved && (
                      <button
                        onClick={() => handleApprove(t._id)}
                        className="teachers-approve-btn"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleResetPassword(t._id, t.name)}
                      className="teachers-reset-btn"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => handleDelete(t._id, t.name)}
                      className="teachers-delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showBottomTab && <BottomTabBar userRole={currentUser?.role} />}
    </>
  );
};

export default TeachersList;
