

// // src/pages/teacher/ViewResult.jsx
// import React, { useEffect, useState } from "react";
// import html2pdf from "html2pdf.js";
// import Logo from "../../assets/logo.png";
// import { endpoints } from "../../config/api";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   PieChart, Pie, Cell, ResponsiveContainer
// } from "recharts";



// const ViewResult = () => {
//   const [results, setResults] = useState([]);
//   const [filteredResults, setFilteredResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [assignedClasses, setAssignedClasses] = useState([]);
//   const [selectedExamType, setSelectedExamType] = useState("halfYearly");
//   const [attendanceData, setAttendanceData] = useState({});
//   const [classSubjectMap, setClassSubjectMap] = useState({});

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return setError("Unauthorized");

//     fetch(endpoints.auth.me, { headers: { Authorization: `Bearer ${token}` } })
//       .then((res) => res.json())
//       .then((data) => setAssignedClasses(data.assignedClasses || []))
//       .catch((err) => console.error("Error fetching teacher info:", err));

//     fetch(endpoints.marks.list, { headers: { Authorization: `Bearer ${token}` } })
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to load results");
//         return res.json();
//       })
//       .then((data) => {
//         setResults(Array.isArray(data) ? data : []);
//         setFilteredResults(Array.isArray(data) ? data : []);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching results:", err);
//         setError("Failed to load results.");
//         setLoading(false);
//       });

//     fetch(endpoints.classSubjects.getAll, { headers: { Authorization: `Bearer ${token}` } })
//       .then((res) => {
//         if (res.ok) return res.json();
//         throw new Error("Failed to load class-subject mapping");
//       })
//       .then((mapping) => setClassSubjectMap(mapping))
//       .catch((err) => console.error("Error fetching class-subject mapping:", err));
//   }, []);

//   useEffect(() => {
//     if (filteredResults.length === 0) return;

//     const token = localStorage.getItem("token");
//     const fetchAttendance = async () => {
//       const attMap = {};
//       for (const r of filteredResults) {
//         const studentId = r.studentId?._id || r.studentId;
//         if (!studentId) continue;

//         try {
//           const res = await fetch(endpoints.attendance.studentTotal(studentId), {
//             headers: { Authorization: `Bearer ${token}` }
//           });
//           if (res.ok) {
//             const data = await res.json();
//             attMap[studentId] = {
//               present: data.totalPresentDays,
//               total: data.totalSchoolDays,
//               percentage: data.percentage
//             };
//           }
//         } catch (err) {
//           console.error("Failed to load attendance for", studentId);
//         }
//       }
//       setAttendanceData(attMap);
//     };

//     fetchAttendance();
//   }, [filteredResults]);

//   useEffect(() => {
//     let filtered = results;
//     if (assignedClasses.length > 0) {
//       filtered = filtered.filter((r) => assignedClasses.includes(r.class));
//     }
//     if (searchTerm) {
//       filtered = filtered.filter((r) =>
//         r.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }
//     if (selectedClass) {
//       filtered = filtered.filter((r) => r.class === selectedClass);
//     }
//     setFilteredResults(filtered);
//   }, [searchTerm, selectedClass, results, assignedClasses]);

//   if (loading) return <h3 style={{ textAlign: "center", padding: "2rem" }}>Loading results...</h3>;
//   if (error) return <h3 style={{ textAlign: "center", color: "red", padding: "2rem" }}>{error}</h3>;

//   const classOptions = [...new Set(filteredResults.map((r) => r.class))];

//   const getGrade = (marks, className) => {
//     const cls = String(className || "").toLowerCase().trim();
//     if (["nursery", "lkg", "ukg", "play", "i", "ii", "iii", "iv", "v"].includes(cls)) {
//       if (marks >= 90) return "Outstanding";
//       if (marks >= 75) return "Very Good";
//       if (marks >= 56) return "Good";
//       if (marks >= 35) return "Needs Improvement";
//       return "Poor";
//     }
//     if (marks >= 91) return "A1";
//     if (marks >= 81) return "A2";
//     if (marks >= 71) return "B1";
//     if (marks >= 61) return "B2";
//     if (marks >= 51) return "C1";
//     if (marks >= 41) return "C2";
//     if (marks >= 33) return "D";
//     return "E";
//   };

//   const downloadReportCard = (studentId, name, examType) => {
//     const element = document.getElementById(`report-card-${studentId}-${examType}`);
//     if (!element) return;

//     const logo = element.querySelector('img');
//     const originalWidth = logo?.style.width || '60px';
//     const originalHeight = logo?.style.height || 'auto';

//     if (logo) {
//       logo.style.width = '60px';
//       logo.style.height = 'auto';
//     }

//     const opt = {
//       margin: 0.4,
//       filename: `${name.replace(/\s+/g, "_")}_${examType === "halfYearly" ? "HalfYearly" : "Annual"}_ReportCard.pdf`,
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true },
//       jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
//     };

//     html2pdf()
//       .from(element)
//       .set(opt)
//       .save()
//       .finally(() => {
//         if (logo) {
//           logo.style.width = originalWidth;
//           logo.style.height = originalHeight;
//         }
//       });
//   };

//   const printReportCard = (studentId, examType) => {
//     const element = document.getElementById(`report-card-${studentId}-${examType}`);
//     if (!element) return;

//     const clone = element.cloneNode(true);
//     const logo = clone.querySelector('img');
//     if (logo) {
//       logo.style.width = '60px';
//       logo.style.height = 'auto';
//     }

//     const printContent = clone.innerHTML;

//     const printWin = window.open('', '_blank');
//     printWin.document.write(`
//       <html>
//         <head>
//           <title>Report Card</title>
//           <style>
//             body {
//               font-family: Poppins, sans-serif;
//               padding: 15px;
//               font-size: 12px;
//             }
//             .header {
//               display: flex;
//               align-items: center;
//               border-bottom: 2px solid #000;
//               margin-bottom: 10px;
//             }
//             .header img {
//               width: 60px;
//               height: auto;
//               margin-right: 10px;
//             }
//             h1 { font-size: 16px; margin: 0; }
//             h3 { font-size: 14px; margin: 8px 0; text-align: center; }
//             table {
//               width: 100%;
//               border-collapse: collapse;
//               font-size: 11px;
//             }
//             th, td {
//               border: 1px solid #000;
//               padding: 4px;
//               text-align: center;
//             }
//             @media print {
//               body { padding: 0; }
//               .header img { width: 60px !important; }
//             }
//           </style>
//         </head>
//         <body>${printContent}</body>
//       </html>
//     `);
//     printWin.document.close();
//     printWin.print();
//   };

//   // ✅ Print only Periodic Assessments section
// const printPAReport = () => {
//   const paSection = document.querySelector('.pa-report-section');
//   if (!paSection) return;

//   const clone = paSection.cloneNode(true);
  
//   // Logo add karein (optional, but consistent)
//   const header = document.createElement('div');
//   header.innerHTML = `
//     <div style="display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
//       <img src="${Logo}" alt="School Logo" style="width: 60px; height: auto; margin-right: 10px;" />
//       <div>
//         <h1 style="font-size: 18px; margin: 0; color: #2c3e50;">AMBIKA INTERNATIONAL SCHOOL</h1>
//         <p style="font-size: 12px; margin: 4px 0; color: #555;">Periodic Assessments Report</p>
//       </div>
//     </div>
//   `;
//   clone.insertBefore(header, clone.firstChild);

//   const printContent = clone.innerHTML;

//   const printWin = window.open('', '_blank');
//   printWin.document.write(`
//     <html>
//       <head>
//         <title>Periodic Assessments Report</title>
//         <style>
//           body {
//             font-family: Poppins, sans-serif;
//             padding: 15px;
//             font-size: 12px;
//             line-height: 1.4;
//           }
//           .header img {
//             width: 60px;
//             height: auto;
//             margin-right: 10px;
//           }
//           h1 { font-size: 18px; margin: 0; }
//           h2 { font-size: 16px; color: #2c3e50; text-align: center; margin: 15px 0; }
//           h3 { font-size: 14px; margin: 12px 0; color: #2980b9; }
//           h4 { font-size: 13px; margin: 10px 0 8px; color: #2c3e50; }
//           table {
//             width: 100%;
//             border-collapse: collapse;
//             font-size: 11px;
//             margin: 8px 0;
//           }
//           th, td {
//             border: 1px solid #000;
//             padding: 5px;
//             text-align: center;
//           }
//           @media print {
//             body { padding: 0; }
//             .header img { width: 50px !important; }
//           }
//         </style>
//       </head>
//       <body>${printContent}</body>
//     </html>
//   `);
//   printWin.document.close();
//   printWin.print();
// };

// // ✅ Print a SINGLE PA report for a SPECIFIC CLASS
// const printSinglePAClass = (paKey, className) => {
//   const element = document.getElementById(`pa-section-${paKey}-${className}`);
//   if (!element) return;

//   const paNames = {
//     pa1: "PA I",
//     pa2: "PA II",
//     pa3: "PA III",
//     pa4: "PA IV"
//   };

//   const clone = element.cloneNode(true);
  
//   // Remove print buttons from print view
//   const printButtons = clone.querySelectorAll('button');
//   printButtons.forEach(btn => btn.remove());

//   // Add school header
//   const header = document.createElement('div');
//   header.innerHTML = `
//     <div style="display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
//       <img src="${Logo}" alt="School Logo" style="width: 60px; height: auto; margin-right: 10px;" />
//       <div>
//         <h1 style="font-size: 18px; margin: 0; color: #2c3e50;">AMBIKA INTERNATIONAL SCHOOL</h1>
//         <p style="font-size: 12px; margin: 4px 0; color: #555;">${paNames[paKey]} Report - Class ${className}</p>
//       </div>
//     </div>
//   `;
//   clone.insertBefore(header, clone.firstChild);

//   const printContent = clone.innerHTML;

//   const printWin = window.open('', '_blank');
//   printWin.document.write(`
//     <html>
//       <head>
//         <title>${paNames[paKey]} - Class ${className}</title>
//         <style>
//           body {
//             font-family: 'Poppins', sans-serif;
//             padding: 15px;
//             font-size: 12px;
//             line-height: 1.4;
//           }
//           table {
//             width: 100%;
//             border-collapse: collapse;
//             font-size: 11px;
//           }
//           th, td {
//             border: 1px solid #000;
//             padding: 5px;
//             text-align: center;
//           }
//           .header img {
//             width: 60px;
//             height: auto;
//             margin-right: 10px;
//           }
//           h1 { font-size: 18px; margin: 0; color: #2c3e50; }
//           h3 { font-size: 14px; margin: 12px 0; color: #2980b9; }
//           h4 { font-size: 13px; margin: 10px 0 8px; color: #2c3e50; }
//           @media print {
//             body { padding: 0; }
//             .header img { width: 50px !important; }
//           }
//         </style>
//       </head>
//       <body>${printContent}</body>
//     </html>
//   `);
//   printWin.document.close();
//   printWin.print();
// };

// // ✅ Print a SINGLE PA report (e.g., only PA1)
// const printSinglePA = (paKey) => {
//   const element = document.getElementById(`pa-section-${paKey}`);
//   if (!element) return;

//   const paNames = {
//     pa1: "PA I",
//     pa2: "PA II",
//     pa3: "PA III",
//     pa4: "PA IV"
//   };

//   const clone = element.cloneNode(true);
  
//   // Remove the print button from print view
//   const printButton = clone.querySelector('button');
//   if (printButton) printButton.remove();

//   // Add school header
//   const header = document.createElement('div');
//   header.innerHTML = `
//     <div style="display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
//       <img src="${Logo}" alt="School Logo" style="width: 60px; height: auto; margin-right: 10px;" />
//       <div>
//         <h1 style="font-size: 18px; margin: 0; color: #2c3e50;">AMBIKA INTERNATIONAL SCHOOL</h1>
//         <p style="font-size: 12px; margin: 4px 0; color: #555;">${paNames[paKey]} Report</p>
//       </div>
//     </div>
//   `;
//   clone.insertBefore(header, clone.firstChild);

//   const printContent = clone.innerHTML;

//   const printWin = window.open('', '_blank');
//   printWin.document.write(`
//     <html>
//       <head>
//         <title>${paNames[paKey]} Report</title>
//         <style>
//           body {
//             font-family: 'Poppins', sans-serif;
//             padding: 15px;
//             font-size: 12px;
//             line-height: 1.4;
//           }
//           table {
//             width: 100%;
//             border-collapse: collapse;
//             font-size: 11px;
//           }
//           th, td {
//             border: 1px solid #000;
//             padding: 5px;
//             text-align: center;
//           }
//           .header img {
//             width: 60px;
//             height: auto;
//             margin-right: 10px;
//           }
//           h1 { font-size: 18px; margin: 0; color: #2c3e50; }
//           h3 { font-size: 14px; margin: 12px 0; color: #2980b9; }
//           h4 { font-size: 13px; margin: 10px 0 8px; color: #2c3e50; }
//           @media print {
//             body { padding: 0; }
//             .header img { width: 50px !important; }
//           }
//         </style>
//       </head>
//       <body>${printContent}</body>
//     </html>
//   `);
//   printWin.document.close();
//   printWin.print();
// };
//   // ✅ Helper: Safely extract student object
//   const getStudentFromRecord = (record) => {
//     if (!record.studentId) return null;
//     // If it's already an object (populated)
//     if (typeof record.studentId === 'object' && record.studentId !== null) {
//       return record.studentId;
//     }
//     // If it's just an ID string, we can't show details → skip
//     return null;
//   };

