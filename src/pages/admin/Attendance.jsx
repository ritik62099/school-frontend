// src/pages/Attendance.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState(''); 
  const [assignedClasses, setAssignedClasses] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch user data and set assigned classes
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
      setSelectedClass(classes[0]); // Auto-select first class
    };

    fetchUserData();
  }, []);

  // ✅ Fetch attendance ONLY when selectedClass is valid
  useEffect(() => {
    // ✅ Don't fetch if class is empty
    if (!selectedClass) return;

    const fetchAttendanceData = async () => {
      try {
        // ✅ Fetch students for selected class
        const studentsRes = await fetch(`https://school-api-gd9l.onrender.com/api/students?class=${encodeURIComponent(selectedClass)}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!studentsRes.ok) throw new Error('Failed to load students');
        const studentsData = await studentsRes.json();

        // ✅ Fetch existing attendance for selected date and class
        const attendanceRes = await fetch(
          `https://school-api-gd9l.onrender.com/api/attendance?date=${encodeURIComponent(date)}&class=${encodeURIComponent(selectedClass)}`, 
          {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }
        );

        let existingRecords = [];
        if (attendanceRes.ok) {
          const attendanceData = await attendanceRes.json();
          existingRecords = attendanceData.records || [];
        }

        // ✅ Merge students with attendance status
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
  }, [selectedClass, date]); // ✅ Only run when class or date changes



  // ✅ Fetch students for selected class
  const fetchStudentsForClass = async (className) => {
    setLoading(true);
    try {
      const res = await fetch(`https://school-api-gd9l.onrender.com/api/students?class=${encodeURIComponent(className)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) throw new Error('Failed to load students');
      
      const data = await res.json();
      setStudents(data.map(s => ({ ...s, present: true })));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle class change
  const handleClassChange = (e) => {
    const className = e.target.value;
    setSelectedClass(className);
    fetchStudentsForClass(className);
  };

  const toggleAttendance = (id) => {
    setStudents(prev => 
      prev.map(s => s._id === id ? { ...s, present: !s.present } : s)
    );
  };

  // In handleSubmit
const handleSubmit = async () => {
  const attendanceData = {
    date,
    class: selectedClass, // ✅ Include class
    records: students.map(s => ({
      studentId: s._id,
      present: s.present
    }))
  };

  try {
    const res = await fetch('https://school-api-gd9l.onrender.com/api/attendance', {
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

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Mark Attendance</h2>
      
      {error && <p style={styles.error}>{error}</p>}
      
      {/* ✅ Date + Class Dropdown */}
      <div style={styles.controls}>
        <div style={styles.controlGroup}>
          <label>Date: </label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            style={styles.input}
          />
        </div>
        
        <div style={styles.controlGroup}>
          <label>Class: </label>
          <select
            value={selectedClass}
            onChange={handleClassChange}
            style={styles.select}
            disabled={loading}
          >
            <option value="">Select Class</option>
            {assignedClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p style={styles.empty}>No students found in {selectedClass} class.</p>
      ) : (
        <div style={styles.tableContainer}>
          <h3 style={styles.classHeader}>{selectedClass} Class</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No</th>
                <th>Present</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.rollNo}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={student.present}
                      onChange={() => toggleAttendance(student._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.buttonGroup}>
        <button 
          onClick={handleSubmit} 
          disabled={loading || students.length === 0 || !selectedClass}
          style={styles.submitBtn}
        >
          Save Attendance
        </button>
        <button onClick={() => navigate('/dashboard')} style={styles.cancelBtn}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '2rem', fontFamily: 'Arial' },
  title: { color: '#2c3e50', marginBottom: '1.5rem' },
  error: { color: 'red', marginBottom: '1rem', textAlign: 'center' },
  empty: { textAlign: 'center', color: '#7f8c8d', fontStyle: 'italic' },
  
  // ✅ Controls styling
  controls: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap'
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  input: { 
    padding: '0.5rem', 
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  select: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    minWidth: '120px'
  },
  
  classHeader: {
    color: '#2c3e50',
    marginBottom: '1rem',
    fontSize: '1.3rem'
  },
  tableContainer: { 
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse',
    minWidth: '500px'
  },
  buttonGroup: { 
    display: 'flex', 
    gap: '1rem',
    marginTop: '2rem'
  },
  submitBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default Attendance;