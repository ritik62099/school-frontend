// // src/pages/admin/AdmitCards.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { endpoints } from '../../config/api'; 
// import Logo from '../../assets/logo.png';
// import { useStudents } from '../../hooks/useStudents';

// const AdmitCards = () => {
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [selectedClass, setSelectedClass] = useState('');
//   const [logoBase64, setLogoBase64] = useState('');
//   const [logoLoaded, setLogoLoaded] = useState(false);
//   const [backendClasses, setBackendClasses] = useState([]);
//   const navigate = useNavigate();

//   const [session, setSession] = useState('2025-2026');
//   const [examDates, setExamDates] = useState('15 Nov 2025 – 25 Nov 2025');
//   const [validityNote, setValidityNote] = useState('This admit card is valid for S.A I 2025-26');

//   const { students, loading, error } = useStudents(); 

//   const classOptions = useMemo(() => {
//     const studentClasses = [...new Set(students.map(s => s.class).filter(Boolean))];
//     return backendClasses
//       .filter(cls => studentClasses.includes(cls))
//       .sort((a, b) => {
//         const order = ["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th",
//                        "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
//         return (order.indexOf(a) - order.indexOf(b)) || a.localeCompare(b);
//       });
//   }, [students, backendClasses]);

//   useEffect(() => {
//     if (!selectedClass) {
//       setFilteredStudents(students);
//     } else {
//       setFilteredStudents(students.filter(s => s.class === selectedClass));
//     }
//   }, [selectedClass, students]);

//   useEffect(() => {
//     const convertLogoToBase64 = async () => {
//       try {
//         const response = await fetch(Logo);
//         const blob = await response.blob();
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           setLogoBase64(reader.result);
//           setLogoLoaded(true);
//         };
//         reader.readAsDataURL(blob);
//       } catch (err) {
//         console.error("Error loading logo:", err);
//         setLogoLoaded(true); // Allow UI to proceed, but logo will be missing
//       }
//     };
//     convertLogoToBase64();
//   }, []);

//   useEffect(() => {
//     const fetchClasses = async () => {
//       const token = localStorage.getItem('token');
//       if (!token) return;

//       try {
//         const res = await fetch(endpoints.classes.list, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (res.ok) {
//           const classes = await res.json();
//           setBackendClasses(classes);
//         }
//       } catch (err) {
//         console.error('Failed to load classes', err);
//       }
//     };
//     fetchClasses();
//   }, []);

//   // ✅ FIXED: Print single card only if logo is ready
//   const printCard = (student) => {
//     if (!logoLoaded || !logoBase64) {
//       alert("School logo is still loading. Please wait a few seconds and try again.");
//       return;
//     }