//   return (
//     <div className="view-result-container">
//       <style>{`
//         .view-result-container {
//           padding: 1rem;
//           background: #f9f9f9;
//           font-family: 'Poppins', sans-serif;
//         }
//         h2 {
//           text-align: center;
//           color: #2c3e50;
//           margin: 1rem 0;
//           font-size: 1.6rem;
//         }
//         .filters {
//           display: flex;
//           gap: 0.8rem;
//           justify-content: center;
//           flex-wrap: wrap;
//           margin: 1rem 0;
//         }
//         .filters input,
//         .filters select {
//           padding: 0.5rem;
//           border: 1px solid #ccc;
//           border-radius: 6px;
//           font-size: 0.95rem;
//           min-width: 160px;
//         }
//         .report-cards-grid {
//           display: grid;
//           gap: 1.5rem;
//           margin-top: 1.2rem;
//         }
//         .report-card {
//           background: #fff;
//           padding: 1rem;
//           border-radius: 8px;
//           box-shadow: 0 2px 6px rgba(0,0,0,0.08);
//         }
//         .header {
//           display: flex;
//           align-items: center;
//           border-bottom: 2px solid #000;
//           margin-bottom: 10px;
//         }
//         .header img {
//           width: 60px;
//           height: auto;
//           margin-right: 10px;
//         }
//         .header h1 {
//           margin: 0;
//           font-size: 1.3rem;
//         }
//         .header p {
//           margin: 0;
//           font-size: 0.9rem;
//           color: #555;
//         }
//         .table-container {
//           overflow-x: auto;
//           width: 100%;
//           margin: 10px 0;
//         }
//         .marks-table {
//           width: 100%;
//           border-collapse: collapse;
//           font-size: 0.75rem;
//         }
//         .marks-table th,
//         .marks-table td {
//           padding: 6px 4px;
//           border: 1px solid #000;
//           text-align: center;
//         }
//         .action-buttons {
//           margin-top: 12px;
//           display: flex;
//           gap: 8px;
//           justify-content: center;
//         }
//         .action-buttons button {
//           padding: 0.4rem 0.8rem;
//           font-size: 0.85rem;
//           border: none;
//           border-radius: 5px;
//           cursor: pointer;
//           background: #3498db;
//           color: white;
//         }
//         .action-buttons button:hover {
//           background: #2980b9;
//         }

//         @media (max-width: 768px) {
//           .filters {
//             flex-direction: column;
//             align-items: stretch;
//           }
//           .filters input,
//           .filters select {
//             min-width: auto;
//             width: 100%;
//           }
//           .header {
//             flex-direction: column;
//             text-align: center;
//           }
//           .header img {
//             width: 32px;
//             margin-bottom: 8px;
//             margin-right: 0;
//           }
//           .marks-table {
//             font-size: 0.7rem;
//           }
//           .marks-table th,
//           .marks-table td {
//             padding: 5px 3px;
//           }
//           h3 {
//             font-size: 1.1rem;
//           }
//         }

//         @media (max-width: 480px) {
//           .view-result-container {
//             padding: 0.8rem;
//           }
//           .report-card {
//             padding: 0.8rem;
//           }
//           .header img {
//             width: 28px;
//           }
//           .marks-table {
//             font-size: 0.65rem;
//           }
//           .action-buttons button {
//             padding: 0.35rem 0.7rem;
//             font-size: 0.8rem;
//           }
//         }
//       `}</style>

//       <h2>Student Marks Record</h2>

//       <div className="filters">
//   <input
//     type="text"
//     placeholder="🔍 Search by Student Name"
//     value={searchTerm}
//     onChange={(e) => setSearchTerm(e.target.value)}
//   />
//   <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
//     <option value="">All Classes</option>
//     {classOptions.map((cls) => (
//       <option key={cls} value={cls}>
//         {cls}
//       </option>
//     ))}
//   </select>
//   <select value={selectedExamType} onChange={(e) => setSelectedExamType(e.target.value)}>
//     <option value="halfYearly">Half Yearly Report</option>
//     <option value="final">Annual Report Card</option>
//   </select>
// </div>


//       {filteredResults.length === 0 ? (
//         <p style={{ textAlign: "center", color: "#7f8c8d", padding: "1.5rem" }}>No matching results found.</p>
//       ) : (
//         <div className="report-cards-grid">
//           {filteredResults.map((r) => {
//             const student = getStudentFromRecord(r);
//             if (!student || !r.class) return null;

//             const studentId = student._id || r.studentId;
//             const examData = r.exams || {};
//             const subjectsArray = classSubjectMap[r.class] || [];

//             const att = attendanceData[studentId];
//             const attendanceDisplay = att
//               ? `${att.present} / ${att.total} (${att.percentage}%)`
//               : student.attendance
//                 ? `${student.attendance} / 115`
//                 : "—";

//             const getTerm1Total = (sub) => {
//               const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
//               const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
//               const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
//               return ((pa1 / 2) + (pa2 / 2) + sa1).toFixed(1);
//             };

//             const getFinalTotal = (sub) => {
//               const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
//               const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
//               const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
//               const pa3 = Math.min(examData.pa3?.[sub] || 0, 20);
//               const pa4 = Math.min(examData.pa4?.[sub] || 0, 20);
//               const sa2 = Math.min(examData.final?.[sub] || 0, 80);
//               const term1 = (pa1 / 2) + (pa2 / 2) + sa1;
//               const term2Component = pa3 + pa4 + sa2;
//               const finalTotal = (term1 / 2) + (term2Component / 2);
//               return finalTotal.toFixed(1);
//             };

//             const totalTerm1 = subjectsArray.reduce((sum, sub) => sum + parseFloat(getTerm1Total(sub)), 0).toFixed(1);
//             const totalFinal = subjectsArray.reduce((sum, sub) => sum + parseFloat(getFinalTotal(sub)), 0).toFixed(1);
//             const percentageTerm1 = ((totalTerm1 / (subjectsArray.length * 100)) * 100).toFixed(2);
//             const percentageFinal = ((totalFinal / (subjectsArray.length * 100)) * 100).toFixed(2);

//             return (
//               <div key={`${r._id}-${selectedExamType}`} className="report-card">
//                 {selectedExamType === "halfYearly" && (
//                   <div id={`report-card-${r._id}-halfYearly`}>
//                     <div className="header">
//                       <img src={Logo} alt="School Logo" />
//                       <div>
//                         <h1>AMBIKA INTERNATIONAL SCHOOL</h1>
//                         <p>Saidpur, Dighwara (Saran), 841207</p>
//                       </div>
//                     </div>
//                     <h3>HALF YEARLY REPORT CARD</h3>
//                     <div style={{ marginBottom: "10px" }}>
//                       <strong>CLASS:</strong> {r.class} &nbsp;&nbsp;&nbsp;
//                       <strong>SECTION:</strong> A &nbsp;&nbsp;&nbsp;
//                       <strong>SESSION:</strong> 2025-26
//                     </div>
//                     <div style={{ marginBottom: "10px", border: "1px solid #ccc", padding: "5px" }}>
//                       <strong>STUDENT'S DETAIL</strong><br />
//                       <strong>Student's Name:</strong> {student.name} &nbsp;&nbsp;&nbsp;
//                       <strong>Roll No:</strong> {student.rollNo || "N/A"}<br />
//                       <strong>Mother's Name:</strong> {student.motherName || "N/A"} &nbsp;&nbsp;&nbsp;
//                       {/* <strong>Contact No:</strong> {student.mobile || "N/A"}<br /> */}
//                       <strong>Father's Name:</strong> {student.fatherName || "N/A"} &nbsp;&nbsp;&nbsp;
//                       <strong>Attendance:</strong> {attendanceDisplay}<br />
//                       <strong>Address:</strong> {student.address || "N/A"}
//                     </div>
//                     <div className="table-container">
//                       <table className="marks-table">
//                         <thead>
//                           <tr>
//                             <th>SUBJECT</th>
//                             <th>PA I (20)</th>
//                             <th>PA II (20)</th>
//                             <th>SA I (80)</th>
//                             <th>TERM I TOTAL (100)</th>
//                             <th>GRADE POINT</th>
//                             <th>GRADE</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {subjectsArray.map((sub) => {
//                             const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
//                             const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
//                             const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
//                             const term1 = (pa1 / 2) + (pa2 / 2) + sa1;
//                             const grade = getGrade(term1, r.class);
//                             const gradePoint = ["A1","A2","B1","B2","C1","C2","D"].includes(grade)
//                               ? (10 - ["A1","A2","B1","B2","C1","C2","D"].indexOf(grade))
//                               : 0;
//                             return (
//                               <tr key={sub}>
//                                 <td>{sub}</td>
//                                 <td>{pa1}</td>
//                                 <td>{pa2}</td>
//                                 <td>{sa1}</td>
//                                 <td>{term1.toFixed(1)}</td>
//                                 <td>{gradePoint}</td>
//                                 <td>{grade}</td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                         <tfoot>
//                           <tr>
//                             <td><strong>TOTAL</strong></td>
//                             <td colSpan="3"></td>
//                             <td><strong>{totalTerm1}</strong></td>
//                             <td></td>
//                             <td></td>
//                           </tr>
//                         </tfoot>
//                       </table>
//                     </div>
//                    {/* 📊 Graph Section: Marks + Attendance */}
// <div style={{ marginTop: "20px" }}>
//   <h4 style={{ textAlign: "center", color: "#2c3e50" }}>Performance Overview</h4>
//   <div style={{
//     display: "flex",
//     flexWrap: "wrap",
//     justifyContent: "space-around",
//     alignItems: "center",
//     gap: "1rem",
//     marginTop: "10px"
//   }}>
    
//     {/* Marks Bar Chart */}
//     <div style={{ flex: "1 1 400px", background: "#fdfdfd", padding: "10px", borderRadius: "8px" }}>
//       <h5 style={{ textAlign: "center", color: "#2980b9" }}>Subject-wise Marks</h5>
//       <ResponsiveContainer width="100%" height={250}>
//         <BarChart
//           data={subjectsArray.map(sub => ({
//             subject: sub,
//             marks: selectedExamType === "halfYearly"
//               ? parseFloat(getTerm1Total(sub))
//               : parseFloat(getFinalTotal(sub))
//           }))}
//           margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="subject" angle={-45} textAnchor="end" interval={0} height={60} />
//           <YAxis domain={[0, 100]} />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="marks" fill="#3498db" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>

//     {/* Attendance Pie Chart */}
//     <div style={{ flex: "0 1 300px", background: "#fdfdfd", padding: "10px", borderRadius: "8px" }}>
//       <h5 style={{ textAlign: "center", color: "#27ae60" }}>Attendance Overview</h5>
//       <ResponsiveContainer width="100%" height={250}>
//         <PieChart>
//           <Pie
//             data={[
//               { name: "Present", value: att?.present || 0 },
//               { name: "Absent", value: (att?.total || 0) - (att?.present || 0) }
//             ]}
//             cx="50%"
//             cy="50%"
//             labelLine={false}
//             label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//             outerRadius={80}
//             fill="#8884d8"
//             dataKey="value"
//           >
//             <Cell fill="#27ae60" />
//             <Cell fill="#e74c3c" />
//           </Pie>
//           <Tooltip />
//           <Legend />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   </div>
// </div>

