// src/pages/TeachersList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch('https://school-api-gd9l.onrender.com/api/teachers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to load teachers');
        }

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
      const res = await fetch(`https://school-api-gd9l.onrender.com/api/teachers/approve/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        setTeachers(teachers.map(t => 
          t._id === id ? { ...t, isApproved: true } : t
        ));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to approve teacher');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>All Teachers</h2>
        <button 
          onClick={() => navigate('/dashboard')}
          style={styles.backButton}
        >
          ← Back to Dashboard
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={styles.loading}>Loading teachers...</p>
      ) : (
        <div style={styles.tableContainer}>
          {teachers.length === 0 ? (
            <p style={styles.empty}>No teachers found.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  {/* ✅ Only show Subject if you added it to User model */}
                  {teachers.some(t => t.subject) && <th style={styles.th}>Subject</th>}
                  <th style={styles.th}>Joining Date</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher._id} style={styles.tr}>
                    <td style={styles.td}>{teacher.name}</td>
                    <td style={styles.td}>{teacher.email}</td>
                    {/* ✅ Conditionally render subject */}
                    {teacher.subject !== undefined && (
                      <td style={styles.td}>{teacher.subject}</td>
                    )}
                    <td style={styles.td}>
                      {new Date(teacher.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      {teacher.isApproved ? (
                        <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Approved</span>
                      ) : (
                        <button 
                          onClick={() => handleApprove(teacher._id)}
                          style={styles.approveBtn}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    color: '#2c3e50',
    margin: 0,
  },
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.1rem',
    color: '#7f8c8d',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  empty: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px',
  },
  th: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '1rem',
    textAlign: 'left',
  },
  tr: {
    borderBottom: '1px solid #ecf0f1',
  },
  td: {
    padding: '1rem',
    color: '#2c3e50',
  },
  approveBtn: {
    padding: '0.4rem 0.8rem',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default TeachersList;