//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Admit Card - ${student.name}</title>
//           <style>
//             @media print {
//               @page { size: A4; margin: 0; }
//               body { margin: 0; padding: 8mm; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: white; width: 100%; }
//               .card {
//                 width: 210mm;
//                 height: calc((297mm - 16mm) / 3);
//                 border: 1.5px solid #3498db;
//                 border-radius: 6px;
//                 padding: 6px;
//                 box-sizing: border-box;
//                 display: flex;
//                 flex-direction: column;
//                 justify-content: space-between;
//                 font-size: 10px;
//                 background: white;
//               }
//               .header { 
//                 display: flex; 
//                 align-items: center; 
//                 justify-content: center; 
//                 gap: 16px; 
//                 margin-bottom: 8px; 
//                 border-bottom: 1.5px solid #ddd; 
//                 padding-bottom: 4px; 
//               }
//               .logo { 
//                 width: 60px; 
//                 height: 50px; 
//                 object-fit: contain; 
//               }
//               .school-name { 
//                 color: #e74c3c; 
//                 font-size: 24px; 
//                 font-weight: bold; 
//                 margin: 0; 
//               }
//               .session { 
//                 color: #27ae60; 
//                 font-size: 16px; 
//                 font-weight: 600; 
//                 margin: 1px 0; 
//                 display: flex; 
//                 justify-content: center; 
//               }
//               .admit-title { 
//                 background: #34495e; 
//                 color: white; 
//                 padding: 3px 7px; 
//                 border-radius: 3px; 
//                 font-weight: bold; 
//                 display: flex; 
//                 justify-content: center; 
//                 margin: 6px 0; 
//                 font-size: 12px; 
//               }
//               .details { 
//                 text-align: left; 
//                 margin: 8px 0; 
//                 font-size: 11px; 
//                 line-height: 1.35; 
//                 flex-grow: 1; 
//               }
//               .detail-row { 
//                 display: flex; 
//                 margin-bottom: 3px; 
//               }
//               .label { 
//                 font-weight: bold; 
//                 color: #2c3e50; 
//                 min-width: 120px;
//               }
//               .note { 
//                 background: #f9f9f9; 
//                 padding: 6px; 
//                 border-left: 3px solid #e74c3c; 
//                 margin-top: auto; 
//                 font-size: 10px; 
//               }
//               .footer { 
//                 margin-top: 5px; 
//                 font-size: 9px; 
//                 color: #7f8c8d; 
//                 font-style: italic; 
//               }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="card">
//             <div class="header">
//               <img src="${logoBase64}" alt="School Logo" class="logo">
//               <div>
//                 <h2 class="school-name">AMBIKA INTERNATIONAL SCHOOL</h2>
//                 <p class="session">Saidpur, Dighwara (Saran), 841207</p>
//                 <p class="session">Session: - ${session}</p>
//               </div>
//             </div>
//             <div class="admit-title">Admit Card</div>
//             <div class="details">
//               <div class="detail-row"><span class="label">Name :</span> <span>${student.name || 'N/A'}</span></div>
//               <div class="detail-row"><span class="label">Father's Name:</span> <span>Mr. ${student.fatherName || 'N/A'}</span></div>
//               <div class="detail-row"><span class="label">Class :</span> <span>${student.class || 'N/A'}</span></div>
//               <div class="detail-row"><span class="label">Roll No :</span> <span>${student.rollNo || 'N/A'}</span></div>
//               <div class="detail-row"><span class="label">Sec :</span> <span>${student.section || 'N/A'}</span></div>
//               <div class="detail-row"><span class="label">Date of Examination :</span> <span>${examDates}</span></div>
//             </div>
//             <div class="note">
//               <strong>Note:-</strong>
//               <ul style="padding-left:15px; margin:5px 0;">
//                 <li>${validityNote}</li>
//                 <li>Those who will not have their Admit Card, they will not be allowed to sit in the examination.</li>
//               </ul>
//             </div>
//             <div class="footer">This is a computer-generated admit card. No signature required.</div>
//           </div>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//     printWindow.close();
//   };

//   // ✅ FIXED: Print all cards only if logo is ready
//   const printAllCards = () => {
//     if (!logoLoaded || !logoBase64) {
//       alert("School logo is still loading. Please wait a few seconds and try again.");
//       return;
//     }

//     const studentsToPrint = filteredStudents.length > 0 ? filteredStudents : students;
//     if (studentsToPrint.length === 0) return;

//     const printWindow = window.open('', '_blank');
//     let pagesHtml = '';

//     for (let i = 0; i < studentsToPrint.length; i += 6) {
//       const pageStudents = studentsToPrint.slice(i, i + 6);
//       const cardElements = pageStudents.map(student => `
//         <div class="card">
//           <div class="header">
//             <img src="${logoBase64}" alt="School Logo" class="logo">
//             <div>
//               <h2 class="school-name">AMBIKA INTERNATIONAL SCHOOL</h2>
//               <p class="session">Saidpur, Dighwara (Saran), 841207</p>
//               <p class="session">Session: - ${session}</p>
//             </div>
//           </div>
//           <div class="admit-title">Admit Card</div>
//           <div class="details">
//             <div class="detail-row"><span class="label">Name :</span> <span>${student.name || 'N/A'}</span></div>
//             <div class="detail-row"><span class="label">Father's Name:</span> <span>Mr. ${student.fatherName || 'N/A'}</span></div>
//             <div class="detail-row"><span class="label">Class :</span> <span>${student.class || 'N/A'}</span></div>
//             <div class="detail-row"><span class="label">Roll No :</span> <span>${student.rollNo || 'N/A'}</span></div>
//             <div class="detail-row"><span class="label">Sec :</span> <span>${student.section || 'N/A'}</span></div>
//             <div class="detail-row"><span class="label">Date of Examination :</span> <span>${examDates}</span></div>
//           </div>
//           <div class="note">
//             <strong>Note:-</strong>
//             <ul style="padding-left:12px; margin:4px 0;">
//               <li>${validityNote}</li>
//               <li>Those who will not have their Admit Card, they will not be allowed to sit in the examination.</li>
//             </ul>
//           </div>
//           <div class="footer">Computer-generated. No signature required.</div>
//         </div>
//       `).join('');