//                     <div style={{ marginTop: "10px", fontSize: "0.8rem" }}>
//                       <strong>Students are assessed according to the following:</strong><br />
//                       Promotion is based on the day-to-day work of the student throughout the year and also on the performance in the half yearly/summative examination.<br />
//                       <strong>First Term:</strong> PA I (10%) + PA II (10%) + SA I (80%) = 100%<br />
//                       <strong>Second Term:</strong> PA III (10%) + PA IV (10%) + SA II (80%) = 100%<br />
//                       <strong>Final Result:</strong> 50% of 1st Term + 50% of 2nd Term = 100%
//                     </div>
//                     <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
//                       <div>
//                         <strong>Total Obtain Marks:</strong> {totalTerm1}<br />
//                         <strong>Percentage:</strong> {percentageTerm1}%
//                       </div>
//                       <div>
//                         <strong>Class Teacher Sig:</strong> _______________<br />
//                         <strong>Principal Sig:</strong> _______________
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {selectedExamType === "final" && (
//                   <div id={`report-card-${r._id}-final`}>
//                     <div className="header">
//                       <img src={Logo} alt="School Logo" />
//                       <div>
//                         <h1>AMBIKA INTERNATIONAL SCHOOL</h1>
//                         <p>Saidpur, Dighwara (Saran), 841207</p>
//                       </div>
//                     </div>
//                     <h3>ANNUAL REPORT CARD</h3>
//                     <div style={{ marginBottom: "10px" }}>
//                       <strong>CLASS:</strong> {r.class} &nbsp;&nbsp;&nbsp;
//                       <strong>SECTION:</strong> A &nbsp;&nbsp;&nbsp;
//                       <strong>SESSION:</strong> 2025-26
//                     </div>
//                     <div style={{ marginBottom: "10px", border: "1px solid #ccc", padding: "5px" }}>
//                       <strong>STUDENT'S DETAIL</strong><br />
//                       <strong>Student's Name:</strong> {student.name} &nbsp;&nbsp;&nbsp;
//                       <strong>Roll No:</strong> {student.rollNo || "N/A"}<br />
//                       <strong>Mother's Name:</strong> {student.motherName || "N/A"} &nbsp;&nbsp;&nbsp;
//                       {/* <strong>Contact No:</strong> {student.phone || "N/A"}<br /> */}
//                       <strong>Father's Name:</strong> {student.fatherName || "N/A"} &nbsp;&nbsp;&nbsp;
//                       <strong>Attendance:</strong> {attendanceDisplay}<br />
//                       <strong>Address:</strong> {student.address || "N/A"}
//                     </div>
//                     <div className="table-container">
//                       <table className="marks-table">
//                         <thead>
//                           <tr>
//                             <th>SUBJECT</th>
//                             <th>PA I (20)</th>
//                             <th>PA II (20)</th>
//                             <th>SA I (80)</th>
//                             <th>PA III (20)</th>
//                             <th>PA IV (20)</th>
//                             <th>SA II (80)</th>
//                             <th>FINAL (100)</th>
//                             <th>GRADE POINT</th>
//                             <th>GRADE</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {subjectsArray.map((sub) => {
//                             const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
//                             const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
//                             const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
//                             const pa3 = Math.min(examData.pa3?.[sub] || 0, 20);
//                             const pa4 = Math.min(examData.pa4?.[sub] || 0, 20);
//                             const sa2 = Math.min(examData.final?.[sub] || 0, 80);
//                             const term1 = (pa1 / 2) + (pa2 / 2) + sa1;
//                             const term2Component = pa3 + pa4 + sa2;
//                             const finalTotal = (term1 / 2) + (term2Component / 2);
//                             const grade = getGrade(finalTotal, r.class);
//                             const gradePoint = ["A1","A2","B1","B2","C1","C2","D"].includes(grade)
//                               ? (10 - ["A1","A2","B1","B2","C1","C2","D"].indexOf(grade))
//                               : 0;
//                             return (
//                               <tr key={sub}>
//                                 <td>{sub}</td>
//                                 <td>{pa1}</td>
//                                 <td>{pa2}</td>
//                                 <td>{sa1}</td>
//                                 <td>{pa3}</td>
//                                 <td>{pa4}</td>
//                                 <td>{sa2}</td>
//                                 <td>{finalTotal.toFixed(1)}</td>
//                                 <td>{gradePoint}</td>
//                                 <td>{grade}</td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                         <tfoot>
//                           <tr>
//                             <td><strong>TOTAL</strong></td>
//                             <td><strong>{subjectsArray.reduce((sum, sub) => sum + Math.min(examData.pa1?.[sub] || 0, 20), 0).toFixed(1)}</strong></td>
//                             <td><strong>{subjectsArray.reduce((sum, sub) => sum + Math.min(examData.pa2?.[sub] || 0, 20), 0).toFixed(1)}</strong></td>
//                             <td><strong>{subjectsArray.reduce((sum, sub) => sum + Math.min(examData.halfYear?.[sub] || 0, 80), 0).toFixed(1)}</strong></td>
//                             <td><strong>{subjectsArray.reduce((sum, sub) => sum + Math.min(examData.pa3?.[sub] || 0, 20), 0).toFixed(1)}</strong></td>
//                             <td><strong>{subjectsArray.reduce((sum, sub) => sum + Math.min(examData.pa4?.[sub] || 0, 20), 0).toFixed(1)}</strong></td>
//                             <td><strong>{subjectsArray.reduce((sum, sub) => sum + Math.min(examData.final?.[sub] || 0, 80), 0).toFixed(1)}</strong></td>
//                             <td><strong>{totalFinal}</strong></td>
//                             <td></td>
//                             <td></td>
//                           </tr>
//                         </tfoot>
//                       </table>
//                     </div>
//                     {/* <div style={{ marginTop: "10px", borderTop: "1px solid #000", paddingTop: "10px" }}>
//                       <strong>SCHOLASTIC AREAS (9 Point Scale)</strong>
//                       <div className="table-container">
//                         <table className="marks-table">
//                           <thead>
//                             <tr>
//                               <th>MARKS RANGE</th>
//                               <th>GRADE</th>
//                               <th>GRADE POINT</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             <tr><td>91-100</td><td>A1</td><td>10.0</td></tr>
//                             <tr><td>81-90</td><td>A2</td><td>9.0</td></tr>
//                             <tr><td>71-80</td><td>B1</td><td>8.0</td></tr>
//                             <tr><td>61-70</td><td>B2</td><td>7.0</td></tr>
//                             <tr><td>51-60</td><td>C1</td><td>6.0</td></tr>
//                             <tr><td>41-50</td><td>C2</td><td>5.0</td></tr>
//                             <tr><td>33-40</td><td>D</td><td>4.0</td></tr>
//                             <tr><td>00-32</td><td>E</td><td>0.0</td></tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     </div> */}
//                     {/* 📊 Graph Section: Marks + Attendance */}
// <div style={{ marginTop: "20px" }}>
//   <h4 style={{ textAlign: "center", color: "#2c3e50" }}>Performance Overview</h4>
//   <div style={{
//     display: "flex",
//     flexWrap: "wrap",
//     justifyContent: "space-around",
//     alignItems: "center",
//     gap: "1rem",
//     marginTop: "10px"
//   }}>
    
//     {/* Marks Bar Chart */}
//     <div style={{ flex: "1 1 400px", background: "#fdfdfd", padding: "10px", borderRadius: "8px" }}>
//       <h5 style={{ textAlign: "center", color: "#2980b9" }}>Subject-wise Marks</h5>
//       <ResponsiveContainer width="100%" height={250}>
//         <BarChart
//           data={subjectsArray.map(sub => ({
//             subject: sub,
//             marks: selectedExamType === "halfYearly"
//               ? parseFloat(getTerm1Total(sub))
//               : parseFloat(getFinalTotal(sub))
//           }))}
//           margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="subject" angle={-45} textAnchor="end" interval={0} height={60} />
//           <YAxis domain={[0, 100]} />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="marks" fill="#3498db" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>

//     {/* Attendance Pie Chart */}
//     <div style={{ flex: "0 1 300px", background: "#fdfdfd", padding: "10px", borderRadius: "8px" }}>
//       <h5 style={{ textAlign: "center", color: "#27ae60" }}>Attendance Overview</h5>
//       <ResponsiveContainer width="100%" height={250}>
//         <PieChart>
//           <Pie
//             data={[
//               { name: "Present", value: att?.present || 0 },
//               { name: "Absent", value: (att?.total || 0) - (att?.present || 0) }
//             ]}
//             cx="50%"
//             cy="50%"
//             labelLine={false}
//             label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//             outerRadius={80}
//             fill="#8884d8"
//             dataKey="value"
//           >
//             <Cell fill="#27ae60" />
//             <Cell fill="#e74c3c" />
//           </Pie>
//           <Tooltip />
//           <Legend />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   </div>
// </div>

//                     <div style={{ marginTop: "10px", fontSize: "0.8rem" }}>
//                       <strong>Students are assessed according to the following:</strong><br />
//                       Promotion is based on the day-to-day work of the student throughout the year and also on the performance in the half yearly/summative examination.<br />
//                       <strong>First Term:</strong> PA I (10%) + PA II (10%) + SA I (80%) = 100%<br />
//                       <strong>Second Term:</strong> PA III (10%) + PA IV (10%) + SA II (80%) = 100%<br />
//                       <strong>Final Result:</strong> 50% of 1st Term + 50% of 2nd Term = 100%
//                     </div>
//                     <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
//                       <div>
//                         <strong>Total Obtain Marks (Final):</strong> {totalFinal}<br />
//                         <strong>Percentage:</strong> {percentageFinal}%
//                       </div>
//                       <div>
//                         <strong>Class Teacher Sig:</strong> _______________<br />
//                         <strong>Principal Sig:</strong> _______________
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div className="action-buttons">
//                   <button onClick={() => downloadReportCard(r._id, student.name, selectedExamType)}>
//                     📥 Download PDF
//                   </button>
//                   <button onClick={() => printReportCard(r._id, selectedExamType)}>
//                     🖨️ Print
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ✅ NEW: Periodic Assessment (PA1–PA4) Summary Tables - FIXED */}
//             {/* ✅ NEW: Periodic Assessment (PA1–PA4) Summary Tables - WITH INDIVIDUAL PRINT */}
//       {filteredResults.length > 0 && (
//         <div style={{ marginTop: "2.5rem", paddingTop: "2rem", borderTop: "2px solid #e0e0e0" }}>
//           <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '1.5rem', fontSize: '1.6rem' }}>
//             Periodic Assessments (PA1 - PA4)
//           </h2>

//           {['pa1', 'pa2', 'pa3', 'pa4'].map((paKey) => {
//             const paLabel = paKey === 'pa1' ? 'PA I' : 
//                            paKey === 'pa2' ? 'PA II' : 
//                            paKey === 'pa3' ? 'PA III' : 'PA IV';
            
//             return (
//               <div 
//                 key={paKey} 
//                 id={`pa-section-${paKey}`} 
//                 style={{ marginBottom: '2.5rem', pageBreakInside: 'avoid' }}
//               >
//                 <h3 style={{ 
//                   backgroundColor: '#e8f4f8', 
//                   padding: '0.7rem', 
//                   borderRadius: '8px', 
//                   color: '#2980b9',
//                   marginBottom: '1.2rem',
//                   fontSize: '1.3rem'
//                 }}>
//                   {paLabel} Report ({paKey.toUpperCase()})
//                 </h3>

//                 {classOptions.map((cls) => {
//                   const classStudents = filteredResults.filter(r => r.class === cls);
//                   if (classStudents.length === 0) return null;

//                   const subjects = classSubjectMap[cls] || [];

//                   return (
//                     <div 
//   key={`${paKey}-${cls}`} 
//   id={`pa-section-${paKey}-${cls}`} 
//   style={{ marginBottom: '1.8rem', pageBreakInside: 'avoid' }}
// >
//                       <h4 style={{ 
//                         color: '#2c3e50', 
//                         borderBottom: '1px solid #ccc', 
//                         paddingBottom: '0.5rem',
//                         marginBottom: '1rem',
//                         fontSize: '1.15rem'
//                       }}>
//                         Class: {cls}
//                       </h4>
//                       <div className="table-container">
//                         <table className="marks-table">
//                           <thead>
//                             <tr>
//                               <th>Roll No</th>
//                               <th>Student Name</th>
//                               {subjects.map(sub => (
//                                 <th key={`${paKey}-${cls}-${sub}`}>{sub}</th>
//                               ))}
//                               <th>Total / {20 * subjects.length}</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {classStudents.map((r) => {
//                               const student = getStudentFromRecord(r);
//                               if (!student) return null;

//                               const examData = r.exams || {};
//                               const marks = subjects.map(sub => 
//                                 examData[paKey]?.[sub] !== undefined ? examData[paKey][sub] : 0
//                               );
//                               const total = marks.reduce((sum, m) => sum + m, 0);
//                               const max = subjects.length * 20;

//                               return (
//                                 <tr key={`${paKey}-${r._id || 'no-id'}`}>
//                                   <td>{student.rollNo || "—"}</td>
//                                   <td>{student.name || "Unknown"}</td>
//                                   {marks.map((mark, idx) => (
//                                     <td key={idx}>{mark}</td>
//                                   ))}
//                                   <td><strong>{total} / {max}</strong></td>
//                                 </tr>
//                               );
//                             })}
//                           </tbody>
//                         </table>
//                       </div>
//                       <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
//     <button
//       onClick={() => printSinglePAClass(paKey, cls)}
//       style={{
//         padding: '0.35rem 0.9rem',
//         backgroundColor: '#27ae60',
//         color: 'white',
//         border: 'none',
//         borderRadius: '5px',
//         fontSize: '0.8rem',
//         cursor: 'pointer'
//       }}
//     >
//       🖨️ Print Class {cls}
//     </button>
//   </div>
//                     </div>
//                   );
//                 })}

//                 {/* ✅ Print button for THIS PA only */}
//                 <div style={{ textAlign: 'center', marginTop: '1rem' }}>
//                   <button
//                     onClick={() => printSinglePA(paKey)}
//                     style={{
//                       padding: '0.4rem 1rem',
//                       backgroundColor: '#3498db',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '5px',
//                       fontSize: '0.85rem',
//                       cursor: 'pointer'
//                     }}
//                   >
//                     🖨️ Print {paLabel} Report
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewResult;



// // src/pages/teacher/ViewResult.jsx
// import React, { useEffect, useState } from "react";
// import html2pdf from "html2pdf.js";
// import Logo from "../../assets/logo.png";
// import { endpoints } from "../../config/api";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   PieChart, Pie, Cell, ResponsiveContainer
// } from "recharts";

// const ViewResult = () => {
//   const [results, setResults] = useState([]);
//   const [filteredResults, setFilteredResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [assignedClasses, setAssignedClasses] = useState([]);
//   const [selectedExamType, setSelectedExamType] = useState("halfYearly");
//   const [attendanceData, setAttendanceData] = useState({});
//   const [classSubjectMap, setClassSubjectMap] = useState({});

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return setError("Unauthorized");
//     fetch(endpoints.auth.me, { headers: { Authorization: `Bearer ${token}` } })
//       .then((res) => res.json())
//       .then((data) => setAssignedClasses(data.assignedClasses || []))
//       .catch((err) => console.error("Error fetching teacher info:", err));
//     fetch(endpoints.marks.list, { headers: { Authorization: `Bearer ${token}` } })
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to load results");
//         return res.json();
//       })
//       .then((data) => {
//         setResults(Array.isArray(data) ? data : []);
//         setFilteredResults(Array.isArray(data) ? data : []);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching results:", err);
//         setError("Failed to load results.");
//         setLoading(false);
//       });
//     fetch(endpoints.classSubjects.getAll, { headers: { Authorization: `Bearer ${token}` } })
//       .then((res) => {
//         if (res.ok) return res.json();
//         throw new Error("Failed to load class-subject mapping");
//       })
//       .then((mapping) => setClassSubjectMap(mapping))
//       .catch((err) => console.error("Error fetching class-subject mapping:", err));
//   }, []);

//   useEffect(() => {
//     if (filteredResults.length === 0) return;
//     const token = localStorage.getItem("token");
//     const fetchAttendance = async () => {
//       const attMap = {};
//       for (const r of filteredResults) {
//         const studentId = r.studentId?._id || r.studentId;
//         if (!studentId) continue;
//         try {
//           const res = await fetch(endpoints.attendance.studentTotal(studentId), {
//             headers: { Authorization: `Bearer ${token}` }
//           });
//           if (res.ok) {
//             const data = await res.json();
//             attMap[studentId] = {
//               present: data.totalPresentDays,
//               total: data.totalSchoolDays,
//               percentage: data.percentage
//             };
//           }
//         } catch (err) {
//           console.error("Failed to load attendance for", studentId);
//         }
//       }
//       setAttendanceData(attMap);
//     };
//     fetchAttendance();
//   }, [filteredResults]);

//   useEffect(() => {
//     let filtered = results;
//     if (assignedClasses.length > 0) {
//       filtered = filtered.filter((r) => assignedClasses.includes(r.class));
//     }
//     if (searchTerm) {
//       filtered = filtered.filter((r) =>
//         r.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }
//     if (selectedClass) {
//       filtered = filtered.filter((r) => r.class === selectedClass);
//     }
//     setFilteredResults(filtered);
//   }, [searchTerm, selectedClass, results, assignedClasses]);

//   if (loading) return <h3 style={{ textAlign: "center", padding: "2rem" }}>Loading results...</h3>;
//   if (error) return <h3 style={{ textAlign: "center", color: "red", padding: "2rem" }}>{error}</h3>;

//   const classOptions = [...new Set(filteredResults.map((r) => r.class))];

//   const getGrade = (marks, className) => {
//     const cls = String(className || "").toLowerCase().trim();
//     if (["nursery", "lkg", "ukg", "play", "i", "ii", "iii", "iv", "v"].includes(cls)) {
//       if (marks >= 90) return "Outstanding";
//       if (marks >= 75) return "Very Good";
//       if (marks >= 56) return "Good";
//       if (marks >= 35) return "Needs Improvement";
//       return "Poor";
//     }
//     if (marks >= 91) return "A1";
//     if (marks >= 81) return "A2";
//     if (marks >= 71) return "B1";
//     if (marks >= 61) return "B2";
//     if (marks >= 51) return "C1";
//     if (marks >= 41) return "C2";
//     if (marks >= 33) return "D";
//     return "E";
//   };

//   const downloadReportCard = (studentId, name, examType) => {
//     const element = document.getElementById(`report-card-${studentId}-${examType}`);
//     if (!element) return;
//     const logo = element.querySelector('img');
//     const originalWidth = logo?.style.width || '60px';
//     const originalHeight = logo?.style.height || 'auto';
//     if (logo) {
//       logo.style.width = '60px';
//       logo.style.height = 'auto';
//     }
//     const opt = {
//       margin: 0.4,
//       filename: `${name.replace(/\s+/g, "_")}_${examType === "halfYearly" ? "HalfYearly" : "Annual"}_ReportCard.pdf`,
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true },
//       jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
//     };
//     html2pdf()
//       .from(element)
//       .set(opt)
//       .save()
//       .finally(() => {
//         if (logo) {
//           logo.style.width = originalWidth;
//           logo.style.height = originalHeight;
//         }
//       });
//   };

