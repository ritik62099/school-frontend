// src/pages/TeachersList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(endpoints.teachers.list, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
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

  return (
    <>
      <style>{`
        .teachers-container {
          padding: 1.5rem;
          font-family: Arial, sans-serif;
          background-color: #f8f9fa;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .teachers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 0.8rem;
        }
        .teachers-title {
          color: #2c3e50;
          margin: 0;
          font-size: 1.75rem;
        }
        .teachers-back-btn {
          padding: 0.6rem 1.2rem;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: background-color 0.2s;
        }
        .teachers-back-btn:hover {
          background-color: #2980b9;
        }
        .teachers-loading,
        .teachers-error,
        .teachers-empty {
          text-align: center;
          padding: 2rem;
        }
        .teachers-loading {
          font-size: 1.2rem;
          color: #7f8c8d;
        }
        .teachers-error {
          color: #e74c3c;
          font-size: 1.1rem;
        }
        .teachers-empty {
          color: #7f8c8d;
          font-style: italic;
          font-size: 1.1rem;
        }

        /* Desktop Table */
        .desktop-table-container {
          display: block;
        }
        .teachers-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 500px;
        }
        .teachers-table-container {
          overflow-x: auto;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .teachers-table th {
          background-color: #3498db;
          color: white;
          padding: 1rem 0.8rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.95rem;
        }
        .teachers-table tr {
          border-bottom: 1px solid #ecf0f1;
        }
        .teachers-table td {
          padding: 1rem 0.8rem;
          color: #2c3e50;
          font-size: 0.95rem;
        }

        /* Buttons */
        .teachers-approve-btn,
        .teachers-delete-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }
        .teachers-approve-btn {
          background-color: #2ecc71;
          color: white;
        }
        .teachers-approve-btn:hover {
          background-color: #27ae60;
        }
        .teachers-delete-btn {
          background-color: #e74c3c;
          color: white;
          margin-left: 0.6rem;
        }
        .teachers-delete-btn:hover {
          background-color: #c0392b;
        }

        /* Mobile: Card Layout */
        .mobile-cards-container {
          display: none;
          flex-direction: column;
          gap: 1rem;
        }
        .teacher-card {
          background-color: white;
          padding: 1rem;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .teacher-card-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
        }
        .teacher-card-row span:first-child {
          font-weight: 600;
          color: #555;
        }
        .teacher-card-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }
        .teachers-approve-btn,
        .teachers-delete-btn {
          flex: 1;
          text-align: center;
        }

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .desktop-table-container {
            display: none;
          }
          .mobile-cards-container {
            display: flex;
          }
        }

        @media (max-width: 480px) {
          .teachers-title {
            font-size: 1.35rem;
          }
        }
      `}</style>

      <div className="teachers-container">
        <div className="teachers-header">
          <h2 className="teachers-title">All Teachers</h2>
          <button onClick={() => navigate('/dashboard')} className="teachers-back-btn">
            ← Back to Dashboard
          </button>
        </div>

        {error && <p className="teachers-error">{error}</p>}

        {loading ? (
          <p className="teachers-loading">Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <p className="teachers-empty">No teachers found.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="teachers-table-container desktop-table-container">
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
                  {teachers.map((teacher) => (
                    <tr key={teacher._id}>
                      <td>{teacher.name}</td>
                      <td>{teacher.email}</td>
                      {teacher.subject !== undefined && <td>{teacher.subject}</td>}
                      <td>{new Date(teacher.createdAt).toLocaleDateString()}</td>
                      <td>
                        {teacher.isApproved ? (
                          <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Approved</span>
                        ) : (
                          <button onClick={() => handleApprove(teacher._id)} className="teachers-approve-btn">
                            Approve
                          </button>
                        )}
                      </td>
                      <td>
                        <button onClick={() => handleDelete(teacher._id, teacher.name)} className="teachers-delete-btn">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="mobile-cards-container">
              {teachers.map((teacher) => (
                <div key={teacher._id} className="teacher-card">
                  <div className="teacher-card-row"><span>Name:</span> {teacher.name}</div>
                  <div className="teacher-card-row"><span>Email:</span> {teacher.email}</div>
                  {teacher.subject && <div className="teacher-card-row"><span>Subject:</span> {teacher.subject}</div>}
                  <div className="teacher-card-row"><span>Joining:</span> {new Date(teacher.createdAt).toLocaleDateString()}</div>
                  <div className="teacher-card-row">
                    <span>Status:</span> {teacher.isApproved ? '✅ Approved' : 'Pending'}
                  </div>
                  <div className="teacher-card-buttons">
                    {!teacher.isApproved && (
                      <button onClick={() => handleApprove(teacher._id)} className="teachers-approve-btn">
                        Approve
                      </button>
                    )}
                    <button onClick={() => handleDelete(teacher._id, teacher.name)} className="teachers-delete-btn">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default TeachersList;