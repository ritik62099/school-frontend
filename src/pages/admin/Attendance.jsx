
// src/pages/Attendance.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [assignedClasses, setAssignedClasses] = useState([]);
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = JSON.parse(localStorage.getItem('user'));

      if (currentUser?.role === 'teacher' && !currentUser.canMarkAttendance) {
        setError('You do not have permission to mark attendance. Contact admin.');
        setLoading(false);
        return;
      }

      const classes = currentUser?.assignedClasses || [];
      if (classes.length === 0) {
        setError('You are not assigned to any class. Please contact admin.');
        setLoading(false);
        return;
      }

      setAssignedClasses(classes);
      setSelectedClass(classes[0]);
    };

    fetchUserData();
  }, []);

  // Fetch attendance data
  useEffect(() => {
    if (!selectedClass) return;

    const fetchAttendanceData = async () => {
      try {
        const studentsRes = await fetch(
  `${endpoints.students.list}?class=${encodeURIComponent(selectedClass)}`,
  {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }
);

        if (!studentsRes.ok) throw new Error('Failed to load students');
        const studentsData = await studentsRes.json();

        const attendanceRes = await fetch(endpoints.attendance.get(date, selectedClass), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        let existingRecords = [];
        if (attendanceRes.ok) {
          const attendanceData = await attendanceRes.json();
          existingRecords = attendanceData.records || [];
        }

        const studentsWithStatus = studentsData.map(student => {
          const record = existingRecords.find(r => r.studentId.toString() === student._id.toString());
          return {
            ...student,
            present: record ? record.present : true
          };
        });

        setStudents(studentsWithStatus);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedClass, date]);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const toggleAttendance = (id) => {
    setStudents(prev =>
      prev.map(s => s._id === id ? { ...s, present: !s.present } : s)
    );
  };

  const handleSubmit = async () => {
    const attendanceData = {
      date,
      class: selectedClass,
      records: students.map(s => ({
        studentId: s._id,
        present: s.present
      }))
    };

    try {
      const res = await fetch(endpoints.attendance.submit, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(attendanceData)
      });

      if (res.ok) {
        alert('Attendance updated successfully!');
        navigate('/dashboard');
      } else {
        const err = await res.json();
        alert('Failed: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error');
    }
  };

  // Helper: Custom checkbox style based on checked state
  const getCheckboxStyle = (checked) => ({
    width: '1.25rem',
    height: '1.25rem',
    border: checked ? '2px solid #27ae60' : '2px solid #ccc',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '0.75rem',
    backgroundColor: checked ? '#27ae60' : 'transparent',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    userSelect: 'none',
  });

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h1 style={styles.title}>Mark Attendance</h1>

        {error && <div style={styles.alertError}>{error}</div>}

        {/* Date & Class Controls */}
        <div style={styles.controls}>
          <div style={styles.controlItem}>
            <label style={styles.label}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.controlItem}>
            <label style={styles.label}>Class</label>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              style={styles.select}
              disabled={loading || assignedClasses.length === 0}
            >
              <option value="">Select Class</option>
              {assignedClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading / Empty / Table */}
        {loading ? (
          <div style={styles.loading}>Loading students...</div>
        ) : students.length === 0 ? (
          <div style={styles.emptyState}>
            No students found in <strong>{selectedClass}</strong> class.
          </div>
        ) : (
          <>
            <div style={styles.classTag}>{selectedClass}</div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Name</th>
                    <th style={styles.tableHeader}>Roll No</th>
                    <th style={styles.tableHeader}>Present</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student._id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{student.name}</td>
                      <td style={styles.tableCell}>{student.rollNo}</td>
                      <td style={styles.tableCell}>
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={student.present}
                            onChange={() => toggleAttendance(student._id)}
                            style={styles.checkbox}
                          />
                          <span style={getCheckboxStyle(student.present)}>
                            {student.present ? '✓' : ''}
                          </span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Buttons */}
        <div style={styles.buttonGroup}>
          <button
            onClick={handleSubmit}
            disabled={loading || students.length === 0 || !selectedClass}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              opacity: loading || students.length === 0 || !selectedClass ? 0.6 : 1,
              cursor: loading || students.length === 0 || !selectedClass ? 'not-allowed' : 'pointer'
            }}
          >
            Save Attendance
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    padding: '1rem',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: '"Segoe UI", system-ui, sans-serif',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    padding: '1.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '1.25rem',
    textAlign: 'center',
  },
  alertError: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1.25rem',
    border: '1px solid #fcc',
  },
  controls: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
  },
  controlItem: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    minWidth: '180px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#34495e',
  },
  input: {
    padding: '0.625rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
  select: {
    padding: '0.625rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3e%3cpath fill='%23666' d='M7 10l5 5 5-5z'/%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '16px 12px',
    paddingRight: '2rem',
  },
  loading: {
    textAlign: 'center',
    padding: '1.5rem',
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  emptyState: {
    textAlign: 'center',
    padding: '1.5rem',
    color: '#7f8c8d',
    fontStyle: 'italic',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px dashed #e0e0e0',
  },
  classTag: {
    backgroundColor: '#e8f4f8',
    color: '#2980b9',
    padding: '0.375rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'inline-block',
    marginBottom: '1rem',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #eee',
    marginTop: '0.5rem',
  },
  table: {
    width: '100%',
    minWidth: '500px',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: '0.9rem',
    borderBottom: '2px solid #eaeaea',
  },
  tableRow: {
    borderBottom: '1px solid #eee',
  },
  tableCell: {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    color: '#34495e',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    position: 'relative',
  },
  checkbox: {
    opacity: 0,
    position: 'absolute',
    width: '1.25rem',
    height: '1.25rem',
    margin: 0,
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '1.5rem',
    flexWrap: 'wrap',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonPrimary: {
    backgroundColor: '#27ae60',
    color: '#fff',
  },
  buttonSecondary: {
    backgroundColor: '#bdc3c7',
    color: '#fff',
  },
};

export default Attendance;