//   const printReportCard = (studentId, examType) => {
//     const element = document.getElementById(`report-card-${studentId}-${examType}`);
//     if (!element) return;
//     const clone = element.cloneNode(true);
//     const logo = clone.querySelector('img');
//     if (logo) {
//       logo.style.width = '60px';
//       logo.style.height = 'auto';
//     }
//     const printContent = clone.innerHTML;
//     const printWin = window.open('', '_blank');
//     printWin.document.write(`
//       <html>
//         <head>
//           <title>Report Card</title>
//           <style>
//             body {
//               font-family: Poppins, sans-serif;
//               padding: 15px;
//               font-size: 12px;
//             }
//             .shakti-header {
//               background-color: #FFD700 !important;
//               padding: 10px 0;
//               display: flex;
//               justify-content: space-between;
//               align-items: center;
//             }
//             .shakti-header img {
//               width: 60px;
//               height: auto;
//             }
//             h1 {
//               margin: 0;
//               font-size: 24px;
//               font-weight: bold;
//             }
//             h3 {
//               text-align: center;
//               margin: 10px 0;
//               font-size: 16px;
//             }
//             table {
//               width: 100%;
//               border-collapse: collapse;
//               font-size: 10px;
//             }
//             th, td {
//               border: 1px solid #000;
//               padding: 4px;
//               text-align: center;
//             }
//             @media print {
//               body { padding: 0; }
//               .shakti-header img { width: 60px !important; }
//             }
//           </style>
//         </head>
//         <body>${printContent}</body>
//       </html>
//     `);
//     printWin.document.close();
//     printWin.print();
//   };

//   // ✅ Print only Periodic Assessments section
//   const printPAReport = () => {
//     const paSection = document.querySelector('.pa-report-section');
//     if (!paSection) return;
//     const clone = paSection.cloneNode(true);
//     // Logo add karein (optional, but consistent)
//     const header = document.createElement('div');
//     header.innerHTML = `
//       <div style="display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
//         <img src="${Logo}" alt="School Logo" style="width: 60px; height: auto; margin-right: 10px;" />
//         <div>
//           <h1 style="font-size: 18px; margin: 0; color: #2c3e50;">AMBIKA INTERNATIONAL SCHOOL</h1>
//           <p style="font-size: 12px; margin: 4px 0; color: #555;">Periodic Assessments Report</p>
//         </div>
//       </div>
//     `;
//     clone.insertBefore(header, clone.firstChild);
//     const printContent = clone.innerHTML;
//     const printWin = window.open('', '_blank');
//     printWin.document.write(`
//       <html>
//         <head>
//           <title>Periodic Assessments Report</title>
//           <style>
//             body {
//               font-family: Poppins, sans-serif;
//               padding: 15px;
//               font-size: 12px;
//               line-height: 1.4;
//             }
//             .header img {
//               width: 60px;
//               height: auto;
//               margin-right: 10px;
//             }
//             h1 { font-size: 18px; margin: 0; }
//             h2 { font-size: 16px; color: #2c3e50; text-align: center; margin: 15px 0; }
//             h3 { font-size: 14px; margin: 12px 0; color: #2980b9; }
//             h4 { font-size: 13px; margin: 10px 0 8px; color: #2c3e50; }
//             table {
//               width: 100%;
//               border-collapse: collapse;
//               font-size: 11px;
//               margin: 8px 0;
//             }
//             th, td {
//               border: 1px solid #000;
//               padding: 5px;
//               text-align: center;
//             }
//             @media print {
//               body { padding: 0; }
//               .header img { width: 50px !important; }
//             }
//           </style>
//         </head>
//         <body>${printContent}</body>
//       </html>
//     `);
//     printWin.document.close();
//     printWin.print();
//   };

//   // ✅ Print a SINGLE PA report for a SPECIFIC CLASS
//   const printSinglePAClass = (paKey, className) => {
//     const element = document.getElementById(`pa-section-${paKey}-${className}`);
//     if (!element) return;
//     const paNames = {
//       pa1: "PA I",
//       pa2: "PA II",
//       pa3: "PA III",
//       pa4: "PA IV"
//     };
//     const clone = element.cloneNode(true);
//     // Remove print buttons from print view
//     const printButtons = clone.querySelectorAll('button');
//     printButtons.forEach(btn => btn.remove());
//     // Add school header
//     const header = document.createElement('div');
//     header.innerHTML = `
//       <div style="display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
//         <img src="${Logo}" alt="School Logo" style="width: 60px; height: auto; margin-right: 10px;" />
//         <div>
//           <h1 style="font-size: 18px; margin: 0; color: #2c3e50;">AMBIKA INTERNATIONAL SCHOOL</h1>
//           <p style="font-size: 12px; margin: 4px 0; color: #555;">${paNames[paKey]} Report - Class ${className}</p>
//         </div>
//       </div>
//     `;
//     clone.insertBefore(header, clone.firstChild);
//     const printContent = clone.innerHTML;
//     const printWin = window.open('', '_blank');
//     printWin.document.write(`
//       <html>
//         <head>
//           <title>${paNames[paKey]} - Class ${className}</title>
//           <style>
//             body {
//               font-family: 'Poppins', sans-serif;
//               padding: 15px;
//               font-size: 12px;
//               line-height: 1.4;
//             }
//             table {
//               width: 100%;
//               border-collapse: collapse;
//               font-size: 11px;
//             }
//             th, td {
//               border: 1px solid #000;
//               padding: 5px;
//               text-align: center;
//             }
//             .header img {
//               width: 60px;
//               height: auto;
//               margin-right: 10px;
//             }
//             h1 { font-size: 18px; margin: 0; color: #2c3e50; }
//             h3 { font-size: 14px; margin: 12px 0; color: #2980b9; }
//             h4 { font-size: 13px; margin: 10px 0 8px; color: #2c3e50; }
//             @media print {
//               body { padding: 0; }
//               .header img { width: 50px !important; }
//             }
//           </style>
//         </head>
//         <body>${printContent}</body>
//       </html>
//     `);
//     printWin.document.close();
//     printWin.print();
//   };

//   // ✅ Print a SINGLE PA report (e.g., only PA1)
//   const printSinglePA = (paKey) => {
//     const element = document.getElementById(`pa-section-${paKey}`);
//     if (!element) return;
//     const paNames = {
//       pa1: "PA I",
//       pa2: "PA II",
//       pa3: "PA III",
//       pa4: "PA IV"
//     };
//     const clone = element.cloneNode(true);
//     // Remove the print button from print view
//     const printButton = clone.querySelector('button');
//     if (printButton) printButton.remove();
//     // Add school header
//     const header = document.createElement('div');
//     header.innerHTML = `
//       <div style="display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
//         <img src="${Logo}" alt="School Logo" style="width: 60px; height: auto; margin-right: 10px;" />
//         <div>
//           <h1 style="font-size: 18px; margin: 0; color: #2c3e50;">AMBIKA INTERNATIONAL SCHOOL</h1>
//           <p style="font-size: 12px; margin: 4px 0; color: #555;">${paNames[paKey]} Report</p>
//         </div>
//       </div>
//     `;
//     clone.insertBefore(header, clone.firstChild);
//     const printContent = clone.innerHTML;
//     const printWin = window.open('', '_blank');
//     printWin.document.write(`
//       <html>
//         <head>
//           <title>${paNames[paKey]} Report</title>
//           <style>
//             body {
//               font-family: 'Poppins', sans-serif;
//               padding: 15px;
//               font-size: 12px;
//               line-height: 1.4;
//             }
//             table {
//               width: 100%;
//               border-collapse: collapse;
//               font-size: 11px;
//             }
//             th, td {
//               border: 1px solid #000;
//               padding: 5px;
//               text-align: center;
//             }
//             .header img {
//               width: 60px;
//               height: auto;
//               margin-right: 10px;
//             }
//             h1 { font-size: 18px; margin: 0; color: #2c3e50; }
//             h3 { font-size: 14px; margin: 12px 0; color: #2980b9; }
//             h4 { font-size: 13px; margin: 10px 0 8px; color: #2c3e50; }
//             @media print {
//               body { padding: 0; }
//               .header img { width: 50px !important; }
//             }
//           </style>
//         </head>
//         <body>${printContent}</body>
//       </html>
//     `);
//     printWin.document.close();
//     printWin.print();
//   };

