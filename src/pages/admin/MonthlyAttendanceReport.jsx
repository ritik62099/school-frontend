

// src/pages/teacher/MonthlyAttendanceReport.jsx
import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { endpoints } from '../../config/api';

const MonthlyAttendanceReport = () => {
  const [report, setReport] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    class: '',
    studentId: '',
    year: new Date().getFullYear().toString(),
    month: String(new Date().getMonth() + 1).padStart(2, '0'),
  });

  const [assignedStudents, setAssignedStudents] = useState([]);
  const [eligibleClasses, setEligibleClasses] = useState([]);
  const [eligibleStudents, setEligibleStudents] = useState([]);

  // 🔹 Step 1: Fetch ONLY students assigned to the teacher
  useEffect(() => {
    const fetchAssignedStudents = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(endpoints.students.myStudents, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAssignedStudents(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load assigned students:', err);
      }
    };
    fetchAssignedStudents();
  }, []);

  // 🔹 Step 2: Filter classes & students based on "canMarkAttendance"
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'teacher') {
      // Non-teachers shouldn't be here, but handle gracefully
      setEligibleClasses([]);
      setEligibleStudents([]);
      return;
    }

    // Get assignments where teacher can mark attendance
    const attendanceAssignments = (user.teachingAssignments || []).filter(
      (a) => a.canMarkAttendance === true
    );

    const classes = [...new Set(attendanceAssignments.map((a) => a.class))];
    const students = assignedStudents.filter((stu) =>
      attendanceAssignments.some((a) => a.class === stu.class)
    );

    setEligibleClasses(classes);
    setEligibleStudents(students);
  }, [assignedStudents]);

  // 🔹 Filter students by selected class (only from eligible ones)
  const filteredStudents = formData.class
    ? eligibleStudents.filter((s) => s.class === formData.class)
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'class') {
        return { ...prev, class: value, studentId: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId) {
      setError('Please select a student');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const url = endpoints.attendance.studentMonthly(
        formData.studentId,
        formData.year,
        formData.month
      );

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to load report');
      }

      const data = await res.json();
      setStudentInfo(data.student);
      setReport(data.report);
    } catch (err) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (report.length === 0 || !studentInfo) return;

    const headers = ['Date', 'Student Name', 'Class', 'Roll No', 'Status'];
    const csvContent = [
      headers.join(','),
      ...report.map((row) =>
        [
          row.date,
          `"${studentInfo.name}"`,
          studentInfo.class,
          studentInfo.rollNo,
          row.present ? 'Present' : 'Absent',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(
      blob,
      `attendance-${studentInfo.name}-${formData.year}-${formData.month}.csv`
    );
  };

  // 🔹 Handle case: no eligible classes
  if (eligibleClasses.length === 0 && assignedStudents.length > 0) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#e74c3c',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <h2>Attendance Report Access Denied</h2>
        <p>
          ❌ You are not authorized to view attendance reports for any class.
        </p>
        <p>
          Please contact the admin to assign <strong>attendance marking</strong>{' '}
          permission for your classes.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        Student Monthly Attendance Report
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        {/* Class Dropdown — ONLY eligible classes */}
        <select
          name="class"
          value={formData.class}
          onChange={handleChange}
          required
          style={{ padding: '0.5rem', flex: 1, minWidth: '150px' }}
        >
          <option value="">Select Class</option>
          {eligibleClasses.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        {/* Student Dropdown — ONLY eligible students in selected class */}
        <select
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          required
          disabled={!formData.class}
          style={{ padding: '0.5rem', flex: 1, minWidth: '180px' }}
        >
          <option value="">Select Student</option>
          {filteredStudents.map((stu) => (
            <option key={stu._id} value={stu._id}>
              {stu.name} (Roll: {stu.rollNo})
            </option>
          ))}
        </select>

        {/* Year */}
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          min="2020"
          max="2030"
          required
          style={{ padding: '0.5rem', width: '100px' }}
        />

        {/* Month */}
        <select
          name="month"
          value={formData.month}
          onChange={handleChange}
          required
          style={{ padding: '0.5rem', width: '120px' }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option
              key={i + 1}
              value={String(i + 1).padStart(2, '0')}
            >
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            minWidth: '120px',
          }}
        >
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {studentInfo && report.length > 0 && (
        <>
          <div
            style={{
              textAlign: 'center',
              marginBottom: '1rem',
              fontSize: '1.1rem',
              padding: '0.8rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
            }}
          >
            <strong>{studentInfo.name}</strong> — Class: {studentInfo.class}, Roll: {studentInfo.rollNo}
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <button
              onClick={downloadCSV}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              📥 Download CSV
            </button>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f1f1' }}>
                  <th style={tableHeaderStyle}>Date</th>
                  <th style={tableHeaderStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row, i) => (
                  <tr key={i} style={i % 2 === 0 ? { backgroundColor: '#fafafa' } : {}}>
                    <td style={tableCellStyle}>{row.date}</td>
                    <td
                      style={{
                        ...tableCellStyle,
                        color: row.present ? 'green' : 'red',
                        fontWeight: 'bold',
                      }}
                    >
                      {row.present ? '✅ Present' : '❌ Absent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const tableHeaderStyle = {
  padding: '0.75rem',
  textAlign: 'center',
  fontWeight: 'bold',
  borderBottom: '2px solid #ddd',
};

const tableCellStyle = {
  padding: '0.6rem',
  textAlign: 'center',
  borderBottom: '1px solid #eee',
};

export default MonthlyAttendanceReport;