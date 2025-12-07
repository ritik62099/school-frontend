

// src/pages/teacher/MonthlyAttendanceReport.jsx
import React, { useState, useEffect } from 'react';
import { endpoints } from '../../config/api';

const MonthlyAttendanceReport = () => {
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [eligibleClasses, setEligibleClasses] = useState([]);

  const [formData, setFormData] = useState({
    class: '',
    year: new Date().getFullYear().toString(),
    month: String(new Date().getMonth() + 1).padStart(2, '0'),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Class-wise data
  const [classStudents, setClassStudents] = useState([]); // selected class ke students
  const [daysInMonth, setDaysInMonth] = useState(0);

  /**
   * studentMonthlyData:
   * {
   *   [studentId]: {
   *      report: [{date, present, isSchoolClosed}],
   *      byDay: {1:'P'|'A'|'H'|'-', 2:..., ...},
   *      presentDays: number,
   *      workingDays: number,
   *      percentage: string
   *   }
   * }
   */
  const [studentMonthlyData, setStudentMonthlyData] = useState({});

  // Detail view (row click)
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // 🔹 Step 1: fetch teacher ke assigned students
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

  // 🔹 Step 2: teacher ke teachingAssignments se allowed classes (canMarkAttendance==true)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'teacher') {
      setEligibleClasses([]);
      return;
    }

    const attendanceAssignments = (user.teachingAssignments || []).filter(
      (a) => a.canMarkAttendance === true
    );

    const classes = [...new Set(attendanceAssignments.map((a) => a.class))];
    setEligibleClasses(classes);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setSelectedStudentId(null);
    setClassStudents([]);
    setStudentMonthlyData({});

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate(); // month: 1..12

  // 🔹 Class ka monthly Excel-style report generate
  const handleGenerateReport = async (e) => {
    e.preventDefault();

    if (!formData.class) {
      setError('Please select a class');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSelectedStudentId(null);
      setStudentMonthlyData({});

      const { class: className, year, month } = formData;
      const token = localStorage.getItem('token');

      const yearNum = parseInt(year, 10);
      const monthNum = parseInt(month, 10);
      const totalDays = getDaysInMonth(yearNum, monthNum);
      setDaysInMonth(totalDays);

      // 1. Filter only students of that class from assignedStudents
      const studentsInClass = assignedStudents.filter(
        (s) => s.class === className
      );

      if (studentsInClass.length === 0) {
        setError('No students found in this class for you.');
        setClassStudents([]);
        return;
      }

      setClassStudents(studentsInClass);

      const resultData = {};

      // 2. For each student → call student-monthly API
      await Promise.all(
        studentsInClass.map(async (stu) => {
          try {
            const url = endpoints.attendance.studentMonthly(
              stu._id,
              year,
              month
            );

            const res = await fetch(url, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
              return;
            }

            const data = await res.json();
            const report = data.report || [];

            // Present / working totals
            const workingDays = report.filter((r) => !r.isSchoolClosed).length;
            const presentDays = report.filter(
              (r) => !r.isSchoolClosed && r.present
            ).length;
            const percentage =
              workingDays > 0
                ? ((presentDays / workingDays) * 100).toFixed(2)
                : '0.00';

            // byDay: 1..daysInMonth → 'P' / 'A' / 'H' / '-'
            const byDay = {};
            for (let day = 1; day <= totalDays; day++) {
              const dateStr = `${yearNum}-${String(monthNum).padStart(
                2,
                '0'
              )}-${String(day).padStart(2, '0')}`;

              const row = report.find((r) => r.date === dateStr);

              if (!row) {
                byDay[day] = '-'; // attendance hi nahi
              } else if (row.isSchoolClosed) {
                byDay[day] = 'H'; // Holiday
              } else {
                byDay[day] = row.present ? 'P' : 'A';
              }
            }

            resultData[stu._id] = {
              report,
              byDay,
              presentDays,
              workingDays,
              percentage,
            };
          } catch (err) {
            console.error('Error loading monthly data for', stu._id, err);
          }
        })
      );

      setStudentMonthlyData(resultData);
    } catch (err) {
      console.error(err);
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const monthLabel = new Date(
    Number(formData.year),
    Number(formData.month) - 1
  ).toLocaleString('default', { month: 'long' });

  // Detail: clicked student ka daily list
  const selectedStudent =
    selectedStudentId &&
    classStudents.find((s) => s._id === selectedStudentId);
  const selectedDetails =
    selectedStudentId &&
    studentMonthlyData[selectedStudentId] &&
    studentMonthlyData[selectedStudentId].report
      ? studentMonthlyData[selectedStudentId].report
      : null;

  const selectedSummary =
    selectedStudentId && studentMonthlyData[selectedStudentId]
      ? {
          presentDays: studentMonthlyData[selectedStudentId].presentDays,
          workingDays: studentMonthlyData[selectedStudentId].workingDays,
          percentage: studentMonthlyData[selectedStudentId].percentage,
        }
      : null;

  // 🔹 No class permission
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
        <p>❌ You are not authorized to view attendance reports for any class.</p>
        <p>
          Please contact the admin to assign{' '}
          <strong>attendance marking</strong> permission for your classes.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        Class Monthly Attendance (Excel Style View)
      </h2>

      {/* FILTER FORM */}
      <form
        onSubmit={handleGenerateReport}
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          alignItems: 'center',
        }}
      >
        {/* Class */}
        <select
          name="class"
          value={formData.class}
          onChange={handleChange}
          required
          style={{ padding: '0.5rem', minWidth: '150px' }}
        >
          <option value="">Select Class</option>
          {eligibleClasses.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
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
          max="2035"
          required
          style={{ padding: '0.5rem', width: '100px' }}
        />

        {/* Month */}
        <select
          name="month"
          value={formData.month}
          onChange={handleChange}
          required
          style={{ padding: '0.5rem', width: '140px' }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
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
            minWidth: '140px',
          }}
        >
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
      </form>

      {error && (
        <div
          style={{
            color: 'red',
            marginBottom: '1rem',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {/* EXCEL STYLE TABLE */}
      {classStudents.length > 0 &&
        Object.keys(studentMonthlyData).length > 0 && (
          <>
            <div
              style={{
                marginBottom: '0.5rem',
                fontWeight: 600,
              }}
            >
              Class: {formData.class} | Month: {monthLabel} {formData.year}
            </div>

            <div
              style={{
                overflowX: 'auto',
                borderRadius: '8px',
                border: '1px solid #ddd',
                marginBottom: '1.5rem',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.85rem',
                  minWidth: '900px',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f1f1f1' }}>
                    <th style={headerCellStyle}>Roll</th>
                    <th style={headerCellStyle}>Name</th>
                    {/* NEW TOTAL COLUMNS */}
                    <th style={headerCellStyle}>P</th>
                    <th style={headerCellStyle}>W</th>
                    <th style={headerCellStyle}>%</th>
                    {/* Days columns */}
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <th key={i + 1} style={headerCellStyle}>
                        {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((stu) => {
                    const stuData = studentMonthlyData[stu._id];
                    const byDay = stuData ? stuData.byDay : {};
                    const presentDays = stuData ? stuData.presentDays : 0;
                    const workingDays = stuData ? stuData.workingDays : 0;
                    const percentage = stuData ? stuData.percentage : '0.00';

                    return (
                      <tr
                        key={stu._id}
                        onClick={() => setSelectedStudentId(stu._id)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor:
                            selectedStudentId === stu._id ? '#e8f6ff' : 'white',
                        }}
                      >
                        <td style={bodyCellStyle}>{stu.rollNo}</td>
                        <td style={{ ...bodyCellStyle, fontWeight: 600 }}>
                          {stu.name}
                        </td>

                        {/* TOTALS */}
                        <td
                          style={{
                            ...bodyCellStyle,
                            textAlign: 'center',
                            fontWeight: 'bold',
                            backgroundColor: '#d4edda',
                          }}
                        >
                          {presentDays}
                        </td>
                        <td
                          style={{
                            ...bodyCellStyle,
                            textAlign: 'center',
                            fontWeight: 'bold',
                          }}
                        >
                          {workingDays}
                        </td>
                        <td
                          style={{
                            ...bodyCellStyle,
                            textAlign: 'center',
                            fontWeight: 'bold',
                          }}
                        >
                          {percentage}%
                        </td>

                        {/* Per-day cells */}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                          const day = i + 1;
                          const val = byDay ? byDay[day] : '-';
                          let bg = 'white';
                          if (val === 'P') bg = '#d4edda'; // green-ish
                          else if (val === 'A') bg = '#f8d7da'; // red-ish
                          else if (val === 'H') bg = '#fff3cd'; // yellow-ish
                          else if (val === '-') bg = '#f9f9f9';

                          return (
                            <td
                              key={day}
                              style={{
                                ...bodyCellStyle,
                                backgroundColor: bg,
                                textAlign: 'center',
                                fontWeight:
                                  val === 'P' || val === 'A' ? 'bold' : 'normal',
                              }}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div
              style={{
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <span>
                <strong>P</strong> = Present
              </span>
              <span>
                <strong>A</strong> = Absent
              </span>
              <span>
                <strong>H</strong> = Holiday / School Closed
              </span>
              <span>
                <strong>-</strong> = Attendance not marked
              </span>
              <span>
                <strong>Column P</strong> = Total Present Days
              </span>
              <span>
                <strong>Column W</strong> = Total Working Days
              </span>
              <span>
                <strong>%</strong> = (P / W) × 100
              </span>
              <span style={{ marginLeft: 'auto', fontStyle: 'italic' }}>
                (Click on any row to see full daily detail)
              </span>
            </div>
          </>
        )}

      {/* DETAIL BELOW: clicked student ka har din ka status list + totals */}
      {selectedStudent && selectedDetails && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
            backgroundColor: '#fafafa',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            Daily Detail — {selectedStudent.name} (Roll: {selectedStudent.rollNo})
          </h3>
          <p style={{ marginTop: 0, fontSize: '0.9rem' }}>
            Class: {selectedStudent.class} | Month: {monthLabel} {formData.year}
          </p>

          {selectedSummary && (
            <p style={{ marginTop: '0.3rem', fontSize: '0.9rem' }}>
              <strong>Total Present:</strong> {selectedSummary.presentDays} |{' '}
              <strong>Working Days:</strong> {selectedSummary.workingDays} |{' '}
              <strong>Percentage:</strong> {selectedSummary.percentage}%
            </p>
          )}

          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              borderRadius: '6px',
              border: '1px solid #e0e0e0',
              backgroundColor: 'white',
              marginTop: '0.5rem',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f1f1f1' }}>
                  <th style={headerCellStyle}>Date</th>
                  <th style={headerCellStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedDetails.map((row, idx) => {
                  let label = '';
                  let color = '';
                  if (row.isSchoolClosed) {
                    label = '🏫 Holiday / School Closed';
                    color = '#555';
                  } else if (row.present) {
                    label = '✅ Present';
                    color = 'green';
                  } else {
                    label = '❌ Absent';
                    color = 'red';
                  }

                  return (
                    <tr
                      key={idx}
                      style={
                        idx % 2 === 0
                          ? { backgroundColor: '#fafafa' }
                          : { backgroundColor: 'white' }
                      }
                    >
                      <td style={bodyCellStyle}>{row.date}</td>
                      <td
                        style={{
                          ...bodyCellStyle,
                          color,
                          fontWeight: 'bold',
                        }}
                      >
                        {label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const headerCellStyle = {
  padding: '0.5rem',
  textAlign: 'center',
  fontWeight: 'bold',
  borderBottom: '2px solid #ddd',
  borderRight: '1px solid #eee',
  whiteSpace: 'nowrap',
};

const bodyCellStyle = {
  padding: '0.4rem',
  borderBottom: '1px solid #eee',
  borderRight: '1px solid #f3f3f3',
  textAlign: 'left',
};

export default MonthlyAttendanceReport;