//   // ✅ Helper: Safely extract student object
//   const getStudentFromRecord = (record) => {
//     if (!record.studentId) return null;
//     // If it's already an object (populated)
//     if (typeof record.studentId === 'object' && record.studentId !== null) {
//       return record.studentId;
//     }
//     // If it's just an ID string, we can't show details → skip
//     return null;
//   };

//   return (
//     <div className="view-result-container">
//       <style>{`
//         .view-result-container {
//           padding: 1rem;
//           background: #f9f9f9;
//           font-family: 'Poppins', sans-serif;
//         }
//         h2 {
//           text-align: center;
//           color: #2c3e50;
//           margin: 1rem 0;
//           font-size: 1.6rem;
//         }
//         .filters {
//           display: flex;
//           gap: 0.8rem;
//           justify-content: center;
//           flex-wrap: wrap;
//           margin: 1rem 0;
//         }
//         .filters input,
//         .filters select {
//           padding: 0.5rem;
//           border: 1px solid #ccc;
//           border-radius: 6px;
//           font-size: 0.95rem;
//           min-width: 160px;
//         }
//         .report-cards-grid {
//           display: grid;
//           gap: 1.5rem;
//           margin-top: 1.2rem;
//         }
//         .report-card {
//           background: #fff;
//           padding: 1rem;
//           border-radius: 8px;
//           box-shadow: 0 2px 6px rgba(0,0,0,0.08);
//         }
//         .shakti-header {
//           background-color: #FFD700;
//           padding: 10px 0;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           border-bottom: 2px solid #000;
//         }
//         .shakti-header img {
//           width: 60px;
//           height: auto;
//           margin: 0 10px;
//         }
//         .shakti-header h1 {
//           margin: 0;
//           font-size: 24px;
//           font-weight: bold;
//         }
//         .shakti-header p {
//           margin: 0;
//           font-size: 10px;
//           color: #000;
//         }
//         .table-container {
//           overflow-x: auto;
//           width: 100%;
//           margin: 10px 0;
//         }
//         .marks-table {
//           width: 100%;
//           border-collapse: collapse;
//           font-size: 10px;
//         }
//         .marks-table th,
//         .marks-table td {
//           padding: 4px;
//           border: 1px solid #000;
//           text-align: center;
//         }
//         .action-buttons {
//           margin-top: 12px;
//           display: flex;
//           gap: 8px;
//           justify-content: center;
//         }
//         .action-buttons button {
//           padding: 0.4rem 0.8rem;
//           font-size: 0.85rem;
//           border: none;
//           border-radius: 5px;
//           cursor: pointer;
//           background: #3498db;
//           color: white;
//         }
//         .action-buttons button:hover {
//           background: #2980b9;
//         }
//         @media (max-width: 768px) {
//           .filters {
//             flex-direction: column;
//             align-items: stretch;
//           }
//           .filters input,
//           .filters select {
//             min-width: auto;
//             width: 100%;
//           }
//           .shakti-header {
//             flex-direction: column;
//             text-align: center;
//           }
//           .shakti-header img {
//             width: 32px;
//             margin-bottom: 8px;
//             margin-right: 0;
//           }
//           .marks-table {
//             font-size: 9px;
//           }
//           .marks-table th,
//           .marks-table td {
//             padding: 3px;
//           }
//           h3 {
//             font-size: 1.1rem;
//           }
//         }
//         @media (max-width: 480px) {
//           .view-result-container {
//             padding: 0.8rem;
//           }
//           .report-card {
//             padding: 0.8rem;
//           }
//           .shakti-header img {
//             width: 28px;
//           }
//           .marks-table {
//             font-size: 8px;
//           }
//           .action-buttons button {
//             padding: 0.35rem 0.7rem;
//             font-size: 0.8rem;
//           }
//         }
//       `}</style>
//       <h2>Student Marks Record</h2>
//       <div className="filters">
//         <input
//           type="text"
//           placeholder="🔍 Search by Student Name"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
//           <option value="">All Classes</option>
//           {classOptions.map((cls) => (
//             <option key={cls} value={cls}>
//               {cls}
//             </option>
//           ))}
//         </select>
//         <select value={selectedExamType} onChange={(e) => setSelectedExamType(e.target.value)}>
//           <option value="halfYearly">Half Yearly Report</option>
//           <option value="final">Annual Report Card</option>
//         </select>
//       </div>
//       {filteredResults.length === 0 ? (
//         <p style={{ textAlign: "center", color: "#7f8c8d", padding: "1.5rem" }}>No matching results found.</p>
//       ) : (
//         <div className="report-cards-grid">
//           {filteredResults.map((r) => {
//             const student = getStudentFromRecord(r);
//             if (!student || !r.class) return null;
//             const studentId = student._id || r.studentId;
//             const examData = r.exams || {};
//             const subjectsArray = classSubjectMap[r.class] || [];
//             const att = attendanceData[studentId];
//             const attendanceDisplay = att
//               ? `${att.present} / ${att.total} (${att.percentage}%)`
//               : student.attendance
//                 ? `${student.attendance} / 115`
//                 : "—";

//             // Calculate Term 1 Total for each subject
//             const getTerm1Total = (sub) => {
//               const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
//               const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
//               const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
//               return ((pa1 / 2) + (pa2 / 2) + sa1).toFixed(1);
//             };

//             // Calculate Final Total for each subject
//             const getFinalTotal = (sub) => {
//               const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
//               const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
//               const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
//               const pa3 = Math.min(examData.pa3?.[sub] || 0, 20);
//               const pa4 = Math.min(examData.pa4?.[sub] || 0, 20);
//               const sa2 = Math.min(examData.final?.[sub] || 0, 80);
//               const term1 = (pa1 / 2) + (pa2 / 2) + sa1;
//               const term2Component = pa3 + pa4 + sa2;
//               const finalTotal = (term1 / 2) + (term2Component / 2);
//               return finalTotal.toFixed(1);
//             };

//             // Calculate overall totals
//             const totalTerm1 = subjectsArray.reduce((sum, sub) => sum + parseFloat(getTerm1Total(sub)), 0).toFixed(1);
//             const totalFinal = subjectsArray.reduce((sum, sub) => sum + parseFloat(getFinalTotal(sub)), 0).toFixed(1);
//             const percentageTerm1 = ((totalTerm1 / (subjectsArray.length * 100)) * 100).toFixed(2);
//             const percentageFinal = ((totalFinal / (subjectsArray.length * 100)) * 100).toFixed(2);

//             // Calculate grade for overall performance
//             const overallGradeTerm1 = getGrade(totalTerm1, r.class);
//             const overallGradeFinal = getGrade(totalFinal, r.class);

//             return (
//               <div key={`${r._id}-${selectedExamType}`} className="report-card">
//                 {selectedExamType === "halfYearly" && (
//                   <div id={`report-card-${r._id}-halfYearly`}>
//                     {/* Header */}
//                     <div className="shakti-header">
//                       <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
//                         <img src={Logo} alt="Shakti Shanti Academy Logo" style={{ width: '60px', height: 'auto', marginRight: '10px' }} />
//                         <div>
//                           <h1>SHAKTI SHANTI ACADEMY</h1>
//                           <p>Ambika Sthan, Ami, Saran (Bihar) - 841207</p>
//                           <p>Affiliated to CBSE, Bharat (Up to 10+2) Level</p>
//                           <p>E-mail:- ssa.ami1998@gmail.com, Web:- www.ssaami.ac.in</p>
//                         </div>
//                       </div>
//                       {/* Right-side logo placeholder */}
//                       <div style={{ marginRight: '20px' }}>
//                         <img src={Logo} alt="Right Logo" style={{ width: '60px', height: 'auto' }} />
//                       </div>
//                     </div>

//                     {/* Main Title */}
//                     <h3 style={{ textAlign: 'center', margin: '10px 0', fontSize: '16px' }}>PROGRESS REPORT(2025-26)</h3>

//                     {/* Student Information */}
//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
//                       <table style={{ border: '1px solid #000', borderCollapse: 'collapse', flex: '1', marginRight: '10px' }}>
//                         <tbody>
//                           <tr><td style={{ padding: '4px' }}><strong>NAME :</strong> {student.name}</td></tr>
//                           <tr><td style={{ padding: '4px' }}><strong>FATHER :</strong> {student.fatherName || "N/A"}</td></tr>
//                           <tr><td style={{ padding: '4px' }}><strong>MOTHER :</strong> {student.motherName || "N/A"}</td></tr>
//                           <tr><td style={{ padding: '4px' }}><strong>DOB :</strong> {student.dob || "N/A"}</td></tr>
//                         </tbody>
//                       </table>
//                       <div style={{ width: '80px', height: '80px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                         {/* Placeholder for Photo */}
//                         <span style={{ fontSize: '10px' }}>Photo</span>
//                       </div>
//                       <table style={{ border: '1px solid #000', borderCollapse: 'collapse', flex: '1', marginLeft: '10px' }}>
//                         <tbody>
//                           <tr><td style={{ padding: '4px' }}><strong>CLASS :</strong> {r.class}</td></tr>
//                           <tr><td style={{ padding: '4px' }}><strong>ROLL NO.:</strong> {student.rollNo || "N/A"}</td></tr>
//                           <tr><td style={{ padding: '4px' }}><strong>ADM. NO. :</strong> {student.admissionNo || "N/A"}</td></tr>
//                         </tbody>
//                       </table>
//                     </div>

//                     {/* Scholastic Areas */}
//                     <div style={{ marginTop: '10px' }}>
//                       <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '14px' }}>SCHOLASTIC AREAS</h4>
//                       <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '10px' }}>
//                         <thead>
//                           <tr>
//                             <th rowSpan="2" style={{ border: '1px solid #000', padding: '4px' }}>SUBJECT</th>
//                             <th colSpan="4" style={{ border: '1px solid #000', padding: '4px' }}>TERM I</th>
//                           </tr>
//                           <tr>
//                             <th style={{ border: '1px solid #000', padding: '4px' }}>PA (10)</th>
//                             <th style={{ border: '1px solid #000', padding: '4px' }}>NOTE BOOK (5)</th>
//                             <th style={{ border: '1px solid #000', padding: '4px' }}>SUB ENRICHMENT (5)</th>
//                             <th style={{ border: '1px solid #000', padding: '4px' }}>HALF YEARLY (80)</th>
//                             <th style={{ border: '1px solid #000', padding: '4px' }}>TOTAL</th>
//                             <th style={{ border: '1px solid #000', padding: '4px' }}>GRADE</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {subjectsArray.map((sub) => {
//                             const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
//                             const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
//                             const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
//                             const term1 = (pa1 / 2) + (pa2 / 2) + sa1;
//                             const grade = getGrade(term1, r.class);

//                             // For simplicity, we're using PA as PA1/2, Note Book and Sub Enrichment as 5 each.
//                             const paValue = (pa1 + pa2) / 4; // This is an assumption. Adjust as needed.
//                             const noteBookValue = 5; // Placeholder
//                             const subEnrichmentValue = 5; // Placeholder
//                             const halfYearlyValue = sa1;
//                             const totalValue = paValue + noteBookValue + subEnrichmentValue + halfYearlyValue;

//                             return (
//                               <tr key={sub}>
//                                 <td style={{ border: '1px solid #000', padding: '4px' }}>{sub}</td>
//                                 <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{paValue.toFixed(2)}</td>
//                                 <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{noteBookValue}</td>
//                                 <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{subEnrichmentValue}</td>
//                                 <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{halfYearlyValue}</td>
//                                 <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{totalValue.toFixed(2)}</td>
//                                 <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{grade}</td>
//                               </tr>
//                             );
//                           })}
//                           {/* General Knowledge row */}
//                           <tr>
//                             <td style={{ border: '1px solid #000', padding: '4px' }}>General Knowledge</td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>A</td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>D</td>
//                           </tr>
//                         </tbody>
//                         <tfoot>
//                           <tr>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}><strong>Total</strong></td>
//                             <td colSpan="4" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}><strong>{totalTerm1}</strong></td>
//                             <td style={{ border: '1px solid #000', padding: '4px' }}></td>
//                           </tr>
//                           <tr>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}><strong>Percentage</strong></td>
//                             <td colSpan="4" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}><strong>{percentageTerm1}%</strong></td>
//                             <td style={{ border: '1px solid #000', padding: '4px' }}></td>
//                           </tr>
//                           <tr>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}><strong>Overall Grade</strong></td>
//                             <td colSpan="4" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}><strong>{overallGradeTerm1}</strong></td>
//                             <td style={{ border: '1px solid #000', padding: '4px' }}></td>
//                           </tr>
//                           <tr>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}><strong>Attendance</strong></td>
//                             <td colSpan="4" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}><strong>{attendanceDisplay}</strong></td>
//                             <td style={{ border: '1px solid #000', padding: '4px' }}></td>
//                           </tr>
//                         </tfoot>
//                       </table>
//                     </div>

