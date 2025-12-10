

// src/pages/admin/Attendance.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';

const Attendance = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(getLocalDate());

  // 👉 NEW: school closed flag
  const [isSchoolClosed, setIsSchoolClosed] = useState(false);

  function getLocalDate() {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        setError('User not found. Please log in again.');
        setLoading(false);
        return;
      }

      if (currentUser.role === 'teacher') {
        // ✅ Filter only classes where canMarkAttendance is true
        const attendanceClasses = (currentUser.teachingAssignments || [])
          .filter(assignment => assignment.canMarkAttendance)
          .map(assignment => assignment.class);

        if (attendanceClasses.length === 0) {
          setError('You are not authorized to mark attendance for any class.');
          setLoading(false);
          return;
        }

        setAssignedClasses(attendanceClasses);
        setSelectedClass(attendanceClasses[0]);
      } else if (currentUser.role === 'admin') {
        // Admin can mark attendance for any class → fetch all classes
        try {
          const token = localStorage.getItem('token');
          const classesRes = await fetch(endpoints.classes.list, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!classesRes.ok) throw new Error('Failed to load classes');
          const allClasses = await classesRes.json();
          if (allClasses.length === 0) {
            setError('No classes found.');
            setLoading(false);
            return;
          }
          setAssignedClasses(allClasses);
          setSelectedClass(allClasses[0]);
        } catch (err) {
          setError('Failed to load class list: ' + (err.message || 'Unknown error'));
          setLoading(false);
          return;
        }
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;

    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // 🔹 Students fetch
        const studentsRes = await fetch(
          `${endpoints.students.list}?class=${encodeURIComponent(selectedClass)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!studentsRes.ok) throw new Error('Failed to load students');
        const studentsData = await studentsRes.json();

        // 🔹 Attendance for this date/class
        const attendanceRes = await fetch(
          endpoints.attendance.get(date, selectedClass),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let existingRecords = [];
        let closedFlag = false;

        if (attendanceRes.ok) {
          const attendanceData = await attendanceRes.json();
          existingRecords = attendanceData.records || [];
          closedFlag = !!attendanceData.isSchoolClosed; // 👈 backend se flag
        }

        // 🔹 Flag set karo
        setIsSchoolClosed(closedFlag);

        // Agar school closed hai, phir bhi students la rahe hain,
        // future me use ho sakte hain (but list show nahi karenge).
        const studentsWithStatus = studentsData.map(student => {
          const record = existingRecords.find(
            r => r.studentId.toString() === student._id.toString()
          );
          return { ...student, present: record ? record.present : true };
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

  const handleClassChange = (e) => setSelectedClass(e.target.value);

  const toggleAttendance = (id) => {
    setStudents(prev =>
      prev.map(s => s._id === id ? { ...s, present: !s.present } : s)
    );
  };

  const handleSubmit = async () => {
    const attendanceData = {
      date,
      class: selectedClass,
      isSchoolClosed,               // 👈 NEW
      records: isSchoolClosed
        ? []                       // school closed -> koi records nahi
        : students.map(s => ({
            studentId: s._id,
            present: s.present
          })),
    };

    try {
      const res = await fetch(endpoints.attendance.submit, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(attendanceData),
      });
      if (res.ok) {
        alert('Attendance updated successfully!');
        navigate('/dashboard');
      } else {
        const err = await res.json();
        alert('Failed: ' + (err.message || 'Unknown error'));
      }
    } catch {
      alert('Network error');
    }
  };

  const getCheckboxStyle = (checked) => ({
    width: '2rem',
    height: '2rem',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '0.75rem',
    backgroundColor: checked ? '#27ae60' : '#f8f9fa',
    border: checked ? 'none' : '1px solid #ddd',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    cursor: 'pointer',
  });

  return (
    <div style={styles.pageContainer} className="page-container">
      <style>{responsiveCSS}</style>
      <div style={styles.card} className="card">
        <h1 style={styles.title} className="title">Mark Attendance</h1>
        {error && <div style={styles.alertError} className="alertError">{error}</div>}
        
        <div style={styles.controls} className="controls">
          <div style={styles.controlItem} className="control-item">
            <label style={styles.label}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
              className="input"
            />
          </div>
          <div style={styles.controlItem} className="control-item">
            <label style={styles.label}>Class</label>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              style={styles.select}
              className="select"
              disabled={loading || assignedClasses.length === 0}
            >
              <option value="">Select Class</option>
              {assignedClasses.map(cls => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 👇 NEW: School Closed / Holiday toggle */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={isSchoolClosed}
              onChange={(e) => setIsSchoolClosed(e.target.checked)}
            />
            <span style={{ fontWeight: 600, color: '#c0392b' }}>
              Mark this day as <u>School Closed / Holiday</u>
            </span>
          </label>
          {isSchoolClosed && (
            <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
              Attendance of this day will <strong>not</strong> be counted in reports.
            </div>
          )}
        </div>

        {loading ? (
          <div style={styles.loading}>Loading students...</div>
        ) : isSchoolClosed ? (
          <div style={styles.emptyState}>
            This day is marked as <strong>School Closed / Holiday</strong>.<br />
            No student-wise attendance is required.
          </div>
        ) : students.length === 0 ? (
          <div style={styles.emptyState}>
            No students found in <strong>{selectedClass}</strong> class.
          </div>
        ) : (
          <div style={styles.tableWrapper} className="table-wrapper">
            <table style={styles.table}>
              <tbody>
                {students.map(student => (
                  <tr key={student._id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label style={styles.checkboxLabel} className="checkbox-label">
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
                        <div style={{ flex: 1, marginLeft: '0.5rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                            {student.name}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                            Roll No: {student.rollNo}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={styles.buttonGroup} className="button-group">
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              !selectedClass ||
              (!isSchoolClosed && students.length === 0)
            }
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              opacity:
                loading ||
                !selectedClass ||
                (!isSchoolClosed && students.length === 0)
                  ? 0.6
                  : 1,
              cursor:
                loading ||
                !selectedClass ||
                (!isSchoolClosed && students.length === 0)
                  ? 'not-allowed'
                  : 'pointer',
            }}
            className="button"
          >
            Save Attendance
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ ...styles.button, ...styles.buttonSecondary }}
            className="button"
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
    fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    padding: '1.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
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
    flex: 1,
    minWidth: '180px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: '#34495e',
  },
  input: {
    padding: '0.625rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  select: {
    padding: '0.625rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
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
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px dashed #e0e0e0',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #eee',
    marginTop: '0.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
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
  },
  checkbox: {
    opacity: 0,
    position: 'absolute',
    width: '2rem',
    height: '2rem',
    margin: 0,
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
    fontWeight: 600,
    borderRadius: '8px',
    border: 'none',
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

const responsiveCSS = `
@media (max-width: 1024px) {
  .controls { flex-wrap: wrap; gap: 1rem !important; }
  .control-item { flex: 1 1 45%; }
}
@media (max-width: 768px) {
  .controls { flex-direction: column !important; }
  .input, .select { width: 100% !important; padding: 0.75rem !important; }
  .title { font-size: 1.5rem !important; }
  .button-group { flex-direction: column !important; }
  .button { width: 100% !important; padding: 0.85rem 1rem !important; border-radius: 10px; }
}
@media (max-width: 480px) {
  .page-container { padding: 0.8rem !important; }
  .card { padding: 1rem !important; }
  .title { font-size: 1.3rem !important; }
}
`;

export default Attendance;