//       pagesHtml += `<div class="page">${cardElements}</div>`;
//     }

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>All Admit Cards</title>
//           <style>
//             @media print {
//               @page { 
//                 size: A4; 
//                 margin: 8mm;
//               }
//               body { 
//                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//                 background: white; 
//                 margin: 0;
//                 padding: 0;
//               }
//               .page {
//                 width: 210mm;
//                 height: 279mm;
//                 display: flex;
//                 flex-wrap: wrap;
//                 page-break-after: always;
//               }
//               .card {
//                 width: calc(50% - 2mm);
//                 height: calc((259mm - 6mm) / 3);
//                 border: 1px solid #3498db;
//                 border-radius: 4px;
//                 padding: 4px;
//                 box-sizing: border-box;
//                 font-size: 8.5px;
//                 background: white;
//                 overflow: hidden;
//                 display: flex;
//                 flex-direction: column;
//                 justify-content: space-between;
//                 margin: 1mm 1mm 2mm 1mm;
//               }
//               .header { 
//                 display: flex; 
//                 align-items: center; 
//                 justify-content: center; 
//                 gap: 6px; 
//                 margin-bottom: 3px; 
//                 border-bottom: 1px solid #ddd; 
//                 padding-bottom: 2px; 
//               }
//               .logo { 
//                 width: 45px; 
//                 height: 40px; 
//                 object-fit: contain; 
//               }
//               .school-name { 
//                 color: #e74c3c; 
//                 font-size: 18px; 
//                 font-weight: bold; 
//                 margin: 0; 
//                 text-align: center;
//               }
//               .session { 
//                 color: #27ae60; 
//                 font-size: 12px; 
//                 font-weight: 600; 
//                 margin: 1px 0; 
//                 text-align: center;
//               }
//               .admit-title { 
//                 background: #34495e; 
//                 color: white; 
//                 padding: 2px 5px;
//                 border-radius: 2px; 
//                 font-weight: bold; 
//                 text-align: center; 
//                 margin: 3px 0; 
//                 font-size: 10px; 
//               }
//               .details { 
//                 text-align: left; 
//                 margin: 4px 0; 
//                 font-size: 12px; 
//                 line-height: 1.3;
//                 flex-grow: 1;
//               }
//               .detail-row { 
//                 display: flex; 
//                 margin-bottom: 2px; 
//               }
//               .label { 
//                 font-weight: bold; 
//                 color: #2c3e50; 
//                 min-width: 65px;
//                 font-size: 8.5px;
//               }
//               .note { 
//                 background: #f9f9f9; 
//                 padding: 3px;
//                 border-left: 2px solid #e74c3c; 
//                 margin-top: auto; 
//                 font-size: 8px; 
//               }
//               .footer { 
//                 margin-top: 2px; 
//                 font-size: 9px; 
//                 color: #7f8c8d; 
//                 font-style: italic; 
//                 text-align: center;
//               }
//               ul { 
//                 margin: 2px 0; 
//                 padding-left: 12px; 
//               }
//               li { 
//                 font-size: 12px; 
//                 line-height: 1.2; 
//               }
//             }
//           </style>
//         </head>
//         <body>
//           ${pagesHtml}
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//     printWindow.close();
//   };