//                     {/* Co-Scholastic Areas and Graphs */}
//                     <div style={{ display: 'flex', marginTop: '10px' }}>
//                       <div style={{ flex: '1', marginRight: '10px' }}>
//                         <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '14px' }}>CO-SCHOLASTIC AREAS</h4>
//                         <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '10px' }}>
//                           <thead>
//                             <tr>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>TERM-I</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             <tr><td style={{ border: '1px solid #000', padding: '4px' }}>Work Education</td><td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>B</td></tr>
//                             <tr><td style={{ border: '1px solid #000', padding: '4px' }}>Art Education</td><td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>A</td></tr>
//                             <tr><td style={{ border: '1px solid #000', padding: '4px' }}>Health & Physical Education</td><td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>A</td></tr>
//                             <tr><td style={{ border: '1px solid #000', padding: '4px' }}>Discipline</td><td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>B</td></tr>
//                           </tbody>
//                         </table>
//                       </div>
//                       <div style={{ flex: '1', marginLeft: '10px' }}>
//                         <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '14px' }}>Subject wise Performance</h4>
//                         <ResponsiveContainer width="100%" height={200}>
//                           <BarChart
//                             data={subjectsArray.map(sub => ({
//                               subject: sub,
//                               marks: parseFloat(getTerm1Total(sub)),
//                               topper: 85 // Placeholder for topper's score
//                             }))}
//                             margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
//                           >
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis dataKey="subject" angle={-45} textAnchor="end" interval={0} height={40} />
//                             <YAxis domain={[0, 100]} />
//                             <Tooltip />
//                             <Legend />
//                             <Bar dataKey="marks" fill="#000000" name="Pragya Priyadarshi" />
//                             <Bar dataKey="topper" fill="#8884d8" name="Topper" />
//                           </BarChart>
//                         </ResponsiveContainer>
//                       </div>
//                     </div>

//                     {/* Grading Scales */}
//                     <div style={{ display: 'flex', marginTop: '10px' }}>
//                       <div style={{ flex: '1', marginRight: '10px' }}>
//                         <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '12px' }}>Grading Scale for Co-Scholastic Areas</h4>
//                         <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '10px' }}>
//                           <tbody>
//                             <tr><td style={{ border: '1px solid #000', padding: '4px' }}>A: Outstanding</td><td style={{ border: '1px solid #000', padding: '4px' }}>B: Very Good</td><td style={{ border: '1px solid #000', padding: '4px' }}>C: Fair</td><td style={{ border: '1px solid #000', padding: '4px' }}>D: Satisfactory</td><td style={{ border: '1px solid #000', padding: '4px' }}>E: Unsatisfactory</td></tr>
//                           </tbody>
//                         </table>
//                       </div>
//                       <div style={{ flex: '1', marginLeft: '10px' }}>
//                         <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '12px' }}>Grading Scale for Scholastic Areas</h4>
//                         <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '10px' }}>
//                           <thead>
//                             <tr>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>Grade</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>A1</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>A2</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>B1</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>B2</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>C1</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>C2</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>D</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>E</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             <tr>
//                               <td style={{ border: '1px solid #000', padding: '4px' }}>Marks Range</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>91-100</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>81-90</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>71-80</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>61-70</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>51-60</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>41-50</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>33-40</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>32 & Below</td>
//                             </tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>

//                     {/* Remarks */}
//                     <div style={{ marginTop: '10px', border: '1px solid #000', padding: '5px' }}>
//                       <strong>REMARKS:</strong> SHOWS INTEREST IN LEARNING BUT NEEDS CONSISTENT GUIDANCE AND REASSURANCE.
//                     </div>

//                     {/* Attendance Pie Chart and Signatures */}
//                     <div style={{ display: 'flex', marginTop: '10px' }}>
//                       <div style={{ flex: '1', marginRight: '10px' }}>
//                         <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '12px' }}>ATTENDANCE</h4>
//                         <ResponsiveContainer width="100%" height={150}>
//                           <PieChart>
//                             <Pie
//                               data={[
//                                 { name: "Present", value: att?.present || 0 },
//                                 { name: "Absent", value: (att?.total || 0) - (att?.present || 0) }
//                               ]}
//                               cx="50%"
//                               cy="50%"
//                               labelLine={false}
//                               label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                               outerRadius={60}
//                               fill="#8884d8"
//                               dataKey="value"
//                             >
//                               <Cell fill="#27ae60" />
//                               <Cell fill="#e74c3c" />
//                             </Pie>
//                             <Tooltip />
//                             <Legend />
//                           </PieChart>
//                         </ResponsiveContainer>
//                       </div>
//                       <div style={{ flex: '1', marginLeft: '10px' }}>
//                         <div style={{ height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
//                           <div style={{ textAlign: 'center' }}>
//                             <div style={{ height: '40px', border: '1px solid #000', marginBottom: '5px' }}></div>
//                             Class Teacher
//                           </div>
//                           <div style={{ textAlign: 'center' }}>
//                             <div style={{ height: '40px', border: '1px solid #000', marginBottom: '5px' }}></div>
//                             Principal
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Date of Issue */}
//                     <div style={{ marginTop: '10px', textAlign: 'left', fontSize: '10px' }}>
//                       <strong>DATE OF ISSUE :</strong> 11-10-2025
//                     </div>
//                   </div>
//                 )}

//                 {selectedExamType === "final" && (
//                   <div id={`report-card-${r._id}-final`}>
//                     {/* Header */}
//                     <div className="shakti-header">
//                       <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
//                         <img src={Logo} alt="Shakti Shanti Academy Logo" style={{ width: '60px', height: 'auto', marginRight: '10px' }} />
//                         <div>
//                           <h1>SHAKTI SHANTI ACADEMY</h1>
//                           <p>Ambika Sthan, Ami, Saran (Bihar) - 841207</p>
//                           <p>Affiliated to CBSE, Bharat (Up to 10+2) Level</p>
//                           <p>E-mail:- ssa.ami1998@gmail.com, Web:- www.ssaami.ac.in</p>
//                         </div>
//                       </div>
//                       {/* Right-side logo placeholder */}
//                       <div style={{ marginRight: '20px' }}>
//                         <img src={Logo} alt="Right Logo" style={{ width: '60px', height: 'auto' }} />
//                       </div>
//                     </div>

//                     {/* Main Title */}
//                     <h3 style={{ textAlign: 'center', margin: '10px 0', fontSize: '16px' }}>PROGRESS REPORT(2025-26)</h3>

//                     {/* Student Information */}
//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
//                       <table style={{ border: '1px solid #000', borderCollapse: 'collapse', flex: '1', marginRight: '10px' }}>
//                         <tbody>
//                           <tr><td style={{ padding: '4px' }}><strong>NAME :</strong> {student.name}</td></tr>
//                           <tr><td style={{ padding: '4px' }}><strong>FATHER :</strong> {student.fatherName || "N/A"}</td></tr>
//                           <tr><td style={{ padding: '4px' }}><strong>MOTHER :</strong> {student.motherName || "N/A"}</td></tr>
//                           <tr><td style={{ padding: '4px' }}><strong>DOB :</strong> {student.dob || "N/A"}</td></tr>
//                         </tbody>
//                       </table>
//                       <div style={{ width: '80px', height: '80px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                         {/* Placeholder for Photo */}
//                         <span style={{ fontSize: '10px' }}>Photo</span>
//                       </div>
//                       <table style={{ border: '1px solid #000', borderCollapse: 'collapse', flex: '1', marginLeft: '10px' }}>
//                         <tbody>
//                           <tr><td style={{ padding: '4px' }}><strong>CLASS :</strong> {r.class}</td></tr>
//                           <tr><td style={{ padding: '4px' }}><strong>ROLL NO.:</strong> {student.rollNo || "N/A"}</td></tr>
//                           <tr><td style={{ padding: '4px' }}><strong>ADM. NO. :</strong> {student.admissionNo || "N/A"}</td></tr>
//                         </tbody>
//                       </table>
//                     </div>

//                     {/* Scholastic Areas */}
//                     <div style={{ marginTop: '10px' }}>
//                       <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '14px' }}>SCHOLASTIC AREAS</h4>
//                       <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '10px' }}>
//                         <thead>
//                           <tr>
//                             <th rowSpan="2" style={{ border: '1px solid #000', padding: '4px' }}>SUBJECT</th>
//                             <th colSpan="4" style={{ border: '1px solid #000', padding: '4px' }}>TERM I</th>
//                           </tr>
//                           <tr>
//                             <th style={{ border: '1px solid #000', padding: '4px' }}>PA (10)</th>
//                             <th style={{ border: '1px solid #000', padding: '4px' }}>NOTE BOOK (5)</th>
//                             <th style={{ border: '1px solid #000', padding: '4px' }}>SUB ENRICHMENT (5)</th>
//                             <th style={{ border: '1px solid #000', padding: '4px' }}>HALF YEARLY (80)</th>
//                             <th style={{ border: '1px solid #000', padding: '4px' }}>TOTAL</th>
//                             <th style={{ border: '1px solid #000', padding: '4px' }}>GRADE</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {subjectsArray.map((sub) => {
//                             const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
//                             const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
//                             const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
//                             const term1 = (pa1 / 2) + (pa2 / 2) + sa1;
//                             const grade = getGrade(term1, r.class);

//                             // For simplicity, we're using PA as PA1/2, Note Book and Sub Enrichment as 5 each.
//                             const paValue = (pa1 + pa2) / 4; // This is an assumption. Adjust as needed.
//                             const noteBookValue = 5; // Placeholder
//                             const subEnrichmentValue = 5; // Placeholder
//                             const halfYearlyValue = sa1;
//                             const totalValue = paValue + noteBookValue + subEnrichmentValue + halfYearlyValue;

//                             return (
//                               <tr key={sub}>
//                                 <td style={{ border: '1px solid #000', padding: '4px' }}>{sub}</td>
//                                 <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{paValue.toFixed(2)}</td>
//                                 <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{noteBookValue}</td>
//                                 <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{subEnrichmentValue}</td>
//                                 <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{halfYearlyValue}</td>
//                                 <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{totalValue.toFixed(2)}</td>
//                                 <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{grade}</td>
//                               </tr>
//                             );
//                           })}
//                           {/* General Knowledge row */}
//                           <tr>
//                             <td style={{ border: '1px solid #000', padding: '4px' }}>General Knowledge</td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>A</td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>D</td>
//                           </tr>
//                         </tbody>
//                         <tfoot>
//                           <tr>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}><strong>Total</strong></td>
//                             <td colSpan="4" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}><strong>{totalFinal}</strong></td>
//                             <td style={{ border: '1px solid #000', padding: '4px' }}></td>
//                           </tr>
//                           <tr>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}><strong>Percentage</strong></td>
//                             <td colSpan="4" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}><strong>{percentageFinal}%</strong></td>
//                             <td style={{ border: '1px solid #000', padding: '4px' }}></td>
//                           </tr>
//                           <tr>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}><strong>Overall Grade</strong></td>
//                             <td colSpan="4" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}><strong>{overallGradeFinal}</strong></td>
//                             <td style={{ border: '1px solid #000', padding: '4px' }}></td>
//                           </tr>
//                           <tr>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}><strong>Attendance</strong></td>
//                             <td colSpan="4" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}></td>
//                             <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}><strong>{attendanceDisplay}</strong></td>
//                             <td style={{ border: '1px solid #000', padding: '4px' }}></td>
//                           </tr>
//                         </tfoot>
//                       </table>
//                     </div>

//                     {/* Co-Scholastic Areas and Graphs */}
//                     <div style={{ display: 'flex', marginTop: '10px' }}>
//                       <div style={{ flex: '1', marginRight: '10px' }}>
//                         <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '14px' }}>CO-SCHOLASTIC AREAS</h4>
//                         <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '10px' }}>
//                           <thead>
//                             <tr>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>TERM-I</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             <tr><td style={{ border: '1px solid #000', padding: '4px' }}>Work Education</td><td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>B</td></tr>
//                             <tr><td style={{ border: '1px solid #000', padding: '4px' }}>Art Education</td><td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>A</td></tr>
//                             <tr><td style={{ border: '1px solid #000', padding: '4px' }}>Health & Physical Education</td><td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>A</td></tr>
//                             <tr><td style={{ border: '1px solid #000', padding: '4px' }}>Discipline</td><td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>B</td></tr>
//                           </tbody>
//                         </table>
//                       </div>
//                       <div style={{ flex: '1', marginLeft: '10px' }}>
//                         <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '14px' }}>Subject wise Performance</h4>
//                         <ResponsiveContainer width="100%" height={200}>
//                           <BarChart
//                             data={subjectsArray.map(sub => ({
//                               subject: sub,
//                               marks: parseFloat(getFinalTotal(sub)),
//                               topper: 85 // Placeholder for topper's score
//                             }))}
//                             margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
//                           >
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis dataKey="subject" angle={-45} textAnchor="end" interval={0} height={40} />
//                             <YAxis domain={[0, 100]} />
//                             <Tooltip />
//                             <Legend />
//                             <Bar dataKey="marks" fill="#000000" name="Pragya Priyadarshi" />
//                             <Bar dataKey="topper" fill="#8884d8" name="Topper" />
//                           </BarChart>
//                         </ResponsiveContainer>
//                       </div>
//                     </div>

