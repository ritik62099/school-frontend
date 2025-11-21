
// src/pages/teacher/ViewResult.jsx
import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import Logo from "../../assets/logo.png";
import { endpoints } from "../../config/api";


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
  const [searchRoll, setSearchRoll] = useState("");
  const [searchMobile, setSearchMobile] = useState("");

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

    // Only classes assigned to teacher
    if (assignedClasses.length > 0) {
      filtered = filtered.filter((r) => assignedClasses.includes(r.class));
    }

    // Name Search
    if (searchTerm) {
      filtered = filtered.filter((r) =>
        r.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Roll Search
    if (searchRoll) {
      filtered = filtered.filter((r) =>
        String(r.studentId?.rollNo || "").includes(searchRoll)
      );
    }

    // Mobile Search
    if (searchMobile) {
      filtered = filtered.filter((r) =>
        String(r.studentId?.mobile || "").includes(searchMobile)
      );
    }

    // Class Filter
    if (selectedClass) {
      filtered = filtered.filter((r) => r.class === selectedClass);
    }

    setFilteredResults(filtered);
  }, [searchTerm, searchRoll, searchMobile, selectedClass, results, assignedClasses]);


  if (loading) return <h3 style={{ textAlign: "center", padding: "2rem" }}>Loading results...</h3>;
  if (error) return <h3 style={{ textAlign: "center", color: "red", padding: "2rem" }}>{error}</h3>;

  const classOptions = [...new Set(filteredResults.map((r) => r.class))];

  const isPrimaryClass = (className) => {
    const lower = String(className || "").toLowerCase().trim();
    return ["nursery", "lkg", "ukg", "play"].includes(lower);
  };

  const getGradePointAndGrade = (marks) => {
    if (marks >= 91) return { grade: "A1", point: "10.0" };
    if (marks >= 81) return { grade: "A2", point: "09.0" };
    if (marks >= 71) return { grade: "B1", point: "08.0" };
    if (marks >= 61) return { grade: "B2", point: "07.0" };
    if (marks >= 51) return { grade: "C1", point: "06.0" };
    if (marks >= 41) return { grade: "C2", point: "05.0" };
    if (marks >= 33) return { grade: "D", point: "04.0" };
    if (marks >= 21) return { grade: "E1", point: "" };
    return { grade: "E2", point: "" };
  };

  const downloadReportCard = (studentId, name, examType) => {
    const element = document.getElementById(`report-card-${studentId}-${examType}`);
    if (!element) return;

    const logo = element.querySelector('img');
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

    html2pdf().from(element).set(opt).save();
  };



  const printReportCard = (studentId, examType) => {
    const element = document.getElementById(`report-card-${studentId}-${examType}`);
    if (!element) return;

    const clone = element.cloneNode(true);
    const logo = clone.querySelector('img');
    if (logo) {
      logo.style.width = '100px';
      logo.style.height = 'auto';

    }

    const printWin = window.open('', '_blank');

    printWin.document.write(`
  <html>
    <head>
      <title>Report Card</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 0;
        }

        html, body {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
        }

        .print-page {
          height: 297mm;
          width: 210mm;
          padding: 12mm;
          box-sizing: border-box;
          overflow: hidden;
        }

        .report-border-wrapper {
          border: 5px double #000 !important;
          padding: 12px !important;
          border-radius: 6px !important;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #000;
          padding: 4px;
          text-align: center;
        }

        .vertical-header {
  writing-mode: vertical-lr;
  text-orientation: mixed;
  white-space: nowrap;
  padding: 6px 2px;
  min-width: 30px;
  text-align: center;
  font-weight: bold;
  font-size: 0.75rem;
}
      </style>
    </head>
    <body>
      <div class="print-page">
        ${clone.outerHTML}
      </div>
    </body>
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


 
//   const renderReportCard = (r, student, examData, subjectsArray, attendanceDisplay, examType) => {
//   const isPrimary = isPrimaryClass(r.class);
//   const isHalfYearly = examType === "halfYearly";

//   const subjectRows = subjectsArray.map(sub => {
//     const pa1 = examData.pa1?.[sub] || 0;
//     const pa2 = examData.pa2?.[sub] || 0;
//     const sa1 = examData.halfYear?.[sub] || 0;

//     const pa3 = examData.pa3?.[sub] || 0;
//     const pa4 = examData.pa4?.[sub] || 0;
//     const sa2 = examData.final?.[sub] || 0;

//     if (isPrimary) {
//       const total = pa1 + pa2 + pa2 + sa1;
//       const { grade, point } = getGradePointAndGrade(total);
//       return { sub, pa1, pa2, sa1, total, grade, point, isDrawing: sub.toLowerCase() === "drawing" };
//     }

//     if (isHalfYearly) {
//       const term1 = (pa1 / 2) + (pa2 / 2) + sa1;
//       const { grade, point } = getGradePointAndGrade(term1);
//       return {
//         sub,
//         pa1: pa1 / 2,
//         pa2: pa2 / 2,
//         sa1,
//         term1,
//         term1Grade: grade,
//         term1Point: point,
//         finalTotal: term1,
//         grade,
//         point,
//         isDrawing: sub.toLowerCase() === "drawing"
//       };
//     }

//     // Annual: Term-wise grades
//     const term1 = (pa1 / 2) + (pa2 / 2) + sa1;
//     const term2 = (pa3 / 2) + (pa4 / 2) + sa2;
//     const finalTotal = (term1 + term2) / 2;

//     const { grade: g1, point: p1 } = getGradePointAndGrade(term1);
//     const { grade: g2, point: p2 } = getGradePointAndGrade(term2);
//     const { grade: gf, point: pf } = getGradePointAndGrade(finalTotal);

//     return {
//       sub,
//       pa1: pa1 / 2,
//       pa2: pa2 / 2,
//       sa1,
//       pa3: pa3 / 2,
//       pa4: pa4 / 2,
//       sa2,
//       term1,
//       term2,
//       finalTotal,
//       term1Grade: g1,
//       term1Point: p1,
//       term2Grade: g2,
//       term2Point: p2,
//       finalGrade: gf,
//       finalPoint: pf,
//       isDrawing: sub.toLowerCase() === "drawing"
//     };
//   });

//   // Totals (exclude Drawing)
//   let sumT1 = 0, sumT2 = 0, sumF = 0, n = 0;
//   subjectRows.forEach(r => {
//     if (r.isDrawing) return;
//     n++;
//     if (isPrimary) {
//       sumF += r.total || 0;
//     } else {
//       sumT1 += r.term1 || 0;
//       sumT2 += r.term2 || 0;
//       sumF += r.finalTotal || 0;
//     }
//   });

//   const avgT1 = n ? sumT1 / n : 0;
//   const avgT2 = n ? sumT2 / n : 0;
//   const avgF = n ? sumF / n : 0;
//   const percentage = avgF.toFixed(2);

//   return (
//     <>
//       {/* School Header */}
//       <div style={{ border: "2px solid #000", padding: "6px", marginBottom: "10px", borderRadius: "6px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12pt", fontWeight: "bold", marginBottom: "12px" }}>
//           <span>Reg. No :- 21912662021926123218</span>
//           <span>UDISE No :- 10170504508</span>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
//           <img src={Logo} alt="Logo" style={{ width: "70px", height: "auto", marginRight: "12px" }} />
//           <div>
//             <h1 style={{ fontFamily: 'Algerian, "Times New Roman", serif', fontWeight: "normal", fontSize: "32px", margin: 0 }}>
//               AMBIKA INTERNATIONAL SCHOOL
//             </h1>
//             <p style={{ margin: 0, fontSize: "14pt" }}>Based on CBSE curriculum (Play to Xth)</p>
//             <p style={{ margin: 0, fontSize: "14pt" }}>Saidpur, Dighwara (Saran), 841207</p>
//             <p style={{ margin: 0, fontSize: "14pt" }}>Mob. 8797118188</p>
//           </div>
//         </div>
//       </div>

//       {/* Student Details */}
//       <div style={{ border: "2px solid #000", padding: "6px", borderRadius: "6px", marginBottom: "15px", background: "#fff" }}>
//         <h3 style={{ textAlign: "center", fontSize: "16pt", margin: "0 auto 8px" }}>
//           {isHalfYearly ? "REPORT CARD OF S.A.I" : "ANNUAL REPORT CARD"}
//         </h3>
//         <div style={{ display: "flex", justifyContent: "space-around", fontSize: "12pt", marginBottom: "10px" }}>
//           <div><strong>CLASS:</strong> {r.class.toUpperCase()}</div>
//           <div><strong>SECTION:</strong> A</div>
//           <div><strong>SESSION:</strong> 2025-26</div>
//         </div>
//         <div style={{ textAlign: "center", fontSize: "12pt", fontWeight: "bold", padding: "6px 0", margin: "10px 0", border: "2px solid #000", background: "#e6e6e6", borderRadius: "6px" }}>
//           STUDENT'S DETAIL
//         </div>
//         <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12pt", lineHeight: "1.6" }}>
//           <tbody>
//             <tr>
//               <td style={{ width: "50%", verticalAlign: "top", paddingRight: "10px", textAlign: "left", fontWeight: "500" }}>
//                 <strong>Student's Name:</strong> {student.name}<br />
//                 <strong>Mother's Name:</strong> {student.motherName || "N/A"}<br />
//                 <strong>Father's Name:</strong> {student.fatherName || "N/A"}<br />
//                 <strong>Address:</strong> {student.address || "N/A"}
//               </td>
//               <td style={{ width: "50%", verticalAlign: "top", paddingLeft: "10px", textAlign: "left", fontWeight: "500" }}>
//                 <strong>Roll No:</strong> {student.rollNo || "N/A"}<br />
//                 <strong>Attendance:</strong> {attendanceDisplay}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* Marks Table */}
//       <div style={{ border: "2px solid #000", padding: "12px", borderRadius: "6px", marginTop: "15px", background: "#fff" }}>
//         <h4 style={{ textAlign: "center", fontSize: "14pt", margin: "0 auto 10px", fontWeight: "bold", textDecoration: "underline" }}>
//           Academic Performance : Scholastic Area (9 Point Scale)
//         </h4>
//         <div className="table-container" style={{ marginTop: "10px" }}>
//           <table className="marks-table">
//             <thead>
//               {isPrimary ? (
//                 <tr>
//                   <th>SUBJECT</th>
//                   <th>PA I</th>
//                   <th>PA II</th>
//                   <th>PA II</th>
//                   <th>SA I</th>
//                   <th>TOTAL</th>
//                   <th>GRADE POINT</th>
//                   <th>GRADE</th>
//                 </tr>
//               ) : isHalfYearly ? (
//                 <tr>
//                   <th>SUBJECT</th>
//                   <th>PA I</th>
//                   <th>PA II</th>
//                   <th>SA I</th>
//                   <th>TOTAL</th>
//                   <th>GRADE POINT</th>
//                   <th>GRADE</th>
//                 </tr>
//               ) : (
//                 <>
//                   <tr>
//                     <th rowSpan={2}>SUBJECT</th>
//                     <th colSpan={5}>First Term (SA I)</th>
//                     <th colSpan={5}>Second Term (SA II)</th>
//                     <th rowSpan={2}>Final<br />(100)</th>
//                     <th rowSpan={2}>Grade<br />Point</th>
//                     <th rowSpan={2}>Grade</th>
//                   </tr>
//                   <tr>
//                     <th>PA I</th>
//                     <th>PA II</th>
//                     <th>SA I</th>
//                     <th>TOTAL</th>
//                     <th>GRADE</th>
//                     <th>PA III</th>
//                     <th>PA IV</th>
//                     <th>SA II</th>
//                     <th>TOTAL</th>
//                     <th>GRADE</th>
//                   </tr>
//                 </>
//               )}
//             </thead>
//             <tbody>
//               {subjectRows.map(row => (
//                 <tr key={row.sub}>
//                   <td>{row.sub.toUpperCase()}</td>
//                   {isPrimary ? (
//                     <>
//                       <td>{row.pa1}</td>
//                       <td>{row.pa2}</td>
//                       <td>{row.pa2}</td>
//                       <td>{row.sa1}</td>
//                       <td>{typeof row.total === "number" ? row.total.toFixed(1) : row.total}</td>
//                       <td>{row.point}</td>
//                       <td>{row.grade}</td>
//                     </>
//                   ) : isHalfYearly ? (
//                     <>
//                       <td>{row.pa1.toFixed(1)}</td>
//                       <td>{row.pa2.toFixed(1)}</td>
//                       <td>{row.sa1.toFixed(1)}</td>
//                       <td>{row.term1.toFixed(1)}</td>
//                       <td>{row.term1Point}</td>
//                       <td>{row.term1Grade}</td>
//                     </>
//                   ) : (
//                     <>
//                       <td>{row.pa1.toFixed(1)}</td>
//                       <td>{row.pa2.toFixed(1)}</td>
//                       <td>{row.sa1.toFixed(1)}</td>
//                       <td>{row.term1.toFixed(1)}</td>
//                       <td>{row.term1Grade}</td> {/* ✅ Term 1 Grade */}

//                       <td>{row.pa3.toFixed(1)}</td>
//                       <td>{row.pa4.toFixed(1)}</td>
//                       <td>{row.sa2.toFixed(1)}</td>
//                       <td>{row.term2.toFixed(1)}</td>
//                       <td>{row.term2Grade}</td> {/* ✅ Term 2 Grade */}

//                       <td>{row.finalTotal.toFixed(1)}</td>
//                       <td>{row.finalPoint}</td>
//                       <td>{row.finalGrade}</td>
//                     </>
//                   )}
//                 </tr>
//               ))}

//               {/* Total Row */}
//               <tr style={{ fontWeight: "bold", background: "#f0f0f0" }}>
//                 <td>TOTAL (Avg)</td>
//                 {isPrimary ? (
//                   <td colSpan="6" style={{ textAlign: "center" }}>{avgF.toFixed(1)}</td>
//                 ) : isHalfYearly ? (
//                   <>
//                     <td colSpan="3"></td>
//                     <td>{avgT1.toFixed(1)}</td>
//                     <td>—</td>
//                     <td>—</td>
//                   </>
//                 ) : (
//                   <>
//                     <td colSpan="3"></td>
//                     <td>{avgT1.toFixed(1)}</td>
//                     <td>—</td>

//                     <td colSpan="3"></td>
//                     <td>{avgT2.toFixed(1)}</td>
//                     <td>—</td>

//                     <td>{avgF.toFixed(1)}</td>
//                     <td>—</td>
//                     <td>—</td>
//                   </>
//                 )}
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Footer */}
//       <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", fontSize: "10pt", gap: "10px", flexWrap: "wrap" }}>
//         <div style={{ flex: "1 1 30%", minWidth: "180px" }}>
//           <table className="marks-table" style={{ width: "100%", fontSize: "9pt" }}>
//             <thead><tr><th>MARKS RANGE</th><th>GRADE</th><th>GRADE POINT</th></tr></thead>
//             <tbody>
//               <tr><td>91-100</td><td>A1</td><td>10.0</td></tr>
//               <tr><td>81-90</td><td>A2</td><td>09.0</td></tr>
//               <tr><td>71-80</td><td>B1</td><td>08.0</td></tr>
//               <tr><td>61-70</td><td>B2</td><td>07.0</td></tr>
//               <tr><td>51-60</td><td>C1</td><td>06.0</td></tr>
//               <tr><td>41-50</td><td>C2</td><td>05.0</td></tr>
//               <tr><td>33-40</td><td>D</td><td>04.0</td></tr>
//               <tr><td>21-32</td><td>E1</td><td></td></tr>
//               <tr><td>00-20</td><td>E2</td><td></td></tr>
//             </tbody>
//           </table>
//         </div>

//         <div style={{ flex: "1 1 55%", minWidth: "300px", display: "flex", flexDirection: "column", lineHeight: 1.4 }}>
//           <div>
//             Students are assessed according to the following :-<br />
//             Promotion is based on the day-to-day work of the student<br />
//             Throughout the year and also on the performance in the half<br />
//             Yearly/Summative examination.<br />
//             {isHalfYearly ? (
//               "First Term: PAⅠ(10%) + PAⅡ(10%) + SAⅠ(80%) = 100%"
//             ) : (
//               <>
//                 First Term: PAⅠ(10%) + PAⅡ(10%) + SAⅠ(80%) = 100%<br />
//                 Second Term: PAⅢ(10%) + PAⅣ(10%) + SAⅡ(80%) = 100%<br />
//                 Final Result: (First Term + Second Term) ÷ 2 = 100%
//               </>
//             )}
//           </div>

//           <div style={{ display: "flex", justifyContent: "space-between", marginTop: "25px", width: "100%" }}>
//             <div style={{ fontSize: "10pt", display: "flex", gap: "20px", marginTop: "10px" }}>
//               <div>Class Teacher Sig._________</div>
//               <div>Principal Sig.__________</div>
//             </div>
//             <div style={{ border: "1px solid black", padding: "3px", width: "140px", fontSize: "10pt" }}>
//               <div style={{ borderBottom: "1px solid black", padding: "4px 0" }}>
//                 <strong>Final Avg<br />Marks</strong>
//                 <div style={{ textAlign: "right" }}>{avgF.toFixed(1)}</div>
//               </div>
//               <div style={{ borderBottom: "1px solid black", padding: "4px 0" }}>
//                 <strong>Percentage</strong>
//                 <div style={{ textAlign: "right" }}>{percentage}%</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

const renderReportCard = (r, student, examData, subjectsArray, attendanceDisplay, examType) => {
  const isPrimary = isPrimaryClass(r.class);
  const isHalfYearly = examType === "halfYearly";

  const subjectRows = subjectsArray.map(sub => {
    const pa1 = examData.pa1?.[sub] || 0;
    const pa2 = examData.pa2?.[sub] || 0;
    const sa1 = examData.halfYear?.[sub] || 0;

    const pa3 = examData.pa3?.[sub] || 0;
    const pa4 = examData.pa4?.[sub] || 0;
    const sa2 = examData.final?.[sub] || 0;

    if (isPrimary) {
      const total = pa1 + pa2 + pa2 + sa1;
      const { grade, point } = getGradePointAndGrade(total);
      return { sub, pa1, pa2, sa1, total, grade, point, isDrawing: sub.toLowerCase() === "drawing" };
    }

    if (isHalfYearly) {
      const term1 = (pa1 / 2) + (pa2 / 2) + sa1;
      const { grade, point } = getGradePointAndGrade(term1);
      return {
        sub,
        pa1: pa1 / 2,
        pa2: pa2 / 2,
        sa1,
        term1,
        term1Grade: grade,
        term1Point: point,
        finalTotal: term1,
        grade,
        point,
        isDrawing: sub.toLowerCase() === "drawing"
      };
    }

    // Annual: Both terms with individual grades
    const term1 = (pa1 / 2) + (pa2 / 2) + sa1;
    const term2 = (pa3 / 2) + (pa4 / 2) + sa2;
    const finalTotal = (term1 + term2) / 2;

    const { grade: g1, point: p1 } = getGradePointAndGrade(term1);
    const { grade: g2, point: p2 } = getGradePointAndGrade(term2);
    const { grade: gf, point: pf } = getGradePointAndGrade(finalTotal);

    return {
      sub,
      pa1: pa1 / 2,
      pa2: pa2 / 2,
      sa1,
      pa3: pa3 / 2,
      pa4: pa4 / 2,
      sa2,
      term1,
      term2,
      finalTotal,
      term1Grade: g1,
      term1Point: p1,
      term2Grade: g2,
      term2Point: p2,
      finalGrade: gf,
      finalPoint: pf,
      isDrawing: sub.toLowerCase() === "drawing"
    };
  });

  // Totals (exclude Drawing)
  let sumT1 = 0, sumT2 = 0, sumF = 0, n = 0;
  subjectRows.forEach(row => {
    if (row.isDrawing) return;
    n++;
    if (isPrimary) {
      sumF += row.total || 0;
    } else {
      sumT1 += row.term1 || 0;
      sumT2 += row.term2 || 0;
      sumF += row.finalTotal || 0;
    }
  });

  const avgT1 = n ? sumT1 / n : 0;
  const avgT2 = n ? sumT2 / n : 0;
  const avgF = n ? sumF / n : 0;
  const percentage = avgF.toFixed(2);

  return (
    <>
      {/* School Header */}
      <div style={{ border: "2px solid #000", padding: "6px", marginBottom: "10px", borderRadius: "6px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12pt", fontWeight: "bold", marginBottom: "12px" }}>
          <span>Reg. No :- 21912662021926123218</span>
          <span>UDISE No :- 10170504508</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%" }}>
          <img src={Logo} alt="School Logo" style={{ width: "70px", height: "auto", marginRight: "12px" }} />
          <div style={{ flexGrow: 1 }}>
            <h1 style={{ fontFamily: 'Algerian, "Times New Roman", serif', fontWeight: "normal", fontSize: "32px", margin: 0 }}>
              AMBIKA INTERNATIONAL SCHOOL
            </h1>
            <p style={{ margin: 0, fontSize: "14pt" }}>Based on CBSE curriculum (Play to Xth)</p>
            <p style={{ margin: 0, fontSize: "14pt" }}>Saidpur, Dighwara (Saran), 841207</p>
            <p style={{ margin: 0, fontSize: "14pt" }}>Mob. 8797118188</p>
          </div>
        </div>
      </div>

      {/* Student Details */}
      <div style={{ border: "2px solid #000", padding: "6px", borderRadius: "6px", marginBottom: "15px", background: "#fff" }}>
        <h3 style={{ width: "100%", textAlign: "center", fontSize: "16pt", margin: "0 auto 8px auto" }}>
          {isHalfYearly ? "REPORT CARD OF S.A.I" : "ANNUAL REPORT CARD"}
        </h3>
        <div style={{ display: "flex", justifyContent: "space-around", fontSize: "12pt", marginBottom: "10px", width: "100%" }}>
          <div><strong>CLASS:</strong> {r.class.toUpperCase()}</div>
          <div><strong>SECTION:</strong> A</div>
          <div><strong>SESSION:</strong> 2025-26</div>
        </div>
        <div style={{
          textAlign: "center",
          fontSize: "12pt",
          fontWeight: "bold",
          padding: "6px 0",
          margin: "10px 0",
          border: "2px solid #000",
          background: "#e6e6e6",
          borderRadius: "6px",
          letterSpacing: "1px"
        }}>
          STUDENT'S DETAIL
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12pt", lineHeight: "1.6" }}>
          <tbody>
            <tr>
              <td style={{ width: "50%", verticalAlign: "top", paddingRight: "10px", textAlign: "left", fontWeight: "500" }}>
                <strong>Student's Name:</strong> {student.name}<br />
                <strong>Mother's Name:</strong> {student.motherName || "N/A"}<br />
                <strong>Father's Name:</strong> {student.fatherName || "N/A"}<br />
                <strong>Address:</strong> {student.address || "N/A"}
              </td>
              <td style={{ width: "50%", verticalAlign: "top", paddingLeft: "10px", textAlign: "left", fontWeight: "500" }}>
                <strong>Roll No:</strong> {student.rollNo || "N/A"}<br />
                <strong>Attendance:</strong> {attendanceDisplay}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Marks Table */}
      <div style={{ border: "2px solid #000", padding: "12px", borderRadius: "6px", marginTop: "15px", background: "#fff" }}>
        <h4 style={{
          width: "100%",
          textAlign: "center",
          fontSize: "14pt",
          margin: "0 auto 10px auto",
          display: "block",
          fontWeight: "bold",
          textDecoration: "underline"
        }}>
          Academic Performance : Scholastic Area (9 Point Scale)
        </h4>

        <div className="table-container" style={{ marginTop: "10px" }}>
          <table className="marks-table">
            <thead>
              {isPrimary ? (
                <tr>
                  <th>SUBJECT</th>
                  <th>PA I</th>
                  <th>PA II</th>
                  <th>PA II</th>
                  <th>SA I</th>
                  <th>TOTAL</th>
                  <th>GRADE POINT</th>
                  <th>GRADE</th>
                </tr>
              ) : isHalfYearly ? (
                <tr>
                  <th>SUBJECT</th>
                  <th>PA I</th>
                  <th>PA II</th>
                  <th>SA I</th>
                  <th>TOTAL</th>
                  <th>GRADE POINT</th>
                  <th>GRADE</th>
                </tr>
              ) : (
                <>
                  <tr>
                    <th rowSpan={2}>SUBJECT</th>
                    <th colSpan={5}>First Term (SA I)</th>
                    <th colSpan={5}>Second Term (SA II)</th>
                    <th rowSpan={2}>
                      <div className="vertical-header">Final (100)</div>
                    </th>
                    <th rowSpan={2}>
                      <div className="vertical-header">Grade Point</div>
                    </th>
                    <th rowSpan={2}>
                      <div className="vertical-header">Grade</div>
                    </th>
                  </tr>
                  <tr>
                    <th>PA I</th>
                    <th>PA II</th>
                    <th>SA I</th>
                    <th>
                      <div className="vertical-header">TOTAL</div>
                    </th>
                    <th>
                      <div className="vertical-header">GRADE</div>
                    </th>
                    <th>PA III</th>
                    <th>PA IV</th>
                    <th>SA II</th>
                    <th>
                      <div className="vertical-header">TOTAL</div>
                    </th>
                    <th>
                      <div className="vertical-header">GRADE</div>
                    </th>
                  </tr>
                </>
              )}
            </thead>

            <tbody>
              {subjectRows.map(row => (
                <tr key={row.sub}>
                  <td>{row.sub.toUpperCase()}</td>

                  {isPrimary ? (
                    <>
                      <td>{row.pa1}</td>
                      <td>{row.pa2}</td>
                      <td>{row.pa2}</td>
                      <td>{row.sa1}</td>
                      <td>{typeof row.total === "number" ? row.total.toFixed(1) : row.total}</td>
                      <td>{row.point}</td>
                      <td>{row.grade}</td>
                    </>
                  ) : isHalfYearly ? (
                    <>
                      <td>{row.pa1.toFixed(1)}</td>
                      <td>{row.pa2.toFixed(1)}</td>
                      <td>{row.sa1.toFixed(1)}</td>
                      <td>{row.term1.toFixed(1)}</td>
                      <td>{row.term1Point}</td>
                      <td>{row.term1Grade}</td>
                    </>
                  ) : (
                    <>
                      <td>{row.pa1.toFixed(1)}</td>
                      <td>{row.pa2.toFixed(1)}</td>
                      <td>{row.sa1.toFixed(1)}</td>
                      <td>{row.term1.toFixed(1)}</td>
                      <td>{row.term1Grade}</td>

                      <td>{row.pa3.toFixed(1)}</td>
                      <td>{row.pa4.toFixed(1)}</td>
                      <td>{row.sa2.toFixed(1)}</td>
                      <td>{row.term2.toFixed(1)}</td>
                      <td>{row.term2Grade}</td>

                      <td>{row.finalTotal.toFixed(1)}</td>
                      <td>{row.finalPoint}</td>
                      <td>{row.finalGrade}</td>
                    </>
                  )}
                </tr>
              ))}

              {/* Total Row */}
              <tr style={{ fontWeight: "bold", background: "#f0f0f0" }}>
                <td>TOTAL (Avg)</td>
                {isPrimary ? (
                  <td colSpan="6" style={{ textAlign: "center" }}>{avgF.toFixed(1)}</td>
                ) : isHalfYearly ? (
                  <>
                    <td colSpan="3"></td>
                    <td>{avgT1.toFixed(1)}</td>
                    <td>—</td>
                    <td>—</td>
                  </>
                ) : (
                  <>
                    <td colSpan="3"></td>
                    <td>{avgT1.toFixed(1)}</td>
                    <td>—</td>
                    <td colSpan="3"></td>
                    <td>{avgT2.toFixed(1)}</td>
                    <td>—</td>
                    <td>{avgF.toFixed(1)}</td>
                    <td>—</td>
                    <td>—</td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer: Grading Scale + Notes + Signature */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "15px",
        fontSize: "10pt",
        gap: "10px",
        flexWrap: "wrap"
      }}>
        <div style={{ flex: "1 1 30%", minWidth: "180px" }}>
          <table className="marks-table" style={{ width: "100%", fontSize: "9pt" }}>
            <thead>
              <tr>
                <th>MARKS RANGE</th>
                <th>GRADE</th>
                <th>GRADE POINT</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>91-100</td><td>A1</td><td>10.0</td></tr>
              <tr><td>81-90</td><td>A2</td><td>09.0</td></tr>
              <tr><td>71-80</td><td>B1</td><td>08.0</td></tr>
              <tr><td>61-70</td><td>B2</td><td>07.0</td></tr>
              <tr><td>51-60</td><td>C1</td><td>06.0</td></tr>
              <tr><td>41-50</td><td>C2</td><td>05.0</td></tr>
              <tr><td>33-40</td><td>D</td><td>04.0</td></tr>
              <tr><td>21-32</td><td>E1</td><td></td></tr>
              <tr><td>00-20</td><td>E2</td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div style={{
          flex: "1 1 55%",
          minWidth: "300px",
          display: "flex",
          flexDirection: "column",
          lineHeight: 1.4
        }}>
          <div>
            Students are assessed according to the following :-<br />
            Promotion is based on the day-to-day work of the student<br />
            Throughout the year and also on the performance in the half<br />
            Yearly/Summative examination.<br />
            {isHalfYearly ? (
              "First Term: PAⅠ(10%) + PAⅡ(10%) + SAⅠ(80%) = 100%"
            ) : (
              <>
                First Term: PAⅠ(10%) + PAⅡ(10%) + SAⅠ(80%) = 100%<br />
                Second Term: PAⅢ(10%) + PAⅣ(10%) + SAⅡ(80%) = 100%<br />
                Final Result: (First Term + Second Term) ÷ 2 = 100%
              </>
            )}
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginTop: "25px",
            width: "100%"
          }}>
            <div style={{ fontSize: "10pt", display: "flex", gap: "20px", marginTop: "10px" }}>
              <div>Class Teacher Sig._________</div>
              <div>Principal Sig.__________</div>
            </div>
            <div style={{
              border: "1px solid black",
              padding: "3px",
              width: "140px",
              fontSize: "10pt"
            }}>
              <div style={{ borderBottom: "1px solid black", padding: "4px 0" }}>
                <strong>Final Avg<br />Marks</strong>
                <div style={{ textAlign: "right" }}>{avgF.toFixed(1)}</div>
              </div>
              <div style={{ borderBottom: "1px solid black", padding: "4px 0" }}>
                <strong>Percentage</strong>
                <div style={{ textAlign: "right" }}>{percentage}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
  return (
    <div className="view-result-container">
      <style>{`
        .view-result-container {
          padding: 1rem;
          background: #f9f9f9;
          font-family: "Times New Roman", serif;
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
        .header {
          display: flex;
          align-items: center;
          border-bottom: 2px solid #000;
          margin-bottom: 10px;
        }
        .header img {
          width: 60px;
          height: auto;
          margin-right: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 1.3rem;
        }
        .header p {
          margin: 0;
          font-size: 0.9rem;
          color: #555;
        }
        .table-container {
          overflow-x: auto;
          width: 100%;
          margin: 10px 0;
        }
        .marks-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
        }
        .marks-table th,
        .marks-table td {
          padding: 6px 4px;
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
          .report-border-wrapper {
  border: 5px double #000;
  padding: 12px;
  border-radius: 6px;
  background: #fff;
}

.vertical-header {
  writing-mode: vertical-lr;
  text-orientation: mixed;
  white-space: nowrap;
  padding: 6px 2px;
  min-width: 30px;
  text-align: center;
  font-weight: bold;
  font-size: 0.75rem;
}


        @media print {
  
          body { background: white !important; }
          .report-border-wrapper {
    border: 5px double #000 !important;
   
  }
    
        }
      `}</style>

      <h2>Student Marks Record</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Search Student Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <input
          type="number"
          placeholder="🔍 Search Roll No"
          value={searchRoll}
          onChange={(e) => setSearchRoll(e.target.value)}
        />

        <input
          type="text"
          placeholder="🔍 Search Mobile No"
          value={searchMobile}
          onChange={(e) => setSearchMobile(e.target.value)}
        />

        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">All Classes</option>
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
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

            return (
              <div key={`${r._id}-${selectedExamType}`} className="report-card">
                <div
                  id={`report-card-${r._id}-${selectedExamType}`}
                  className="report-border-wrapper"
                >

                  {renderReportCard(r, student, examData, subjectsArray, attendanceDisplay, selectedExamType)}
                </div>

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