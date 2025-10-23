// src/pages/admin/StudentsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token');
        }

        const res = await fetch('https://school-api-gd9l.onrender.com/api/students', {
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
        setError("Unable to load students. Please try again.");
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
                        crossOrigin="anonymous" // ✅ Helps with CORS
                        onError={(e) => {
                          console.warn('Failed to load image:', student.photo);
                          e.target.style.display = 'none';
                          // Show fallback
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

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
    border: '1px solid #e2e8f0'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px'
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
  `
};

export default StudentsList;