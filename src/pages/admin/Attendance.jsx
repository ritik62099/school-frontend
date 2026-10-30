

// // src/pages/admin/Attendance.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { endpoints } from '../../config/api';

// const Attendance = () => {
//   const navigate = useNavigate();
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [assignedClasses, setAssignedClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState('');
//   const [date, setDate] = useState(getLocalDate());

//   // 👉 NEW: school closed flag
//   const [isSchoolClosed, setIsSchoolClosed] = useState(false);

//   function getLocalDate() {
//     const today = new Date();
//     today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
//     return today.toISOString().split('T')[0];
//   }

 

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           setError("Session expired. Please login again.");
//           setLoading(false);
//           return;
//         }

//         // 🔥 STEP 1: Fetch fresh logged-in user
//         const userRes = await fetch(endpoints.auth.me, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!userRes.ok) throw new Error("Failed to load user");

//         const currentUser = await userRes.json();

//         // 🔥 STEP 2: Role-based logic
//         if (currentUser.role === "teacher") {
//           const attendanceClasses = (currentUser.teachingAssignments || [])
//             .filter(a => a.canMarkAttendance === true)
//             .map(a => a.class);

//           if (attendanceClasses.length === 0) {
//             setError("You are not authorized to mark attendance for any class.");
//             setLoading(false);
//             return;
//           }

//           setAssignedClasses(attendanceClasses);
//           setSelectedClass(attendanceClasses[0]);
//         }

//         if (currentUser.role === "admin") {
//           const classesRes = await fetch(endpoints.classes.list, {
//             headers: { Authorization: `Bearer ${token}` },
//           });

//           if (!classesRes.ok) throw new Error("Failed to load classes");

//           const allClasses = await classesRes.json();
//           setAssignedClasses(allClasses);
//           setSelectedClass(allClasses[0]);
//         }

//         setError("");
//       } catch (err) {
//         setError(err.message || "Failed to load data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, []);

//   useEffect(() => {
//     if (!selectedClass) return;

//     const fetchAttendanceData = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem('token');

//         // 🔹 Students fetch
//         const studentsRes = await fetch(
//           `${endpoints.students.list}?class=${encodeURIComponent(selectedClass)}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (!studentsRes.ok) throw new Error('Failed to load students');
//         const studentsData = await studentsRes.json();

//         // 🔹 Attendance for this date/class
//         const attendanceRes = await fetch(
//           endpoints.attendance.get(date, selectedClass),
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         let existingRecords = [];
//         let closedFlag = false;

//         if (attendanceRes.ok) {
//           const attendanceData = await attendanceRes.json();
//           existingRecords = attendanceData.records || [];
//           closedFlag = !!attendanceData.isSchoolClosed; // 👈 backend se flag
//         }

//         // 🔹 Flag set karo
//         setIsSchoolClosed(closedFlag);

//         // Agar school closed hai, phir bhi students la rahe hain,
//         // future me use ho sakte hain (but list show nahi karenge).
//         const sortedStudentsData = [...studentsData].sort((a, b) => {
//   const rollA = Number(a.rollNo);
//   const rollB = Number(b.rollNo);

//   // Agar rollNo number hai: 1, 2, 3...
//   if (!isNaN(rollA) && !isNaN(rollB)) {
//     return rollA - rollB;
//   }

//   // Agar rollNo text/alpha-numeric hai: A1, A2, B1...
//   return String(a.rollNo || '').localeCompare(
//     String(b.rollNo || ''),
//     undefined,
//     { numeric: true, sensitivity: 'base' }
//   );
// });

// const studentsWithStatus = sortedStudentsData.map(student => {
//   const record = existingRecords.find(
//     r => r.studentId.toString() === student._id.toString()
//   );

//   return {
//     ...student,
//     present: record ? record.present : true,
//   };
// });

// setStudents(studentsWithStatus);

//         setStudents(studentsWithStatus);
//         setError('');
//       } catch (err) {
//         setError(err.message || 'Failed to load attendance data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAttendanceData();
//   }, [selectedClass, date]);

//   const handleClassChange = (e) => setSelectedClass(e.target.value);

//   const toggleAttendance = (id) => {
//     setStudents(prev =>
//       prev.map(s => s._id === id ? { ...s, present: !s.present } : s)
//     );
//   };

//   const handleSubmit = async () => {
//     const attendanceData = {
//       date,
//       class: selectedClass,
//       isSchoolClosed,               // 👈 NEW
//       records: isSchoolClosed
//         ? []                       // school closed -> koi records nahi
//         : students.map(s => ({
//           studentId: s._id,
//           present: s.present
//         })),
//     };

//     try {
//       const res = await fetch(endpoints.attendance.submit, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//         body: JSON.stringify(attendanceData),
//       });
//       if (res.ok) {
//         alert('Attendance updated successfully!');
//       }
//       else {
//         const err = await res.json();
//         alert('Failed: ' + (err.message || 'Unknown error'));
//       }
//     } catch {
//       alert('Network error');
//     }
//   };

//   const getCheckboxStyle = (checked) => ({
//     width: '2rem',
//     height: '2rem',
//     borderRadius: '6px',
//     display: 'inline-flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: '0.75rem',
//     backgroundColor: checked ? '#27ae60' : '#f8f9fa',
//     border: checked ? 'none' : '1px solid #ddd',
//     color: '#fff',
//     fontSize: '1rem',
//     fontWeight: 'bold',
//     transition: 'all 0.2s',
//     cursor: 'pointer',
//   });

//   return (
//     <div style={styles.pageContainer} className="page-container">
//       <style>{responsiveCSS}</style>
//       <div style={styles.card} className="card">
//         <h1 style={styles.title} className="title">Mark Attendance</h1>
//         {error && <div style={styles.alertError} className="alertError">{error}</div>}

//         <div style={styles.controls} className="controls">
//           <div style={styles.controlItem} className="control-item">
//             <label style={styles.label}>Date</label>
//             <input
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               style={styles.input}
//               className="input"
//             />
//           </div>
//           <div style={styles.controlItem} className="control-item">
//             <label style={styles.label}>Class</label>
//             <select
//               value={selectedClass}
//               onChange={handleClassChange}
//               style={styles.select}
//               className="select"
//               disabled={loading || assignedClasses.length === 0}
//             >
//               <option value="">Select Class</option>
//               {assignedClasses.map(cls => (
//                 <option key={cls} value={cls}>
//                   {cls}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* 👇 NEW: School Closed / Holiday toggle */}
//         <div style={{ marginBottom: '1rem' }}>
//           <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//             <input
//               type="checkbox"
//               checked={isSchoolClosed}
//               onChange={(e) => setIsSchoolClosed(e.target.checked)}
//             />
//             <span style={{ fontWeight: 600, color: '#c0392b' }}>
//               Mark this day as <u>School Closed / Holiday</u>
//             </span>
//           </label>
//           {isSchoolClosed && (
//             <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
//               Attendance of this day will <strong>not</strong> be counted in reports.
//             </div>
//           )}
//         </div>

//         {loading ? (
//           <div style={styles.loading}>Loading students...</div>
//         ) : isSchoolClosed ? (
//           <div style={styles.emptyState}>
//             This day is marked as <strong>School Closed / Holiday</strong>.<br />
//             No student-wise attendance is required.
//           </div>
//         ) : students.length === 0 ? (
//           <div style={styles.emptyState}>
//             No students found in <strong>{selectedClass}</strong> class.
//           </div>
//         ) : (
//           <div style={styles.tableWrapper} className="table-wrapper">
//             <table style={styles.table}>
//               <tbody>
//                 {students.map(student => (
//                   <tr key={student._id} style={styles.tableRow}>
//                     <td style={styles.tableCell}>
//                       <div style={{ display: 'flex', alignItems: 'center' }}>
//                         <label style={styles.checkboxLabel} className="checkbox-label">
//                           <input
//                             type="checkbox"
//                             checked={student.present}
//                             onChange={() => toggleAttendance(student._id)}
//                             style={styles.checkbox}
//                           />
//                           <span style={getCheckboxStyle(student.present)}>
//                             {student.present ? '✓' : ''}
//                           </span>
//                         </label>
//                         <div style={{ flex: 1, marginLeft: '0.5rem' }}>
//                           <div style={{ fontWeight: 600, fontSize: '1rem' }}>
//                             {student.name}
//                           </div>
//                           <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
//                             Roll No: {student.rollNo}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         <div style={styles.buttonGroup} className="button-group">
//           <button
//             onClick={handleSubmit}
//             disabled={
//               loading ||
//               !selectedClass ||
//               (!isSchoolClosed && students.length === 0)
//             }
//             style={{
//               ...styles.button,
//               ...styles.buttonPrimary,
//               opacity:
//                 loading ||
//                   !selectedClass ||
//                   (!isSchoolClosed && students.length === 0)
//                   ? 0.6
//                   : 1,
//               cursor:
//                 loading ||
//                   !selectedClass ||
//                   (!isSchoolClosed && students.length === 0)
//                   ? 'not-allowed'
//                   : 'pointer',
//             }}
//             className="button"
//           >
//             Save Attendance
//           </button>
//           <button
//             onClick={() => navigate('/dashboard')}
//             style={{ ...styles.button, ...styles.buttonSecondary }}
//             className="button"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   pageContainer: {
//     padding: '1rem',
//     maxWidth: '900px',
//     margin: '0 auto',
//     fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif',
//     backgroundColor: '#f8f9fa',
//     minHeight: '100vh',
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: '12px',
//     boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
//     padding: '1.5rem',
//   },
//   title: {
//     fontSize: '1.75rem',
//     fontWeight: 700,
//     color: '#2c3e50',
//     marginBottom: '1.25rem',
//     textAlign: 'center',
//   },
//   alertError: {
//     backgroundColor: '#fee',
//     color: '#c33',
//     padding: '0.75rem',
//     borderRadius: '8px',
//     marginBottom: '1.25rem',
//     border: '1px solid #fcc',
//   },
//   controls: {
//     display: 'flex',
//     gap: '1rem',
//     flexWrap: 'wrap',
//     marginBottom: '1.5rem',
//   },
//   controlItem: {
//     display: 'flex',
//     flexDirection: 'column',
//     flex: 1,
//     minWidth: '180px',
//   },
//   label: {
//     fontSize: '0.875rem',
//     fontWeight: 600,
//     marginBottom: '0.5rem',
//     color: '#34495e',
//   },
//   input: {
//     padding: '0.625rem',
//     fontSize: '1rem',
//     border: '1px solid #ddd',
//     borderRadius: '8px',
//   },
//   select: {
//     padding: '0.625rem',
//     fontSize: '1rem',
//     border: '1px solid #ddd',
//     borderRadius: '8px',
//     backgroundColor: '#fff',
//   },
//   loading: {
//     textAlign: 'center',
//     padding: '1.5rem',
//     color: '#7f8c8d',
//     fontStyle: 'italic',
//   },
//   emptyState: {
//     textAlign: 'center',
//     padding: '1.5rem',
//     color: '#7f8c8d',
//     backgroundColor: '#f9f9f9',
//     borderRadius: '8px',
//     border: '1px dashed #e0e0e0',
//   },
//   tableWrapper: {
//     overflowX: 'auto',
//     borderRadius: '8px',
//     border: '1px solid #eee',
//     marginTop: '0.5rem',
//   },
//   table: {
//     width: '100%',
//     borderCollapse: 'collapse',
//   },
//   tableRow: {
//     borderBottom: '1px solid #eee',
//   },
//   tableCell: {
//     padding: '0.75rem 1rem',
//     fontSize: '1rem',
//     color: '#34495e',
//   },
//   checkboxLabel: {
//     display: 'flex',
//     alignItems: 'center',
//     cursor: 'pointer',
//   },
//   checkbox: {
//     opacity: 0,
//     position: 'absolute',
//     width: '2rem',
//     height: '2rem',
//     margin: 0,
//   },
//   buttonGroup: {
//     display: 'flex',
//     gap: '1rem',
//     justifyContent: 'center',
//     marginTop: '1.5rem',
//     flexWrap: 'wrap',
//   },
//   button: {
//     padding: '0.75rem 1.5rem',
//     fontSize: '1rem',
//     fontWeight: 600,
//     borderRadius: '8px',
//     border: 'none',
//     transition: 'background-color 0.2s',
//   },
//   buttonPrimary: {
//     backgroundColor: '#27ae60',
//     color: '#fff',
//   },
//   buttonSecondary: {
//     backgroundColor: '#bdc3c7',
//     color: '#fff',
//   },
// };

// const responsiveCSS = `
// @media (max-width: 1024px) {
//   .controls { flex-wrap: wrap; gap: 1rem !important; }
//   .control-item { flex: 1 1 45%; }
// }
// @media (max-width: 768px) {
//   .controls { flex-direction: column !important; }
//   .input, .select { width: 100% !important; padding: 0.75rem !important; }
//   .title { font-size: 1.5rem !important; }
//   .button-group { flex-direction: column !important; }
//   .button { width: 100% !important; padding: 0.85rem 1rem !important; border-radius: 10px; }
// }
// @media (max-width: 480px) {
//   .page-container { padding: 0.8rem !important; }
//   .card { padding: 1rem !important; }
//   .title { font-size: 1.3rem !important; }
// }
// `;

// export default Attendance;





// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { endpoints } from '../../config/api';

// const Attendance = () => {
//   const navigate = useNavigate();
  
//   // Tabs State
//   const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'manual'

//   // Daily Attendance States
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [assignedClasses, setAssignedClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState('');
//   const [date, setDate] = useState(getLocalDate());
//   const [isSchoolClosed, setIsSchoolClosed] = useState(false);

//   // Manual Session Attendance States
//   const [session, setSession] = useState('2025-26');
//   const [totalWorkingDays, setTotalWorkingDays] = useState(220);
//   const [manualStudents, setManualStudents] = useState([]);
//   const [manualLoading, setManualLoading] = useState(false);
//   const [manualMessage, setManualMessage] = useState({ type: '', text: '' });

//   function getLocalDate() {
//     const today = new Date();
//     today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
//     return today.toISOString().split('T')[0];
//   }

//   // Fetch User & Classes
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           setError("Session expired. Please login again.");
//           setLoading(false);
//           return;
//         }

//         const userRes = await fetch(endpoints.auth.me, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!userRes.ok) throw new Error("Failed to load user");
//         const currentUser = await userRes.json();

//         if (currentUser.role === "teacher") {
//           const attendanceClasses = (currentUser.teachingAssignments || [])
//             .filter(a => a.canMarkAttendance === true)
//             .map(a => a.class);
//           if (attendanceClasses.length === 0) {
//             setError("You are not authorized to mark attendance for any class.");
//             setLoading(false);
//             return;
//           }
//           setAssignedClasses(attendanceClasses);
//           setSelectedClass(attendanceClasses[0]);
//         }

//         if (currentUser.role === "admin") {
//           const classesRes = await fetch(endpoints.classes.list, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           if (!classesRes.ok) throw new Error("Failed to load classes");
//           const allClasses = await classesRes.json();
//           setAssignedClasses(allClasses);
//           setSelectedClass(allClasses[0]);
//         }
//         setError("");
//       } catch (err) {
//         setError(err.message || "Failed to load data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUserData();
//   }, []);

//   // Fetch Students for DAILY Attendance
//   useEffect(() => {
//     if (!selectedClass || viewMode !== 'daily') return;

//     const fetchAttendanceData = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem('token');

//         const studentsRes = await fetch(
//           `${endpoints.students.list}?class=${encodeURIComponent(selectedClass)}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (!studentsRes.ok) throw new Error('Failed to load students');
//         const studentsData = await studentsRes.json();

//         const attendanceRes = await fetch(
//           endpoints.attendance.get(date, selectedClass),
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         let existingRecords = [];
//         let closedFlag = false;
//         if (attendanceRes.ok) {
//           const attendanceData = await attendanceRes.json();
//           existingRecords = attendanceData.records || [];
//           closedFlag = !!attendanceData.isSchoolClosed;
//         }

//         setIsSchoolClosed(closedFlag);

//         const sortedStudentsData = [...studentsData].sort((a, b) => {
//           const rollA = Number(a.rollNo);
//           const rollB = Number(b.rollNo);
//           if (!isNaN(rollA) && !isNaN(rollB)) return rollA - rollB;
//           return String(a.rollNo || '').localeCompare(String(b.rollNo || ''), undefined, { numeric: true, sensitivity: 'base' });
//         });

//         const studentsWithStatus = sortedStudentsData.map(student => {
//           const record = existingRecords.find(r => r.studentId.toString() === student._id.toString());
//           return { ...student, present: record ? record.present : true };
//         });

//         setStudents(studentsWithStatus);
//         setError('');
//       } catch (err) {
//         setError(err.message || 'Failed to load attendance data');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAttendanceData();
//   }, [selectedClass, date, viewMode]);

//   // Fetch Students for MANUAL Session Attendance
//   useEffect(() => {
//     if (!selectedClass || viewMode !== 'manual') return;

//     const fetchManualData = async () => {
//       setManualLoading(true);
//       try {
//         const token = localStorage.getItem('token');
//         const studentsRes = await fetch(
//           `${endpoints.students.list}?class=${encodeURIComponent(selectedClass)}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (!studentsRes.ok) throw new Error('Failed to load students');
//         const studentsData = await studentsRes.json();

//         const sorted = [...studentsData].sort((a, b) => {
//           const rollA = Number(a.rollNo);
//           const rollB = Number(b.rollNo);
//           if (!isNaN(rollA) && !isNaN(rollB)) return rollA - rollB;
//           return String(a.rollNo || '').localeCompare(String(b.rollNo || ''), undefined, { numeric: true, sensitivity: 'base' });
//         });

//         // Check existing manual attendance for this session
//         const studentsWithManual = sorted.map(student => {
//           const existing = student.sessionAttendance?.find(a => a.session === session);
//           return {
//             ...student,
//             presentDays: existing ? existing.presentDays : 0
//           };
//         });

//         setManualStudents(studentsWithManual);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setManualLoading(false);
//       }
//     };
//     fetchManualData();
//   }, [selectedClass, session, viewMode]);

//   const toggleAttendance = (id) => {
//     setStudents(prev => prev.map(s => s._id === id ? { ...s, present: !s.present } : s));
//   };

//   const handleDailySubmit = async () => {
//     const attendanceData = {
//       date,
//       class: selectedClass,
//       isSchoolClosed,
//       records: isSchoolClosed ? [] : students.map(s => ({ studentId: s._id, present: s.present })),
//     };

//     try {
//       const res = await fetch(endpoints.attendance.submit, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//         body: JSON.stringify(attendanceData),
//       });
//       if (res.ok) alert('Daily Attendance updated successfully!');
//       else {
//         const err = await res.json();
//         alert('Failed: ' + (err.message || 'Unknown error'));
//       }
//     } catch {
//       alert('Network error');
//     }
//   };

//   const handleManualPresentChange = (studentId, value) => {
//     const numVal = Math.max(0, Math.min(totalWorkingDays, parseInt(value) || 0));
//     setManualStudents(prev => prev.map(s => s._id === studentId ? { ...s, presentDays: numVal } : s));
//   };

//   const handleManualSubmit = async () => {
//     setManualLoading(true);
//     setManualMessage({ type: '', text: '' });

//     const payload = {
//       session,
//       className: selectedClass,
//       totalWorkingDays: parseInt(totalWorkingDays) || 0,
//       studentData: manualStudents.map(s => ({ studentId: s._id, presentDays: s.presentDays })),
//     };

//     try {
//       const res = await fetch(endpoints.students.manualAttendance, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setManualMessage({ type: 'success', text: '✅ Manual Session Attendance saved successfully!' });
//       } else {
//         setManualMessage({ type: 'error', text: data.message || 'Failed to update' });
//       }
//     } catch (err) {
//       setManualMessage({ type: 'error', text: 'Network error' });
//     } finally {
//       setManualLoading(false);
//     }
//   };

//   const getCheckboxStyle = (checked) => ({
//     width: '2rem', height: '2rem', borderRadius: '6px', display: 'inline-flex',
//     alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem',
//     backgroundColor: checked ? '#27ae60' : '#f8f9fa', border: checked ? 'none' : '1px solid #ddd',
//     color: '#fff', fontSize: '1rem', fontWeight: 'bold', transition: 'all 0.2s', cursor: 'pointer',
//   });

//   return (
//     <div style={styles.pageContainer} className="page-container">
//       <style>{responsiveCSS}</style>
//       <div style={styles.card} className="card">
//         <h1 style={styles.title} className="title">Attendance Management</h1>
//         {error && <div style={styles.alertError} className="alertError">{error}</div>}

//         {/* 🔥 TABS TOGGLE */}
//         <div style={styles.tabs}>
//           <button 
//             style={{ ...styles.tabBtn, ...(viewMode === 'daily' ? styles.tabBtnActive : {}) }} 
//             onClick={() => setViewMode('daily')}
//           >
//             📅 Daily Attendance
//           </button>
//           <button 
//             style={{ ...styles.tabBtn, ...(viewMode === 'manual' ? styles.tabBtnActive : {}) }} 
//             onClick={() => setViewMode('manual')}
//           >
//             📝 Manual Session Attendance
//           </button>
//         </div>

//         {/* Shared Controls */}
//         <div style={styles.controls} className="controls">
//           <div style={styles.controlItem} className="control-item">
//             <label style={styles.label}>Class</label>
//             <select
//               value={selectedClass}
//               onChange={(e) => setSelectedClass(e.target.value)}
//               style={styles.select}
//               className="select"
//               disabled={loading || assignedClasses.length === 0}
//             >
//               <option value="">Select Class</option>
//               {assignedClasses.map(cls => (
//                 <option key={cls} value={cls}>{cls}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* ================= DAILY ATTENDANCE VIEW ================= */}
//         {viewMode === 'daily' && (
//           <>
//             <div style={styles.controls} className="controls">
//               <div style={styles.controlItem} className="control-item">
//                 <label style={styles.label}>Date</label>
//                 <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.input} className="input" />
//               </div>
//             </div>

//             <div style={{ marginBottom: '1rem' }}>
//               <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                 <input type="checkbox" checked={isSchoolClosed} onChange={(e) => setIsSchoolClosed(e.target.checked)} />
//                 <span style={{ fontWeight: 600, color: '#c0392b' }}>Mark this day as <u>School Closed / Holiday</u></span>
//               </label>
//               {isSchoolClosed && (
//                 <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
//                   Attendance of this day will <strong>not</strong> be counted in reports.
//                 </div>
//               )}
//             </div>

//             {loading ? <div style={styles.loading}>Loading students...</div> : isSchoolClosed ? (
//               <div style={styles.emptyState}>This day is marked as <strong>School Closed / Holiday</strong>.<br />No student-wise attendance is required.</div>
//             ) : students.length === 0 ? (
//               <div style={styles.emptyState}>No students found in <strong>{selectedClass}</strong> class.</div>
//             ) : (
//               <div style={styles.tableWrapper} className="table-wrapper">
//                 <table style={styles.table}>
//                   <tbody>
//                     {students.map(student => (
//                       <tr key={student._id} style={styles.tableRow}>
//                         <td style={styles.tableCell}>
//                           <div style={{ display: 'flex', alignItems: 'center' }}>
//                             <label style={styles.checkboxLabel} className="checkbox-label">
//                               <input type="checkbox" checked={student.present} onChange={() => toggleAttendance(student._id)} style={styles.checkbox} />
//                               <span style={getCheckboxStyle(student.present)}>{student.present ? '✓' : ''}</span>
//                             </label>
//                             <div style={{ flex: 1, marginLeft: '0.5rem' }}>
//                               <div style={{ fontWeight: 600, fontSize: '1rem' }}>{student.name}</div>
//                               <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Roll No: {student.rollNo}</div>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             <div style={styles.buttonGroup} className="button-group">
//               <button onClick={handleDailySubmit} disabled={loading || !selectedClass || (!isSchoolClosed && students.length === 0)} style={{ ...styles.button, ...styles.buttonPrimary }}>Save Daily Attendance</button>
//             </div>
//           </>
//         )}

//         {/* ================= MANUAL SESSION ATTENDANCE VIEW ================= */}
//         {viewMode === 'manual' && (
//           <>
//             <div style={styles.controls} className="controls">
//               <div style={styles.controlItem} className="control-item">
//                 <label style={styles.label}>Session (e.g., 2025-26)</label>
//                 <input type="text" value={session} onChange={(e) => setSession(e.target.value)} style={styles.input} />
//               </div>
//               <div style={styles.controlItem} className="control-item">
//                 <label style={styles.label}>Total Working Days</label>
//                 <input 
//                   type="number" 
//                   value={totalWorkingDays} 
//                   onChange={(e) => {
//                     const val = parseInt(e.target.value) || 0;
//                     setTotalWorkingDays(val);
//                     setManualStudents(prev => prev.map(s => ({ ...s, presentDays: Math.min(s.presentDays, val) })));
//                   }} 
//                   style={styles.input} 
//                 />
//               </div>
//             </div>

//             {manualMessage.text && (
//               <div style={{ ...styles.alertError, backgroundColor: manualMessage.type === 'success' ? '#d4edda' : '#fee', color: manualMessage.type === 'success' ? '#155724' : '#c33', border: `1px solid ${manualMessage.type === 'success' ? '#c3e6cb' : '#fcc'}` }}>
//                 {manualMessage.text}
//               </div>
//             )}

//             {manualLoading ? <div style={styles.loading}>Loading data...</div> : manualStudents.length === 0 ? (
//               <div style={styles.emptyState}>No students found in <strong>{selectedClass}</strong> class.</div>
//             ) : (
//               <>
//                 <div style={styles.infoBox}>
//                   Enter the total days each student was <strong>Present</strong> out of <strong>{totalWorkingDays} Total Working Days</strong> for the session <strong>{session}</strong>.
//                 </div>
//                 <div style={styles.tableWrapper} className="table-wrapper">
//                   <table style={styles.table}>
//                     <thead>
//                       <tr style={{ backgroundColor: '#f8f9fa' }}>
//                         <th style={styles.th}>Roll No</th>
//                         <th style={styles.th}>Student Name</th>
//                         <th style={styles.th}>Total Working Days</th>
//                         <th style={styles.th}>Days Present (Enter)</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {manualStudents.map(student => (
//                         <tr key={student._id} style={styles.tableRow}>
//                           <td style={styles.tableCell}>{student.rollNo}</td>
//                           <td style={{ ...styles.tableCell, fontWeight: 600 }}>{student.name}</td>
//                           <td style={{ ...styles.tableCell, textAlign: 'center' }}>{totalWorkingDays}</td>
//                           <td style={styles.tableCell}>
//                             <input
//                               type="number"
//                               min="0"
//                               max={totalWorkingDays}
//                               value={student.presentDays}
//                               onChange={(e) => handleManualPresentChange(student._id, e.target.value)}
//                               style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center' }}
//                             />
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </>
//             )}

//             <div style={styles.buttonGroup} className="button-group">
//               <button onClick={handleManualSubmit} disabled={manualLoading || !selectedClass} style={{ ...styles.button, ...styles.buttonPrimary }}>
//                 {manualLoading ? 'Saving...' : '💾 Save Manual Session Attendance'}
//               </button>
//             </div>
//           </>
//         )}

//         <div style={{ ...styles.buttonGroup, marginTop: '1rem' }}>
//           <button onClick={() => navigate('/dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>Cancel / Back to Dashboard</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   pageContainer: { padding: '1rem', maxWidth: '900px', margin: '0 auto', fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' },
//   card: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '1.5rem' },
//   title: { fontSize: '1.75rem', fontWeight: 700, color: '#2c3e50', marginBottom: '1.25rem', textAlign: 'center' },
//   tabs: { display: 'flex', gap: '10px', marginBottom: '1.5rem', justifyContent: 'center' },
//   tabBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', background: '#f1f5f9', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: '#64748b' },
//   tabBtnActive: { background: '#2563eb', color: 'white', border: '1px solid #2563eb' },
//   alertError: { backgroundColor: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #fcc' },
//   controls: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
//   controlItem: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: '180px' },
//   label: { fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#34495e' },
//   input: { padding: '0.625rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '8px' },
//   select: { padding: '0.625rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' },
//   loading: { textAlign: 'center', padding: '1.5rem', color: '#7f8c8d', fontStyle: 'italic' },
//   emptyState: { textAlign: 'center', padding: '1.5rem', color: '#7f8c8d', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #e0e0e0' },
//   infoBox: { backgroundColor: '#e0f2fe', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #bae6fd', fontSize: '0.95rem' },
//   tableWrapper: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee', marginTop: '0.5rem' },
//   table: { width: '100%', borderCollapse: 'collapse' },
//   th: { padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd', fontWeight: 'bold' },
//   tableRow: { borderBottom: '1px solid #eee' },
//   tableCell: { padding: '0.75rem 1rem', fontSize: '1rem', color: '#34495e' },
//   checkboxLabel: { display: 'flex', alignItems: 'center', cursor: 'pointer' },
//   checkbox: { opacity: 0, position: 'absolute', width: '2rem', height: '2rem', margin: 0 },
//   buttonGroup: { display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' },
//   button: { padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', border: 'none', transition: 'background-color 0.2s', cursor: 'pointer' },
//   buttonPrimary: { backgroundColor: '#27ae60', color: '#fff' },
//   buttonSecondary: { backgroundColor: '#bdc3c7', color: '#fff' },
// };

// const responsiveCSS = `
// @media (max-width: 768px) {
//   .controls { flex-direction: column !important; }
//   .input, .select { width: 100% !important; padding: 0.75rem !important; }
//   .title { font-size: 1.5rem !important; }
//   .button-group { flex-direction: column !important; }
//   .button { width: 100% !important; padding: 0.85rem 1rem !important; border-radius: 10px; }
// }
// `;

// export default Attendance;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';

// 🔥 Helper function to get current academic session (e.g., "2026-27")
const getCurrentSession = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 3 = April
  
  if (month < 3) { 
    return `${year - 1}-${String(year).slice(-2)}`; // e.g., Jan 2026 -> "2025-26"
  } else { 
    return `${year}-${String(year + 1).slice(-2)}`; // e.g., May 2026 -> "2026-27"
  }
};

const Attendance = () => {
  const navigate = useNavigate();
  
  // Tabs State
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'manual'

  // Daily Attendance States
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(getLocalDate());
  const [isSchoolClosed, setIsSchoolClosed] = useState(false);

  // Manual Session Attendance States
  const [session, setSession] = useState(getCurrentSession());
  const [totalWorkingDays, setTotalWorkingDays] = useState(220);
  const [manualStudents, setManualStudents] = useState([]);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualMessage, setManualMessage] = useState({ type: '', text: '' });
  const [savingRowId, setSavingRowId] = useState(null); // 🔥 For individual row loading state

  function getLocalDate() {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  }

  // Fetch User & Classes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Session expired. Please login again.");
          setLoading(false);
          return;
        }

        const userRes = await fetch(endpoints.auth.me, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error("Failed to load user");
        const currentUser = await userRes.json();

        if (currentUser.role === "teacher") {
          const attendanceClasses = (currentUser.teachingAssignments || [])
            .filter(a => a.canMarkAttendance === true)
            .map(a => a.class);
          if (attendanceClasses.length === 0) {
            setError("You are not authorized to mark attendance for any class.");
            setLoading(false);
            return;
          }
          setAssignedClasses(attendanceClasses);
          setSelectedClass(attendanceClasses[0]);
        }

        if (currentUser.role === "admin") {
          const classesRes = await fetch(endpoints.classes.list, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!classesRes.ok) throw new Error("Failed to load classes");
          const allClasses = await classesRes.json();
          setAssignedClasses(allClasses);
          setSelectedClass(allClasses[0]);
        }
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Fetch Students for DAILY Attendance
  useEffect(() => {
    if (!selectedClass || viewMode !== 'daily') return;

    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const studentsRes = await fetch(
          `${endpoints.students.list}?class=${encodeURIComponent(selectedClass)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!studentsRes.ok) throw new Error('Failed to load students');
        const studentsData = await studentsRes.json();

        const attendanceRes = await fetch(
          endpoints.attendance.get(date, selectedClass),
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let existingRecords = [];
        let closedFlag = false;
        if (attendanceRes.ok) {
          const attendanceData = await attendanceRes.json();
          existingRecords = attendanceData.records || [];
          closedFlag = !!attendanceData.isSchoolClosed;
        }

        setIsSchoolClosed(closedFlag);

        const sortedStudentsData = [...studentsData].sort((a, b) => {
          const rollA = Number(a.rollNo);
          const rollB = Number(b.rollNo);
          if (!isNaN(rollA) && !isNaN(rollB)) return rollA - rollB;
          return String(a.rollNo || '').localeCompare(String(b.rollNo || ''), undefined, { numeric: true, sensitivity: 'base' });
        });

        const studentsWithStatus = sortedStudentsData.map(student => {
          const record = existingRecords.find(r => r.studentId.toString() === student._id.toString());
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
  }, [selectedClass, date, viewMode]);

  // Fetch Students for MANUAL Session Attendance
  useEffect(() => {
    if (!selectedClass || viewMode !== 'manual') return;

    const fetchManualData = async () => {
      setManualLoading(true);
      try {
        const token = localStorage.getItem('token');
        const studentsRes = await fetch(
          `${endpoints.students.list}?class=${encodeURIComponent(selectedClass)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!studentsRes.ok) throw new Error('Failed to load students');
        const studentsData = await studentsRes.json();

        const sorted = [...studentsData].sort((a, b) => {
          const rollA = Number(a.rollNo);
          const rollB = Number(b.rollNo);
          if (!isNaN(rollA) && !isNaN(rollB)) return rollA - rollB;
          return String(a.rollNo || '').localeCompare(String(b.rollNo || ''), undefined, { numeric: true, sensitivity: 'base' });
        });

        const studentsWithManual = sorted.map(student => {
          const existing = student.sessionAttendance?.find(a => a.session === session);
          return {
            ...student,
            presentDays: existing ? existing.presentDays : "" 
          };
        });

        setManualStudents(studentsWithManual);
      } catch (err) {
        console.error(err);
      } finally {
        setManualLoading(false);
      }
    };
    fetchManualData();
  }, [selectedClass, session, viewMode]);

  const toggleAttendance = (id) => {
    setStudents(prev => prev.map(s => s._id === id ? { ...s, present: !s.present } : s));
  };

  const handleDailySubmit = async () => {
    const attendanceData = {
      date,
      class: selectedClass,
      isSchoolClosed,
      records: isSchoolClosed ? [] : students.map(s => ({ studentId: s._id, present: s.present })),
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
      if (res.ok) alert('Daily Attendance updated successfully!');
      else {
        const err = await res.json();
        alert('Failed: ' + (err.message || 'Unknown error'));
      }
    } catch {
      alert('Network error');
    }
  };

  const handleManualPresentChange = (studentId, value) => {
    if (value === "") {
      setManualStudents(prev => prev.map(s => s._id === studentId ? { ...s, presentDays: "" } : s));
      return;
    }
    
    const numVal = parseInt(value, 10);
    if (!isNaN(numVal)) {
      const clampedVal = Math.max(0, Math.min(totalWorkingDays, numVal));
      setManualStudents(prev => prev.map(s => s._id === studentId ? { ...s, presentDays: clampedVal } : s));
    }
  };

  // 🔥 NEW: Save single student's manual attendance
  const handleSaveSingleStudent = async (studentId) => {
    const student = manualStudents.find(s => s._id === studentId);
    if (!student) return;

    setSavingRowId(studentId);

    const payload = {
      session,
      className: selectedClass,
      totalWorkingDays: parseInt(totalWorkingDays) || 0,
      studentData: [{ 
        studentId: student._id, 
        presentDays: student.presentDays === "" ? 0 : parseInt(student.presentDays, 10) 
      }],
    };

    try {
      const res = await fetch(endpoints.students.manualAttendance, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Attendance saved successfully for ${student.name}!`);
      } else {
        alert('Failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSavingRowId(null);
    }
  };

  const handleManualSubmit = async () => {
    setManualLoading(true);
    setManualMessage({ type: '', text: '' });

    const payload = {
      session,
      className: selectedClass,
      totalWorkingDays: parseInt(totalWorkingDays) || 0,
      studentData: manualStudents.map(s => ({ 
        studentId: s._id, 
        presentDays: s.presentDays === "" ? 0 : parseInt(s.presentDays, 10) 
      })),
    };

    try {
      const res = await fetch(endpoints.students.manualAttendance, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setManualMessage({ type: 'success', text: '✅ All Manual Session Attendance saved successfully!' });
      } else {
        setManualMessage({ type: 'error', text: data.message || 'Failed to update' });
      }
    } catch (err) {
      setManualMessage({ type: 'error', text: 'Network error' });
    } finally {
      setManualLoading(false);
    }
  };

  const getCheckboxStyle = (checked) => ({
    width: '2rem', height: '2rem', borderRadius: '6px', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem',
    backgroundColor: checked ? '#27ae60' : '#f8f9fa', border: checked ? 'none' : '1px solid #ddd',
    color: '#fff', fontSize: '1rem', fontWeight: 'bold', transition: 'all 0.2s', cursor: 'pointer',
  });

  return (
    <div style={styles.pageContainer} className="page-container">
      <style>{responsiveCSS}</style>
      <div style={styles.card} className="card">
        <h1 style={styles.title} className="title">Attendance Management</h1>
        {error && <div style={styles.alertError} className="alertError">{error}</div>}

        {/* TABS TOGGLE */}
        <div style={styles.tabs}>
          <button 
            style={{ ...styles.tabBtn, ...(viewMode === 'daily' ? styles.tabBtnActive : {}) }} 
            onClick={() => setViewMode('daily')}
          >
            📅 Daily Attendance
          </button>
          <button 
            style={{ ...styles.tabBtn, ...(viewMode === 'manual' ? styles.tabBtnActive : {}) }} 
            onClick={() => setViewMode('manual')}
          >
            📝 Manual Session Attendance
          </button>
        </div>

        {/* Shared Controls */}
        <div style={styles.controls} className="controls">
          <div style={styles.controlItem} className="control-item">
            <label style={styles.label}>Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={styles.select}
              className="select"
              disabled={loading || assignedClasses.length === 0}
            >
              <option value="">Select Class</option>
              {assignedClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ================= DAILY ATTENDANCE VIEW ================= */}
        {viewMode === 'daily' && (
          <>
            <div style={styles.controls} className="controls">
              <div style={styles.controlItem} className="control-item">
                <label style={styles.label}>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.input} className="input" />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={isSchoolClosed} onChange={(e) => setIsSchoolClosed(e.target.checked)} />
                <span style={{ fontWeight: 600, color: '#c0392b' }}>Mark this day as <u>School Closed / Holiday</u></span>
              </label>
              {isSchoolClosed && (
                <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
                  Attendance of this day will <strong>not</strong> be counted in reports.
                </div>
              )}
            </div>

            {loading ? <div style={styles.loading}>Loading students...</div> : isSchoolClosed ? (
              <div style={styles.emptyState}>This day is marked as <strong>School Closed / Holiday</strong>.<br />No student-wise attendance is required.</div>
            ) : students.length === 0 ? (
              <div style={styles.emptyState}>No students found in <strong>{selectedClass}</strong> class.</div>
            ) : (
              <div style={styles.tableWrapper} className="table-wrapper">
                <table style={styles.table}>
                  <tbody>
                    {students.map(student => (
                      <tr key={student._id} style={styles.tableRow}>
                        <td style={styles.tableCell}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label style={styles.checkboxLabel} className="checkbox-label">
                              <input type="checkbox" checked={student.present} onChange={() => toggleAttendance(student._id)} style={styles.checkbox} />
                              <span style={getCheckboxStyle(student.present)}>{student.present ? '✓' : ''}</span>
                            </label>
                            <div style={{ flex: 1, marginLeft: '0.5rem' }}>
                              <div style={{ fontWeight: 600, fontSize: '1rem' }}>{student.name}</div>
                              <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Roll No: {student.rollNo}</div>
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
              <button onClick={handleDailySubmit} disabled={loading || !selectedClass || (!isSchoolClosed && students.length === 0)} style={{ ...styles.button, ...styles.buttonPrimary }}>Save Daily Attendance</button>
            </div>
          </>
        )}

        {/* ================= MANUAL SESSION ATTENDANCE VIEW ================= */}
        {viewMode === 'manual' && (
          <>
            <div style={styles.controls} className="controls">
              <div style={styles.controlItem} className="control-item">
                <label style={styles.label}>Session (e.g., 2026-27)</label>
                <input type="text" value={session} onChange={(e) => setSession(e.target.value)} style={styles.input} />
              </div>
              <div style={styles.controlItem} className="control-item">
                <label style={styles.label}>Total Working Days</label>
                <input 
                  type="number" 
                  value={totalWorkingDays} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setTotalWorkingDays(val);
                    setManualStudents(prev => prev.map(s => ({ 
                      ...s, 
                      presentDays: s.presentDays === "" ? "" : Math.min(s.presentDays, val) 
                    })));
                  }} 
                  style={styles.input} 
                />
              </div>
            </div>

            {manualMessage.text && (
              <div style={{ ...styles.alertError, backgroundColor: manualMessage.type === 'success' ? '#d4edda' : '#fee', color: manualMessage.type === 'success' ? '#155724' : '#c33', border: `1px solid ${manualMessage.type === 'success' ? '#c3e6cb' : '#fcc'}` }}>
                {manualMessage.text}
              </div>
            )}

            {manualLoading ? <div style={styles.loading}>Loading data...</div> : manualStudents.length === 0 ? (
              <div style={styles.emptyState}>No students found in <strong>{selectedClass}</strong> class.</div>
            ) : (
              <>
                <div style={styles.infoBox}>
                  Enter the total days each student was <strong>Present</strong> out of <strong>{totalWorkingDays} Total Working Days</strong> for the session <strong>{session}</strong>.
                </div>
                <div style={styles.tableWrapper} className="table-wrapper">
                  <table style={styles.table}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={styles.th}>Roll No</th>
                        <th style={styles.th}>Student Name</th>
                        <th style={styles.th}>Total Working Days</th>
                        <th style={styles.th}>Days Present</th>
                        <th style={styles.th}>Action</th> {/* 🔥 NEW COLUMN */}
                      </tr>
                    </thead>
                    <tbody>
                      {manualStudents.map(student => (
                        <tr key={student._id} style={styles.tableRow}>
                          <td style={styles.tableCell}>{student.rollNo}</td>
                          <td style={{ ...styles.tableCell, fontWeight: 600 }}>{student.name}</td>
                          <td style={{ ...styles.tableCell, textAlign: 'center' }}>{totalWorkingDays}</td>
                          <td style={styles.tableCell}>
                            <input
                              type="number"
                              min="0"
                              max={totalWorkingDays}
                              value={student.presentDays}
                              onChange={(e) => handleManualPresentChange(student._id, e.target.value)}
                              style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center' }}
                            />
                          </td>
                          {/* 🔥 NEW SAVE BUTTON PER ROW */}
                          <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                            <button 
                              onClick={() => handleSaveSingleStudent(student._id)}
                              disabled={savingRowId === student._id}
                              style={{
                                ...styles.smallSaveBtn,
                                backgroundColor: savingRowId === student._id ? '#94a3b8' : '#2563eb'
                              }}
                            >
                              {savingRowId === student._id ? 'Saving...' : '💾 Save'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div style={styles.buttonGroup} className="button-group">
              <button onClick={handleManualSubmit} disabled={manualLoading || !selectedClass} style={{ ...styles.button, ...styles.buttonPrimary }}>
                {manualLoading ? 'Saving All...' : '💾 Save All Manual Session Attendance'}
              </button>
            </div>
          </>
        )}

        <div style={{ ...styles.buttonGroup, marginTop: '1rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>Cancel / Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: { padding: '1rem', maxWidth: '900px', margin: '0 auto', fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  card: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 700, color: '#2c3e50', marginBottom: '1.25rem', textAlign: 'center' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '1.5rem', justifyContent: 'center' },
  tabBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', background: '#f1f5f9', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: '#64748b' },
  tabBtnActive: { background: '#2563eb', color: 'white', border: '1px solid #2563eb' },
  alertError: { backgroundColor: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #fcc' },
  controls: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  controlItem: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: '180px' },
  label: { fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#34495e' },
  input: { padding: '0.625rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '8px' },
  select: { padding: '0.625rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' },
  loading: { textAlign: 'center', padding: '1.5rem', color: '#7f8c8d', fontStyle: 'italic' },
  emptyState: { textAlign: 'center', padding: '1.5rem', color: '#7f8c8d', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #e0e0e0' },
  infoBox: { backgroundColor: '#e0f2fe', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #bae6fd', fontSize: '0.95rem' },
  tableWrapper: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee', marginTop: '0.5rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd', fontWeight: 'bold' },
  tableRow: { borderBottom: '1px solid #eee' },
  tableCell: { padding: '0.75rem 1rem', fontSize: '1rem', color: '#34495e' },
  checkboxLabel: { display: 'flex', alignItems: 'center', cursor: 'pointer' },
  checkbox: { opacity: 0, position: 'absolute', width: '2rem', height: '2rem', margin: 0 },
  buttonGroup: { display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' },
  button: { padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', border: 'none', transition: 'background-color 0.2s', cursor: 'pointer' },
  buttonPrimary: { backgroundColor: '#27ae60', color: '#fff' },
  buttonSecondary: { backgroundColor: '#bdc3c7', color: '#fff' },
  // 🔥 NEW STYLE FOR ROW SAVE BUTTON
  smallSaveBtn: { 
    padding: '6px 12px', 
    fontSize: '0.85rem', 
    fontWeight: 600, 
    borderRadius: '6px', 
    border: 'none', 
    backgroundColor: '#2563eb', 
    color: '#fff', 
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};

const responsiveCSS = `
@media (max-width: 768px) {
  .controls { flex-direction: column !important; }
  .input, .select { width: 100% !important; padding: 0.75rem !important; }
  .title { font-size: 1.5rem !important; }
  .button-group { flex-direction: column !important; }
  .button { width: 100% !important; padding: 0.85rem 1rem !important; border-radius: 10px; }
}
`;

export default Attendance;