//                     {/* Grading Scales */}
//                     <div style={{ display: 'flex', marginTop: '10px' }}>
//                       <div style={{ flex: '1', marginRight: '10px' }}>
//                         <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '12px' }}>Grading Scale for Co-Scholastic Areas</h4>
//                         <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '10px' }}>
//                           <tbody>
//                             <tr><td style={{ border: '1px solid #000', padding: '4px' }}>A: Outstanding</td><td style={{ border: '1px solid #000', padding: '4px' }}>B: Very Good</td><td style={{ border: '1px solid #000', padding: '4px' }}>C: Fair</td><td style={{ border: '1px solid #000', padding: '4px' }}>D: Satisfactory</td><td style={{ border: '1px solid #000', padding: '4px' }}>E: Unsatisfactory</td></tr>
//                           </tbody>
//                         </table>
//                       </div>
//                       <div style={{ flex: '1', marginLeft: '10px' }}>
//                         <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '12px' }}>Grading Scale for Scholastic Areas</h4>
//                         <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '10px' }}>
//                           <thead>
//                             <tr>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>Grade</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>A1</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>A2</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>B1</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>B2</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>C1</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>C2</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>D</th>
//                               <th style={{ border: '1px solid #000', padding: '4px' }}>E</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             <tr>
//                               <td style={{ border: '1px solid #000', padding: '4px' }}>Marks Range</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>91-100</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>81-90</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>71-80</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>61-70</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>51-60</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>41-50</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>33-40</td>
//                               <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>32 & Below</td>
//                             </tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>

//                     {/* Remarks */}
//                     <div style={{ marginTop: '10px', border: '1px solid #000', padding: '5px' }}>
//                       <strong>REMARKS:</strong> SHOWS INTEREST IN LEARNING BUT NEEDS CONSISTENT GUIDANCE AND REASSURANCE.
//                     </div>

//                     {/* Attendance Pie Chart and Signatures */}
//                     <div style={{ display: 'flex', marginTop: '10px' }}>
//                       <div style={{ flex: '1', marginRight: '10px' }}>
//                         <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '12px' }}>ATTENDANCE</h4>
//                         <ResponsiveContainer width="100%" height={150}>
//                           <PieChart>
//                             <Pie
//                               data={[
//                                 { name: "Present", value: att?.present || 0 },
//                                 { name: "Absent", value: (att?.total || 0) - (att?.present || 0) }
//                               ]}
//                               cx="50%"
//                               cy="50%"
//                               labelLine={false}
//                               label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                               outerRadius={60}
//                               fill="#8884d8"
//                               dataKey="value"
//                             >
//                               <Cell fill="#27ae60" />
//                               <Cell fill="#e74c3c" />
//                             </Pie>
//                             <Tooltip />
//                             <Legend />
//                           </PieChart>
//                         </ResponsiveContainer>
//                       </div>
//                       <div style={{ flex: '1', marginLeft: '10px' }}>
//                         <div style={{ height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
//                           <div style={{ textAlign: 'center' }}>
//                             <div style={{ height: '40px', border: '1px solid #000', marginBottom: '5px' }}></div>
//                             Class Teacher
//                           </div>
//                           <div style={{ textAlign: 'center' }}>
//                             <div style={{ height: '40px', border: '1px solid #000', marginBottom: '5px' }}></div>
//                             Principal
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Date of Issue */}
//                     <div style={{ marginTop: '10px', textAlign: 'left', fontSize: '10px' }}>
//                       <strong>DATE OF ISSUE :</strong> 11-10-2025
//                     </div>
//                   </div>
//                 )}

//                 <div className="action-buttons">
//                   <button onClick={() => downloadReportCard(r._id, student.name, selectedExamType)}>
//                     📥 Download PDF
//                   </button>
//                   <button onClick={() => printReportCard(r._id, selectedExamType)}>
//                     🖨️ Print
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ✅ NEW: Periodic Assessment (PA1–PA4) Summary Tables - FIXED */}
//       {filteredResults.length > 0 && (
//         <div style={{ marginTop: "2.5rem", paddingTop: "2rem", borderTop: "2px solid #e0e0e0" }}>
//           <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '1.5rem', fontSize: '1.6rem' }}>
//             Periodic Assessments (PA1 - PA4)
//           </h2>
//           {['pa1', 'pa2', 'pa3', 'pa4'].map((paKey) => {
//             const paLabel = paKey === 'pa1' ? 'PA I' : 
//                            paKey === 'pa2' ? 'PA II' : 
//                            paKey === 'pa3' ? 'PA III' : 'PA IV';
//             return (
//               <div 
//                 key={paKey} 
//                 id={`pa-section-${paKey}`} 
//                 style={{ marginBottom: '2.5rem', pageBreakInside: 'avoid' }}
//               >
//                 <h3 style={{ 
//                   backgroundColor: '#e8f4f8', 
//                   padding: '0.7rem', 
//                   borderRadius: '8px', 
//                   color: '#2980b9',
//                   marginBottom: '1.2rem',
//                   fontSize: '1.3rem'
//                 }}>
//                   {paLabel} Report ({paKey.toUpperCase()})
//                 </h3>
//                 {classOptions.map((cls) => {
//                   const classStudents = filteredResults.filter(r => r.class === cls);
//                   if (classStudents.length === 0) return null;
//                   const subjects = classSubjectMap[cls] || [];
//                   return (
//                     <div 
//                       key={`${paKey}-${cls}`} 
//                       id={`pa-section-${paKey}-${cls}`} 
//                       style={{ marginBottom: '1.8rem', pageBreakInside: 'avoid' }}
//                     >
//                       <h4 style={{ 
//                         color: '#2c3e50', 
//                         borderBottom: '1px solid #ccc', 
//                         paddingBottom: '0.5rem',
//                         marginBottom: '1rem',
//                         fontSize: '1.15rem'
//                       }}>
//                         Class: {cls}
//                       </h4>
//                       <div className="table-container">
//                         <table className="marks-table">
//                           <thead>
//                             <tr>
//                               <th>Roll No</th>
//                               <th>Student Name</th>
//                               {subjects.map(sub => (
//                                 <th key={`${paKey}-${cls}-${sub}`}>{sub}</th>
//                               ))}
//                               <th>Total / {20 * subjects.length}</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {classStudents.map((r) => {
//                               const student = getStudentFromRecord(r);
//                               if (!student) return null;
//                               const examData = r.exams || {};
//                               const marks = subjects.map(sub => 
//                                 examData[paKey]?.[sub] !== undefined ? examData[paKey][sub] : 0
//                               );
//                               const total = marks.reduce((sum, m) => sum + m, 0);
//                               const max = subjects.length * 20;
//                               return (
//                                 <tr key={`${paKey}-${r._id || 'no-id'}`}>
//                                   <td>{student.rollNo || "—"}</td>
//                                   <td>{student.name || "Unknown"}</td>
//                                   {marks.map((mark, idx) => (
//                                     <td key={idx}>{mark}</td>
//                                   ))}
//                                   <td><strong>{total} / {max}</strong></td>
//                                 </tr>
//                               );
//                             })}
//                           </tbody>
//                         </table>
//                       </div>
//                       <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
//                         <button
//                           onClick={() => printSinglePAClass(paKey, cls)}
//                           style={{
//                             padding: '0.35rem 0.9rem',
//                             backgroundColor: '#27ae60',
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '5px',
//                             fontSize: '0.8rem',
//                             cursor: 'pointer'
//                           }}
//                         >
//                           🖨️ Print Class {cls}
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//                 {/* ✅ Print button for THIS PA only */}
//                 <div style={{ textAlign: 'center', marginTop: '1rem' }}>
//                   <button
//                     onClick={() => printSinglePA(paKey)}
//                     style={{
//                       padding: '0.4rem 1rem',
//                       backgroundColor: '#3498db',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '5px',
//                       fontSize: '0.85rem',
//                       cursor: 'pointer'
//                     }}
//                   >
//                     🖨️ Print {paLabel} Report
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewResult;