//   if (loading || !logoLoaded) {
//     return (
//       <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: '#7f8c8d' }}>
//         Loading admit cards...
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: '1.5rem', fontFamily: 'Poppins, Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
//       <style>{`
//         .page-title {
//           text-align: center;
//           color: #2c3e50;
//           margin-bottom: 1.5rem;
//           font-size: 1.8rem;
//           font-weight: 700;
//         }
//         .controls-section {
//           background: white;
//           padding: 1.2rem;
//           border-radius: 12px;
//           box-shadow: 0 2px 8px rgba(0,0,0,0.08);
//           margin-bottom: 1.5rem;
//         }
//         .controls-title {
//           margin-top: 0;
//           margin-bottom: 1rem;
//           color: #2c3e50;
//           font-size: 1.2rem;
//         }
//         .controls-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
//           gap: 1rem;
//         }
//         .control-group label {
//           display: block;
//           font-weight: 600;
//           font-size: 0.9rem;
//           margin-bottom: 0.4rem;
//           color: #2c3e50;
//         }
//         .control-group input {
//           width: 100%;
//           padding: 0.5rem;
//           border: 1px solid #ddd;
//           border-radius: 6px;
//           font-size: 0.95rem;
//         }
//         .filter-section {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//           flex-wrap: wrap;
//           margin-bottom: 1.5rem;
//         }
//         .filter-section label {
//           font-weight: 600;
//           color: #2c3e50;
//         }
//         .filter-section select {
//           padding: 0.5rem 0.8rem;
//           border: 1px solid #ddd;
//           border-radius: 6px;
//           font-size: 1rem;
//           min-width: 160px;
//         }
//         .button-group {
//           display: flex;
//           gap: 1rem;
//           margin-bottom: 1.5rem;
//           flex-wrap: wrap;
//         }
//         .btn {
//           padding: 0.6rem 1.2rem;
//           border: none;
//           border-radius: 8px;
//           font-weight: 600;
//           cursor: pointer;
//           font-size: 1rem;
//           transition: all 0.2s;
//         }
//         .btn-back {
//           background: #3498db;
//           color: white;
//         }
//         .btn-back:hover {
//           background: #2980b9;
//         }
//         .btn-print {
//           background: #e74c3c;
//           color: white;
//         }
//         .btn-print:disabled {
//           background: #bdc3c7;
//           cursor: not-allowed;
//         }
//         .card-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
//           gap: 1.5rem;
//         }
//         .student-card {
//           background: white;
//           border-radius: 12px;
//           padding: 1.2rem;
//           box-shadow: 0 3px 10px rgba(0,0,0,0.08);
//           text-align: center;
//           transition: transform 0.2s;
//         }
//         .student-card:hover {
//           transform: translateY(-3px);
//         }
//         .student-name {
//           font-size: 1.2rem;
//           font-weight: 700;
//           color: #2c3e50;
//           margin: 0.5rem 0;
//         }
//         .student-detail {
//           font-size: 0.95rem;
//           color: #7f8c8d;
//           margin: 0.3rem 0;
//         }
//         .print-single-btn {
//           margin-top: 1rem;
//           padding: 0.5rem 1rem;
//           background: #9b59b6;
//           color: white;
//           border: none;
//           border-radius: 6px;
//           font-weight: 600;
//           cursor: pointer;
//           width: 100%;
//         }
//         .print-single-btn:disabled {
//           background: #bdc3c7;
//           cursor: not-allowed;
//         }
//         .empty-state {
//           text-align: center;
//           color: #e74c3c;
//           padding: 2rem;
//           font-size: 1.1rem;
//         }

//         @media (max-width: 768px) {
//           .controls-grid {
//             grid-template-columns: 1fr;
//           }
//           .filter-section {
//             flex-direction: column;
//             align-items: stretch;
//           }
//           .button-group {
//             flex-direction: column;
//           }
//           .btn {
//             width: 100%;
//             justify-content: center;
//           }
//         }
//       `}</style>

//       <h2 className="page-title">Admit Cards</h2>

//       <div className="controls-section">
//         <h3 className="controls-title">Admit Card Details</h3>
//         <div className="controls-grid">
//           <div className="control-group">
//             <label>Session</label>
//             <input
//               type="text"
//               value={session}
//               onChange={(e) => setSession(e.target.value)}
//             />
//           </div>
//           <div className="control-group">
//             <label>Exam Dates</label>
//             <input
//               type="text"
//               value={examDates}
//               onChange={(e) => setExamDates(e.target.value)}
//             />
//           </div>
//           <div className="control-group">
//             <label>Validity Note</label>
//             <input
//               type="text"
//               value={validityNote}
//               onChange={(e) => setValidityNote(e.target.value)}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="filter-section">
//         <label>Filter by Class:</label>
//         <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
//           <option value="">All Classes</option>
//           {classOptions.map(cls => (
//             <option key={cls} value={cls}>{cls}</option>
//           ))}
//         </select>
//       </div>

