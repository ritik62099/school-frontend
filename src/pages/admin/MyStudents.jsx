

// src/pages/teacher/MyStudents.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api'; // ✅ Import centralized API config

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        // ✅ Use centralized endpoint
        const res = await fetch(endpoints.students.myStudents, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch your students');
        }

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
      <h2>My Students</h2>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Back to Dashboard
      </button>

      {students.length === 0 ? (
        <p style={styles.center}>No students assigned to your classes.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Class</th>
              <th>Roll No</th>
              <th>Admission Date</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td><strong>{student.class}</strong></td>
                <td>{student.rollNo}</td>
                <td>{new Date(student.admissionDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ✅ Styles unchanged (as per your preference for internal CSS)
const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
  },
  center: {
    textAlign: 'center',
    marginTop: '2rem',
    fontSize: '1.1rem'
  },
  backBtn: {
    marginBottom: '1.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem'
  }
};

export default MyStudents;