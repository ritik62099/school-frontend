// src/pages/teacher/MyStudents.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(endpoints.students.myStudents, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch your students');

        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load your students");
      } finally {
        setLoading(false);
      }
    };

    fetchMyStudents();
  }, []);

  if (loading) return <div style={styles.center}>Loading your students...</div>;
  if (error) return <div style={{ ...styles.center, color: 'red' }}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🎓 My Students</h2>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Back
        </button>
      </div>

      {students.length === 0 ? (
        <p style={styles.center}>No students assigned to your classes.</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Roll No</th>
                <th>Admission Date</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td data-label="Name">{student.name}</td>
                  <td data-label="Class">{student.class}</td>
                  <td data-label="Roll No">{student.rollNo}</td>
                  <td data-label="Admission Date">
                    {new Date(student.admissionDate).toLocaleDateString()}
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

// ✅ Improved styles for responsiveness & visual appeal
const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Inter, Arial, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '1.5rem'
  },
  title: {
    color: '#1e293b',
    fontSize: '1.8rem',
    fontWeight: '600'
  },
  backBtn: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease-in-out',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    backgroundColor: 'white'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px',
  },
  center: {
    textAlign: 'center',
    marginTop: '2rem',
    fontSize: '1.1rem',
    color: '#64748b'
  }
};

// ✅ Inline styles for responsive table (using CSS-in-JS)
const styleTag = document.createElement("style");
styleTag.innerHTML = `
table th, table td {
  padding: 0.8rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}
table thead {
  background-color: #eff6ff;
  color: #1e40af;
}
table tr:hover {
  background-color: #f1f5f9;
  transition: 0.2s;
}
@media (max-width: 768px) {
  table thead {
    display: none;
  }
  table, table tbody, table tr, table td {
    display: block;
    width: 100%;
  }
  table tr {
    margin-bottom: 1rem;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  }
  table td {
    padding: 0.8rem 1rem;
    text-align: right;
    position: relative;
  }
  table td::before {
    content: attr(data-label);
    position: absolute;
    left: 1rem;
    font-weight: 600;
    color: #334155;
    text-transform: capitalize;
  }
}`;
document.head.appendChild(styleTag);

export default MyStudents;