// src/pages/teacher/ViewResult.jsx
import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import Logo from "../../assets/logo.png";
import { endpoints } from "../../config/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const ViewResult = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedExamType, setSelectedExamType] = useState("halfYearly");
  const [attendanceData, setAttendanceData] = useState({});
  const [classSubjectMap, setClassSubjectMap] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setError("Unauthorized");
    
    fetch(endpoints.auth.me, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setAssignedClasses(data.assignedClasses || []))
      .catch((err) => console.error("Error fetching teacher info:", err));

    fetch(endpoints.marks.list, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load results");
        return res.json();
      })
      .then((data) => {
        setResults(Array.isArray(data) ? data : []);
        setFilteredResults(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching results:", err);
        setError("Failed to load results.");
        setLoading(false);
      });

    fetch(endpoints.classSubjects.getAll, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load class-subject mapping");
      })
      .then((mapping) => setClassSubjectMap(mapping))
      .catch((err) => console.error("Error fetching class-subject mapping:", err));
  }, []);

  useEffect(() => {
    if (filteredResults.length === 0) return;
    const token = localStorage.getItem("token");
    const fetchAttendance = async () => {
      const attMap = {};
      for (const r of filteredResults) {
        const studentId = r.studentId?._id || r.studentId;
        if (!studentId) continue;
        try {
          const res = await fetch(endpoints.attendance.studentTotal(studentId), {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            attMap[studentId] = {
              present: data.totalPresentDays,
              total: data.totalSchoolDays,
              percentage: data.percentage
            };
          }
        } catch (err) {
          console.error("Failed to load attendance for", studentId);
        }
      }
      setAttendanceData(attMap);
    };
    fetchAttendance();
  }, [filteredResults]);

  useEffect(() => {
    let filtered = results;
    if (assignedClasses.length > 0) {
      filtered = filtered.filter((r) => assignedClasses.includes(r.class));
    }
    if (searchTerm) {
      filtered = filtered.filter((r) =>
        r.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedClass) {
      filtered = filtered.filter((r) => r.class === selectedClass);
    }
    setFilteredResults(filtered);
  }, [searchTerm, selectedClass, results, assignedClasses]);

  if (loading) return <h3 style={{ textAlign: "center", padding: "2rem" }}>Loading results...</h3>;
  if (error) return <h3 style={{ textAlign: "center", color: "red", padding: "2rem" }}>{error}</h3>;

  const classOptions = [...new Set(filteredResults.map((r) => r.class))];

  const getGrade = (marks, className) => {
    const cls = String(className || "").toLowerCase().trim();
    if (["nursery", "lkg", "ukg", "play", "i", "ii", "iii", "iv", "v"].includes(cls)) {
      if (marks >= 90) return "Outstanding";
      if (marks >= 75) return "Very Good";
      if (marks >= 56) return "Good";
      if (marks >= 35) return "Needs Improvement";
      return "Poor";
    }
    if (marks >= 91) return "A1";
    if (marks >= 81) return "A2";
    if (marks >= 71) return "B1";
    if (marks >= 61) return "B2";
    if (marks >= 51) return "C1";
    if (marks >= 41) return "C2";
    if (marks >= 33) return "D";
    return "E";
  };

  const downloadReportCard = (studentId, name, examType) => {
    const element = document.getElementById(`report-card-${studentId}-${examType}`);
    if (!element) return;
    const logo = element.querySelector('img');
    const originalWidth = logo?.style.width || '60px';
    const originalHeight = logo?.style.height || 'auto';
    if (logo) {
      logo.style.width = '60px';
      logo.style.height = 'auto';
    }
    const opt = {
      margin: 0.4,
      filename: `${name.replace(/\s+/g, "_")}_${examType === "halfYearly" ? "HalfYearly" : "Annual"}_ReportCard.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .finally(() => {
        if (logo) {
          logo.style.width = originalWidth;
          logo.style.height = originalHeight;
        }
      });
  };

  const printReportCard = (studentId, examType) => {
    const element = document.getElementById(`report-card-${studentId}-${examType}`);
    if (!element) return;
    const clone = element.cloneNode(true);
    const logo = clone.querySelector('img');
    if (logo) {
      logo.style.width = '60px';
      logo.style.height = 'auto';
    }
    const printContent = clone.innerHTML;
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html>
        <head>
          <title>Report Card</title>
          <style>
            body {
              font-family: Poppins, sans-serif;
              padding: 15px;
              font-size: 12px;
            }
            .shakti-header {
              background-color: #FFD700 !important;
              padding: 10px 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .shakti-header img {
              width: 60px;
              height: auto;
            }
            h1 { margin: 0; font-size: 24px; font-weight: bold; }
            h3 { text-align: center; margin: 10px 0; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th, td { border: 1px solid #000; padding: 4px; text-align: center; }
            @media print {
              body { padding: 0; }
              .shakti-header img { width: 60px !important; }
            }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  const getStudentFromRecord = (record) => {
    if (!record.studentId) return null;
    if (typeof record.studentId === 'object' && record.studentId !== null) {
      return record.studentId;
    }
    return null;
  };

  return (
    <div className="view-result-container">
      <style>{`
        .view-result-container {
          padding: 1rem;
          background: #f9f9f9;
          font-family: 'Poppins', sans-serif;
        }
        h2 {
          text-align: center;
          color: #2c3e50;
          margin: 1rem 0;
          font-size: 1.6rem;
        }
        .filters {
          display: flex;
          gap: 0.8rem;
          justify-content: center;
          flex-wrap: wrap;
          margin: 1rem 0;
        }
        .filters input,
        .filters select {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 0.95rem;
          min-width: 160px;
        }
        .report-cards-grid {
          display: grid;
          gap: 1.5rem;
          margin-top: 1.2rem;
        }
        .report-card {
          background: #fff;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
        .shakti-header {
          background-color: #FFD700;
          padding: 10px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #000;
        }
        .shakti-header img {
          width: 60px;
          height: auto;
          margin: 0 10px;
        }
        .shakti-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        .shakti-header p {
          margin: 0;
          font-size: 10px;
          color: #000;
        }
        .table-container {
          overflow-x: auto;
          width: 100%;
          margin: 10px 0;
        }
        .marks-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        .marks-table th,
        .marks-table td {
          padding: 4px;
          border: 1px solid #000;
          text-align: center;
        }
        .action-buttons {
          margin-top: 12px;
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .action-buttons button {
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background: #3498db;
          color: white;
        }
        .action-buttons button:hover {
          background: #2980b9;
        }
      `}</style>

      <h2>Student Marks Record</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Search by Student Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">All Classes</option>
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
        <select value={selectedExamType} onChange={(e) => setSelectedExamType(e.target.value)}>
          <option value="halfYearly">Half Yearly Report</option>
          <option value="final">Annual Report Card</option>
        </select>
      </div>

      {filteredResults.length === 0 ? (
        <p style={{ textAlign: "center", color: "#7f8c8d", padding: "1.5rem" }}>No matching results found.</p>
      ) : (
        <div className="report-cards-grid">
          {filteredResults.map((r) => {
            const student = getStudentFromRecord(r);
            if (!student || !r.class) return null;

            const studentId = student._id || r.studentId;
            const examData = r.exams || {};
            const subjectsArray = classSubjectMap[r.class] || [];
            const att = attendanceData[studentId];
            const attendanceDisplay = att
              ? `${att.present} / ${att.total} (${att.percentage}%)`
              : student.attendance
                ? `${student.attendance} / 115`
                : "—";

            const getTerm1Total = (sub) => {
              const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
              const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
              const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
              return ((pa1 / 2) + (pa2 / 2) + sa1).toFixed(1);
            };

            const getFinalTotal = (sub) => {
              const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
              const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
              const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
              const pa3 = Math.min(examData.pa3?.[sub] || 0, 20);
              const pa4 = Math.min(examData.pa4?.[sub] || 0, 20);
              const sa2 = Math.min(examData.final?.[sub] || 0, 80);
              const term1 = (pa1 / 2) + (pa2 / 2) + sa1;
              const term2Component = pa3 + pa4 + sa2;
              return ((term1 / 2) + (term2Component / 2)).toFixed(1);
            };

            const totalFinal = subjectsArray.reduce((sum, sub) => sum + parseFloat(getFinalTotal(sub)), 0).toFixed(1);
            const percentageFinal = ((totalFinal / (subjectsArray.length * 100)) * 100).toFixed(2);
            const overallGradeFinal = getGrade(totalFinal, r.class);

            return (
              <div key={`${r._id}-${selectedExamType}`} className="report-card">
                {selectedExamType === "halfYearly" && (
                  <div id={`report-card-${r._id}-halfYearly`}>
                    {/* School Header */}
                    <div className="shakti-header">
                      <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                        <img src={Logo} alt="Shakti Shanti Academy Logo" style={{ width: '60px', height: 'auto', marginRight: '10px' }} />
                        <div>
                          <h1>SHAKTI SHANTI ACADEMY</h1>
                          <p>Ambika Sthan, Ami, Saran (Bihar) - 841207</p>
                          <p>Affiliated to CBSE, Bharat (Up to 10+2) Level</p>
                          <p>E-mail:- ssa.ami1998@gmail.com, Web:- www.ssaami.ac.in</p>
                        </div>
                      </div>
                      <div style={{ marginRight: '20px' }}>
                        <img src={Logo} alt="Right Logo" style={{ width: '60px', height: 'auto' }} />
                      </div>
                    </div>

                    <h3 style={{ textAlign: 'center', margin: '10px 0', fontSize: '16px' }}>PROGRESS REPORT (2025-26)</h3>

                    {/* Student Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <table style={{ border: '1px solid #000', borderCollapse: 'collapse', flex: '1', marginRight: '10px' }}>
                        <tbody>
                          <tr><td><strong>NAME:</strong> {student.name}</td></tr>
                          <tr><td><strong>FATHER:</strong> {student.fatherName || "N/A"}</td></tr>
                          <tr><td><strong>MOTHER:</strong> {student.motherName || "N/A"}</td></tr>
                          <tr><td><strong>DOB:</strong> {student.dob || "N/A"}</td></tr>
                        </tbody>
                      </table>
                      <div style={{ width: '80px', height: '80px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '10px' }}>Photo</span>
                      </div>
                      <table style={{ border: '1px solid #000', borderCollapse: 'collapse', flex: '1', marginLeft: '10px' }}>
                        <tbody>
                          <tr><td><strong>CLASS:</strong> {r.class}</td></tr>
                          <tr><td><strong>ROLL NO.:</strong> {student.rollNo || "N/A"}</td></tr>
                          <tr><td><strong>ADM. NO.:</strong> {student.admissionNo || "N/A"}</td></tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Marks Table */}
                    <div style={{ marginTop: '10px' }}>
                      <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '14px' }}>SCHOLASTIC AREAS</h4>
                      <table className="marks-table">
                        <thead>
                          <tr>
                            <th>SUBJECT</th>
                            <th>PA I (20)</th>
                            <th>PA II (20)</th>
                            <th>SA I (80)</th>
                            <th>TOTAL (100)</th>
                            <th>GRADE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectsArray.map((sub) => {
                            const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
                            const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
                            const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
                            const total = parseFloat(getTerm1Total(sub));
                            const grade = getGrade(total, r.class);
                            return (
                              <tr key={sub}>
                                <td>{sub}</td>
                                <td>{pa1}</td>
                                <td>{pa2}</td>
                                <td>{sa1}</td>
                                <td>{total}</td>
                                <td>{grade}</td>
                              </tr>
                            );
                          })}
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'right' }}><strong>Total / Percentage / Grade</strong></td>
                            <td><strong>{subjectsArray.reduce((sum, sub) => sum + parseFloat(getTerm1Total(sub)), 0).toFixed(1)}</strong></td>
                            <td><strong>{getGrade(subjectsArray.reduce((sum, sub) => sum + parseFloat(getTerm1Total(sub)), 0), r.class)}</strong></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Attendance Pie Chart + Signatures */}
                    <div style={{ display: 'flex', marginTop: '15px' }}>
                      <div style={{ flex: '1', marginRight: '10px' }}>
                        <h4 style={{ textAlign: 'center', fontSize: '12px' }}>ATTENDANCE</h4>
                        <ResponsiveContainer width="100%" height={150}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Present", value: att?.present || 0 },
                                { name: "Absent", value: (att?.total || 0) - (att?.present || 0) }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={60}
                              dataKey="value"
                            >
                              <Cell fill="#27ae60" />
                              <Cell fill="#e74c3c" />
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ flex: '1', marginLeft: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ height: '40px', borderBottom: '1px solid #000' }}></div>
                          <div>Class Teacher</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ height: '40px', borderBottom: '1px solid #000' }}></div>
                          <div>Principal</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', textAlign: 'left', fontSize: '10px' }}>
                      <strong>DATE OF ISSUE:</strong> 11-10-2025
                    </div>
                  </div>
                )}

                {selectedExamType === "final" && (
                  <div id={`report-card-${r._id}-final`}>
                    {/* School Header */}
                    <div className="shakti-header">
                      <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                        <img src={Logo} alt="Shakti Shanti Academy Logo" style={{ width: '60px', height: 'auto', marginRight: '10px' }} />
                        <div>
                          <h1>SHAKTI SHANTI ACADEMY</h1>
                          <p>Ambika Sthan, Ami, Saran (Bihar) - 841207</p>
                          <p>Affiliated to CBSE, Bharat (Up to 10+2) Level</p>
                          <p>E-mail:- ssa.ami1998@gmail.com, Web:- www.ssaami.ac.in</p>
                        </div>
                      </div>
                      <div style={{ marginRight: '20px' }}>
                        <img src={Logo} alt="Right Logo" style={{ width: '60px', height: 'auto' }} />
                      </div>
                    </div>

                    <h3 style={{ textAlign: 'center', margin: '10px 0', fontSize: '16px' }}>PROGRESS REPORT (2025-26)</h3>

                    {/* Student Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <table style={{ border: '1px solid #000', borderCollapse: 'collapse', flex: '1', marginRight: '10px' }}>
                        <tbody>
                          <tr><td><strong>NAME:</strong> {student.name}</td></tr>
                          <tr><td><strong>FATHER:</strong> {student.fatherName || "N/A"}</td></tr>
                          <tr><td><strong>MOTHER:</strong> {student.motherName || "N/A"}</td></tr>
                          <tr><td><strong>DOB:</strong> {student.dob || "N/A"}</td></tr>
                        </tbody>
                      </table>
                      <div style={{ width: '80px', height: '80px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '10px' }}>Photo</span>
                      </div>
                      <table style={{ border: '1px solid #000', borderCollapse: 'collapse', flex: '1', marginLeft: '10px' }}>
                        <tbody>
                          <tr><td><strong>CLASS:</strong> {r.class}</td></tr>
                          <tr><td><strong>ROLL NO.:</strong> {student.rollNo || "N/A"}</td></tr>
                          <tr><td><strong>ADM. NO.:</strong> {student.admissionNo || "N/A"}</td></tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Marks Table */}
                    <div style={{ marginTop: '10px' }}>
                      <h4 style={{ textAlign: 'center', margin: '5px 0', fontSize: '14px' }}>SCHOLASTIC AREAS</h4>
                      <table className="marks-table">
                        <thead>
                          <tr>
                            <th>SUBJECT</th>
                            <th>PA I (20)</th>
                            <th>PA II (20)</th>
                            <th>SA I (80)</th>
                            <th>PA III (20)</th>
                            <th>PA IV (20)</th>
                            <th>SA II (80)</th>
                            <th>FINAL (100)</th>
                            <th>GRADE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectsArray.map((sub) => {
                            const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
                            const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
                            const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
                            const pa3 = Math.min(examData.pa3?.[sub] || 0, 20);
                            const pa4 = Math.min(examData.pa4?.[sub] || 0, 20);
                            const sa2 = Math.min(examData.final?.[sub] || 0, 80);
                            const finalTotal = parseFloat(getFinalTotal(sub));
                            const grade = getGrade(finalTotal, r.class);
                            return (
                              <tr key={sub}>
                                <td>{sub}</td>
                                <td>{pa1}</td>
                                <td>{pa2}</td>
                                <td>{sa1}</td>
                                <td>{pa3}</td>
                                <td>{pa4}</td>
                                <td>{sa2}</td>
                                <td>{finalTotal}</td>
                                <td>{grade}</td>
                              </tr>
                            );
                          })}
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'right' }}><strong>Total / Percentage / Grade</strong></td>
                            <td><strong>{totalFinal}</strong></td>
                            <td><strong>{overallGradeFinal}</strong></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Grading Scale - Scholastic Only */}
                    <div style={{ marginTop: '12px' }}>
                      <h4 style={{ textAlign: 'center', fontSize: '12px' }}>Grading Scale for Scholastic Areas</h4>
                      <table className="marks-table" style={{ fontSize: '9px' }}>
                        <thead>
                          <tr>
                            <th>Grade</th>
                            <th>A1</th>
                            <th>A2</th>
                            <th>B1</th>
                            <th>B2</th>
                            <th>C1</th>
                            <th>C2</th>
                            <th>D</th>
                            <th>E</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Marks Range</td>
                            <td>91–100</td>
                            <td>81–90</td>
                            <td>71–80</td>
                            <td>61–70</td>
                            <td>51–60</td>
                            <td>41–50</td>
                            <td>33–40</td>
                            <td>Below 33</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Attendance Pie Chart + Signatures */}
                    <div style={{ display: 'flex', marginTop: '15px' }}>
                      <div style={{ flex: '1', marginRight: '10px' }}>
                        <h4 style={{ textAlign: 'center', fontSize: '12px' }}>ATTENDANCE</h4>
                        <ResponsiveContainer width="100%" height={150}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Present", value: att?.present || 0 },
                                { name: "Absent", value: (att?.total || 0) - (att?.present || 0) }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={60}
                              dataKey="value"
                            >
                              <Cell fill="#27ae60" />
                              <Cell fill="#e74c3c" />
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ flex: '1', marginLeft: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ height: '40px', borderBottom: '1px solid #000' }}></div>
                          <div>Class Teacher</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ height: '40px', borderBottom: '1px solid #000' }}></div>
                          <div>Principal</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', textAlign: 'left', fontSize: '10px' }}>
                      <strong>DATE OF ISSUE:</strong> 11-10-2025
                    </div>
                  </div>
                )}

                <div className="action-buttons">
                  <button onClick={() => downloadReportCard(r._id, student.name, selectedExamType)}>
                    📥 Download PDF
                  </button>
                  <button onClick={() => printReportCard(r._id, selectedExamType)}>
                    🖨️ Print
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewResult;