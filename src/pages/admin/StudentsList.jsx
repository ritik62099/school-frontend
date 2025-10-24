

// src/pages/admin/StudentsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token');
        }

        const res = await fetch(endpoints.students.list, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to fetch students');
        }

        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch students error:', err);
        setError('Unable to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudents();
  }, []);

  if (loading) return <div style={styles.center}>Loading students...</div>;
  if (error) return <div style={{ ...styles.center, color: 'red' }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2>All Students</h2>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Back to Dashboard
      </button>

      {students.length === 0 ? (
        <p style={styles.center}>No students found.</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Roll No</th>
                <th>Admission Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name || 'Student'}
                        style={styles.photo}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.textContent = '—';
                          fallback.style.cssText = styles.noPhotoFallback;
                          e.target.parentNode.appendChild(fallback);
                        }}
                      />
                    ) : (
                      <div style={styles.noPhoto}>—</div>
                    )}
                  </td>
                  <td>{student.name || '—'}</td>
                  <td><strong>{student.class || '—'}</strong></td>
                  <td>{student.section || '—'}</td>
                  <td>{student.rollNo || '—'}</td>
                  <td>
                    {student.admissionDate
                      ? new Date(student.admissionDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/admin/students/edit/${student._id}`)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ✅ Internal CSS (professional, clean)
const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  center: {
    textAlign: 'center',
    marginTop: '2rem',
    fontSize: '1.1rem'
  },
  backBtn: {
    marginBottom: '1.5rem',
    padding: '0.6rem 1.2rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600'
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '700px'
  },
  photo: {
    width: '48px',
    height: '48px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  noPhoto: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: '6px',
    color: '#94a3b8',
    fontSize: '18px',
    border: '1px solid #e2e8f0'
  },
  // Inline CSS string for dynamic fallback
  noPhotoFallback: `
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f1f1f1;
    border-radius: 6px;
    color: #94a3b8;
    font-size: 18px;
    border: 1px solid #e2e8f0;
  `,
  editBtn: {
    padding: '0.4rem 0.8rem',
    backgroundColor: '#2980b9',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  }
};

export default StudentsList;