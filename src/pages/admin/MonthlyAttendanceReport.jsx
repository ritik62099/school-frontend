// import React, { useState, useEffect } from 'react';
// import { saveAs } from 'file-saver';
// import { endpoints } from '../../config/api';

// const MonthlyAttendanceReport = () => {
//   const [report, setReport] = useState([]);
//   const [studentInfo, setStudentInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [formData, setFormData] = useState({
//     class: '',
//     studentId: '',
//     year: new Date().getFullYear().toString(),
//     month: String(new Date().getMonth() + 1).padStart(2, '0')
//   });
//   const [classes, setClasses] = useState([]);
//   const [students, setStudents] = useState([]);

//   // Classes load karein
//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const res = await fetch(endpoints.students.byClass, {
//           headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//         });
//         if (res.ok) {
//           const data = await res.json();
//           setClasses(Object.keys(data));
//         }
//       } catch (err) {
//         console.error('Failed to load classes');
//       }
//     };
//     fetchClasses();
//   }, []);

//   // Jab class select ho, tab students load karein
//   useEffect(() => {
//     if (!formData.class) {
//       setStudents([]);
//       setFormData(prev => ({ ...prev, studentId: '' }));
//       return;
//     }

//     const fetchStudents = async () => {
//       try {
//         const res = await fetch(
//           `${endpoints.students.list}?class=${encodeURIComponent(formData.class)}`,
//           {
//             headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//           }
//         );
//         if (res.ok) {
//           const data = await res.json();
//           setStudents(Array.isArray(data) ? data : []);
//         }
//       } catch (err) {
//         console.error('Failed to load students');
//       }
//     };
//     fetchStudents();
//   }, [formData.class]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.studentId) {
//       setError('Please select a student');
//       return;
//     }
//     setLoading(true);
//     setError('');

//     try {
//       const url = endpoints.attendance.studentMonthly(
//         formData.studentId,
//         formData.year,
//         formData.month
//       );

//       const res = await fetch(url, {
//         headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || 'Failed to load report');
//       }

//       const data = await res.json();
//       setStudentInfo(data.student);
//       setReport(data.report);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadCSV = () => {
//     if (report.length === 0 || !studentInfo) return;

//     const headers = ['Date', 'Student Name', 'Class', 'Roll No', 'Status'];
//     const csvContent = [
//       headers.join(','),
//       ...report.map(row =>
//         [
//           row.date,
//           `"${studentInfo.name}"`,
//           studentInfo.class,
//           studentInfo.rollNo,
//           row.present ? 'Present' : 'Absent'
//         ].join(',')
//       )
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     saveAs(blob, `attendance-${studentInfo.name}-${formData.year}-${formData.month}.csv`);
//   };

//   return (
//     <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
//       <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Student Monthly Attendance Report</h2>

//       <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
//         {/* Class */}
//         <select
//           name="class"
//           value={formData.class}
//           onChange={handleChange}
//           required
//           style={{ padding: '0.5rem', flex: 1, minWidth: '150px' }}
//         >
//           <option value="">Select Class</option>
//           {classes.map(cls => (
//             <option key={cls} value={cls}>{cls}</option>
//           ))}
//         </select>

//         {/* Student */}
//         <select
//           name="studentId"
//           value={formData.studentId}
//           onChange={handleChange}
//           required
//           disabled={!formData.class}
//           style={{ padding: '0.5rem', flex: 1, minWidth: '180px' }}
//         >
//           <option value="">Select Student</option>
//           {students.map(stu => (
//             <option key={stu._id} value={stu._id}>
//               {stu.name} (Roll: {stu.rollNo})
//             </option>
//           ))}
//         </select>

//         {/* Year */}
//         <input
//           type="number"
//           name="year"
//           value={formData.year}
//           onChange={handleChange}
//           min="2020"
//           max="2030"
//           required
//           style={{ padding: '0.5rem', width: '100px' }}
//         />

//         {/* Month */}
//         <select
//           name="month"
//           value={formData.month}
//           onChange={handleChange}
//           required
//           style={{ padding: '0.5rem', width: '120px' }}
//         >
//           {Array.from({ length: 12 }, (_, i) => (
//             <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
//               {new Date(0, i).toLocaleString('default', { month: 'long' })}
//             </option>
//           ))}
//         </select>