//       <div className="button-group">
//         <button onClick={() => navigate(-1)} className="btn btn-back">
//           ← Back to Dashboard
//         </button>
//         <button
//           onClick={printAllCards}
//           disabled={filteredStudents.length === 0 || !logoLoaded || !logoBase64}
//           className="btn btn-print"
//         >
//           🖨️ Print All ({filteredStudents.length})
//         </button>
//       </div>

//       {filteredStudents.length === 0 ? (
//         <div className="empty-state">
//           No students found for the selected class.
//         </div>
//       ) : (
//         <div className="card-grid">
//           {filteredStudents.map((student) => (
//             <div key={student._id} className="student-card">
//               <div className="student-name">{student.name}</div>
//               <div className="student-detail"><strong>Class:</strong> {student.class}</div>
//               <div className="student-detail"><strong>Roll No:</strong> {student.rollNo}</div>
//               <div className="student-detail"><strong>Section:</strong> {student.section || 'N/A'}</div>
//               <button
//                 onClick={() => printCard(student)}
//                 disabled={!logoLoaded || !logoBase64}
//                 className="print-single-btn"
//               >
//                 Print Single Card
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdmitCards;

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../config/api";
import Logo from "../../assets/logo.png";
import { useStudents } from "../../hooks/useStudents";

const AdmitCards = () => {
  const navigate = useNavigate();
  const { students, loading, error } = useStudents();

  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [logoBase64, setLogoBase64] = useState("");
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [backendClasses, setBackendClasses] = useState([]);

  const [session, setSession] = useState("2025-2026");
  const [examDates, setExamDates] = useState("15 Nov 2025 – 25 Nov 2025");
  const [validityNote, setValidityNote] = useState(
    "This admit card is valid for S.A I 2025-26"
  );

  /** 🎓 Load all backend classes */
  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(endpoints.classes.list, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBackendClasses(data);
        }
      } catch (err) {
        console.error("Failed to load classes", err);
      }
    };
    fetchClasses();
  }, []);

  /** 🧠 Combine backend + student classes */
  const classOptions = useMemo(() => {
    const studentClasses = [...new Set(students.map((s) => s.class).filter(Boolean))];
    return backendClasses
      .filter((cls) => studentClasses.includes(cls))
      .sort((a, b) => {
        const order = [
          "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th",
          "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th",
        ];
        return (order.indexOf(a) - order.indexOf(b)) || a.localeCompare(b);
      });
  }, [students, backendClasses]);

  /** 🎨 Filter students by class */
  useEffect(() => {
    if (!selectedClass) setFilteredStudents(students);
    else setFilteredStudents(students.filter((s) => s.class === selectedClass));
  }, [selectedClass, students]);

  /** 🧩 Fix logo loading permanently */
  useEffect(() => {
    const cachedLogo = localStorage.getItem("schoolLogoBase64");
    if (cachedLogo) {
      setLogoBase64(cachedLogo);
      setLogoLoaded(true);
      return;
    }

    const loadLogo = () => {
      const img = new Image();
      img.src = Logo;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        localStorage.setItem("schoolLogoBase64", dataURL);
        setLogoBase64(dataURL);
        setLogoLoaded(true);
      };
      img.onerror = (e) => {
        console.error("Logo failed to load:", e);
        setLogoLoaded(true);
      };
    };
    loadLogo();
  }, []);

  /** 🖨 Print single card */
  const printCard = (student) => {
    if (!logoBase64) return alert("Logo is still loading, please wait...");
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Admit Card - ${student.name}</title>
          <style>
            body {
              font-family: "Poppins", sans-serif;
              margin: 0;
              padding: 10mm;
              background: white;
            }
            @page { size: A4; margin: 0; }
            .card {
              border: 1.5px solid #2563eb;
              border-radius: 8px;
              padding: 12px;
              width: 100%;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 16px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 8px;
            }
            .logo { width: 65px; height: 55px; object-fit: contain; }
            .school-title {
              text-align: center;
              font-size: 22px;
              font-weight: 700;
              color: #e11d48;
              margin: 0;
            }
            .sub {
              color: #1e40af;
              margin: 2px 0;
              font-weight: 500;
              text-align: center;
            }
            .admit {
              background: #1e3a8a;
              color: white;
              text-align: center;
              padding: 4px;
              border-radius: 4px;
              font-weight: 600;
              margin-top: 8px;
            }
            .info {
              font-size: 13px;
              line-height: 1.6;
              margin-top: 10px;
            }
            .note {
              margin-top: 10px;
              background: #f8fafc;
              border-left: 3px solid #ef4444;
              padding: 6px;
              font-size: 12px;
            }
            .footer {
              font-style: italic;
              color: #6b7280;
              text-align: center;
              font-size: 11px;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <img src="${logoBase64}" class="logo" alt="Logo" />
              <div>
                <h2 class="school-title">AMBIKA INTERNATIONAL SCHOOL</h2>
                <p class="sub">Saidpur, Dighwara (Saran) 841207</p>
                <p class="sub">Session: ${session}</p>
              </div>
            </div>
            <div class="admit">Admit Card</div>
            <div class="info">
              <p><strong>Name:</strong> ${student.name}</p>
              <p><strong>Father's Name:</strong> Mr. ${student.fatherName || "N/A"}</p>
              <p><strong>Class:</strong> ${student.class}</p>
              <p><strong>Roll No:</strong> ${student.rollNo}</p>
              <p><strong>Section:</strong> ${student.section || "N/A"}</p>
              <p><strong>Date of Examination:</strong> ${examDates}</p>
            </div>
            <div class="note">
              <strong>Note:</strong>
              <ul>
                <li>${validityNote}</li>
                <li>Students without admit cards will not be allowed to sit in the exam.</li>
              </ul>
            </div>
            <div class="footer">Computer generated – no signature required.</div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  /** 🖨 Print all cards */

const printAllCards = () => {
  if (!logoBase64) {
    alert("Logo not loaded yet! Please wait a few seconds.");
    return;
  }

  const studentsToPrint = filteredStudents.length ? filteredStudents : students;
  if (studentsToPrint.length === 0) return;

  const printWindow = window.open("", "_blank");
  let pageContent = "";

  // Break into groups of 6 (for each A4 page)
  for (let i = 0; i < studentsToPrint.length; i += 6) {
    const pageStudents = studentsToPrint.slice(i, i + 6);

    const cards = pageStudents
      .map(
        (student) => `
      <div class="card">
        <div class="header">
          <img src="${logoBase64}" alt="School Logo" class="logo" />
          <div class="school-info">
            <h2 class="school-name">AMBIKA INTERNATIONAL SCHOOL</h2>
            <p class="school-sub">Saidpur, Dighwara (Saran) - 841207</p>
            <p class="session">Session: ${session}</p>
          </div>
        </div>
        <div class="title">Admit Card</div>
        <div class="details">
          <p><strong>Name:</strong> ${student.name || "N/A"}</p>
          <p><strong>Father’s Name:</strong> Mr. ${student.fatherName || "N/A"}</p>
          <p><strong>Class:</strong> ${student.class || "N/A"}</p>
          <p><strong>Roll No:</strong> ${student.rollNo || "N/A"}</p>
          <p><strong>Section:</strong> ${student.section || "N/A"}</p>
          <p><strong>Date of Examination:</strong> ${examDates}</p>
        </div>
        <div class="note">
          <strong>Note:</strong>
          <ul>
            <li>${validityNote}</li>
            <li>Students without an admit card will not be allowed in the exam.</li>
          </ul>
        </div>
        <div class="footer">Computer-generated — no signature required</div>
      </div>`
      )
      .join("");

    pageContent += `<div class="page">${cards}</div>`;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Admit Cards</title>
        <style>
          @page {
            size: A4;
            margin: 8mm;
          }

          body {
            margin: 0;
            background: white;
            display: flex;
            flex-direction: column;
            font-family: "Poppins", sans-serif;
          }

          .page {
            width: 100%;
            height: 90%;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 6mm;
            page-break-after: always;
            padding: 5mm;
            box-sizing: border-box;
          }

          .card {
            border: 1.2px solid #2563eb;
            border-radius: 6px;
            padding: 6px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            font-size: 10px;
          }

          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 2px;
          }

          .logo {
            width: 45px;
            height: 40px;
            object-fit: contain;
          }

          .school-name {
            color: #dc2626;
            font-weight: 700;
            font-size: 13px;
            margin: 0;
            text-align: center;
          }

          .school-sub,
          .session {
            color: #2563eb;
            font-size: 10px;
            text-align: center;
            margin: 0;
          }

          .title {
            text-align: center;
            font-weight: 700;
            color: white;
            background: #1e3a8a;
            padding: 2px 0;
            border-radius: 3px;
            font-size: 10px;
            margin: 3px 0;
          }

          .details {
            font-size: 9px;
            line-height: 1.4;
          }

          .note {
            font-size: 8.5px;
            background: #f9fafb;
            border-left: 2px solid #ef4444;
            padding: 3px;
            margin-top: auto;
          }

          .footer {
            text-align: center;
            font-size: 8px;
            color: #6b7280;
            font-style: italic;
            margin-top: 4px;
          }

          ul {
            margin: 0;
            padding-left: 10px;
          }

          li {
            line-height: 1.2;
          }
        </style>
      </head>
      <body>${pageContent}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};


  /** 🧠 Loading / error states */
  if (loading || !logoLoaded)
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
        Loading admit cards...
      </div>
    );

  if (error)
    return (
      <div style={{ textAlign: "center", color: "red", marginTop: "2rem" }}>
        Failed to load students.
      </div>
    );

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>🎫 Admit Cards</h2>

      {/* Controls */}
      <div style={styles.controls}>
        <div>
          <label>Session</label>
          <input
            value={session}
            onChange={(e) => setSession(e.target.value)}
            style={styles.input}
          />
        </div>
        <div>
          <label>Exam Dates</label>
          <input
            value={examDates}
            onChange={(e) => setExamDates(e.target.value)}
            style={styles.input}
          />
        </div>
        <div>
          <label>Validity Note</label>
          <input
            value={validityNote}
            onChange={(e) => setValidityNote(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      {/* Filter */}
      <div style={styles.filter}>
        <label>Filter by Class:</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={styles.select}
        >
          <option value="">All Classes</option>
          {classOptions.map((cls) => (
            <option key={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div style={styles.buttons}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button
          style={styles.printBtn}
          onClick={printAllCards}
          disabled={!filteredStudents.length}
        >
          🖨️ Print All ({filteredStudents.length})
        </button>
      </div>

      {/* Cards */}
      <div style={styles.grid}>
        {filteredStudents.map((s) => (
          <div key={s._id} style={styles.card}>
            <h3 style={styles.name}>{s.name}</h3>
            <p style={styles.detail}>Class: {s.class}</p>
            <p style={styles.detail}>Roll: {s.rollNo}</p>
            <p style={styles.detail}>Section: {s.section || "N/A"}</p>
            <button
              style={styles.singleBtn}
              onClick={() => printCard(s)}
              disabled={!logoBase64}
            >
              Print Single
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: "linear-gradient(to bottom right, #e0f2fe, #f0f9ff)",
    minHeight: "100vh",
    padding: "1.5rem",
    fontFamily: "Poppins, sans-serif",
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: "1.5rem",
  },
  controls: {
    background: "white",
    padding: "1rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    marginBottom: "1.5rem",
  },
  input: {
    padding: "0.6rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    width: "100%",
  },
  filter: {
    marginBottom: "1.5rem",
  },
  select: {
    padding: "0.6rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    marginLeft: "1rem",
  },
  buttons: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  backBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem 1.2rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  printBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem 1.2rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1rem",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    padding: "1rem",
    textAlign: "center",
  },
  name: { margin: "0.3rem 0", fontWeight: "700", color: "#1e293b" },
  detail: { color: "#475569", margin: "0.2rem 0" },
  singleBtn: {
    marginTop: "0.6rem",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default AdmitCards;