//         <button
//           type="submit"
//           disabled={loading}
//           style={{
//             padding: '0.5rem 1rem',
//             backgroundColor: '#3498db',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px'
//           }}
//         >
//           {loading ? 'Loading...' : 'Generate Report'}
//         </button>
//       </form>

//       {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

//       {studentInfo && report.length > 0 && (
//         <>
//           <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.1rem' }}>
//             <strong>{studentInfo.name}</strong> — Class: {studentInfo.class}, Roll: {studentInfo.rollNo}
//           </div>

//           <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
//             <button
//               onClick={downloadCSV}
//               style={{
//                 padding: '0.5rem 1rem',
//                 backgroundColor: '#27ae60',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: 'pointer'
//               }}
//             >
//               📥 Download CSV
//             </button>
//           </div>

//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
//               <thead>
//                 <tr style={{ backgroundColor: '#f1f1f1' }}>
//                   <th style={tableHeaderStyle}>Date</th>
//                   <th style={tableHeaderStyle}>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {report.map((row, i) => (
//                   <tr key={i} style={i % 2 === 0 ? { backgroundColor: '#fafafa' } : {}}>
//                     <td style={tableCellStyle}>{row.date}</td>
//                     <td style={{ ...tableCellStyle, color: row.present ? 'green' : 'red' }}>
//                       {row.present ? '✅ Present' : '❌ Absent'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// const tableHeaderStyle = {
//   padding: '0.75rem',
//   textAlign: 'center',
//   fontWeight: 'bold',
//   borderBottom: '2px solid #ddd'
// };

// const tableCellStyle = {
//   padding: '0.6rem',
//   textAlign: 'center',
//   borderBottom: '1px solid #eee'
// };

// export default MonthlyAttendanceReport;

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
    month: String(new Date().getMonth() + 1).padStart(2, '0')
  });
  const [assignedStudents, setAssignedStudents] = useState([]);

  // 🔥 Fetch ONLY teacher's assigned students
  useEffect(() => {
    const fetchAssignedStudents = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(endpoints.students.myStudents, {
          headers: { Authorization: `Bearer ${token}` }
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

  // 🔥 Get unique classes from assigned students
  const assignedClasses = [...new Set(assignedStudents.map(s => s.class))];

  // 🔥 Filter students when class changes
  const filteredStudents = formData.class
    ? assignedStudents.filter(s => s.class === formData.class)
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Reset student if class changes
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
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to load report');
      }

      const data = await res.json();
      setStudentInfo(data.student);
      setReport(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (report.length === 0 || !studentInfo) return;

    const headers = ['Date', 'Student Name', 'Class', 'Roll No', 'Status'];
    const csvContent = [
      headers.join(','),
      ...report.map(row =>
        [
          row.date,
          `"${studentInfo.name}"`,
          studentInfo.class,
          studentInfo.rollNo,
          row.present ? 'Present' : 'Absent'
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `attendance-${studentInfo.name}-${formData.year}-${formData.month}.csv`);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Student Monthly Attendance Report</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {/* Class - Only assigned classes */}
        <select
          name="class"
          value={formData.class}
          onChange={handleChange}
          required
          style={{ padding: '0.5rem', flex: 1, minWidth: '150px' }}
        >
          <option value="">Select Class</option>
          {assignedClasses.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>

        {/* Student - Only assigned students of selected class */}
        <select
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          required
          disabled={!formData.class}
          style={{ padding: '0.5rem', flex: 1, minWidth: '180px' }}
        >
          <option value="">Select Student</option>
          {filteredStudents.map(stu => (
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
            borderRadius: '4px'
          }}
        >
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {studentInfo && report.length > 0 && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.1rem' }}>
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
                cursor: 'pointer'
              }}
            >
              📥 Download CSV
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
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
                    <td style={{ ...tableCellStyle, color: row.present ? 'green' : 'red' }}>
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
  borderBottom: '2px solid #ddd'
};

const tableCellStyle = {
  padding: '0.6rem',
  textAlign: 'center',
  borderBottom: '1px solid #eee'
};

export default MonthlyAttendanceReport;