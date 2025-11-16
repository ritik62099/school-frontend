
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

  // === RENDER REPORT CARD (works for both halfYearly & final, and both class types) ===
  // === RENDER REPORT CARD (FIXED: SA I always from halfYear, SA II from final) ===
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

  // ==================== PRIMARY CLASSES ====================
  if (isPrimary) {
    const total = pa1 + pa2 + pa2 + sa1;
    const { grade, point } = getGradePointAndGrade(total);
    return { sub, pa1, pa2, sa1, total, grade, point };
  }

  // ==================== HALF YEARLY ====================
  if (isHalfYearly) {

    const pa1Weighted = pa1 / 2; // 10%
    const pa2Weighted = pa2 / 2; // 10%
    const sa1Weighted = sa1;     // 80 marks already

    const total = pa1Weighted + pa2Weighted + sa1Weighted;

    const { grade, point } = getGradePointAndGrade(total);

    return {
      sub,
      pa1: pa1Weighted,
      pa2: pa2Weighted,
      sa1: sa1Weighted,
      total,
      grade,
      point
    };
  }

  // ==================== ANNUAL ====================
  const pa1Weighted = pa1 / 2;
  const pa2Weighted = pa2 / 2;
  const sa1Weighted = sa1;

  const pa3Weighted = pa3 / 2;
  const pa4Weighted = pa4 / 2;
  const sa2Weighted = sa2;

  // Term wise
  const term1 = pa1Weighted + pa2Weighted + sa1Weighted;
  const term2 = pa3Weighted + pa4Weighted + sa2Weighted;

  const finalTotal = (term1 + term2) / 2;

  const { grade, point } = getGradePointAndGrade(finalTotal);

  return {
    sub,
    pa1: pa1Weighted,
    pa2: pa2Weighted,
    sa1: sa1Weighted,
    pa3: pa3Weighted,
    pa4: pa4Weighted,
    sa2: sa2Weighted,
    total: finalTotal,
    grade,
    point
  };
});



    // ===== TOTAL ROW CALCULATION (Drawing ko exclude kiya gaya) =====
    let totalPA1 = 0;
    let totalPA2 = 0;
    let totalSA1 = 0;
    let totalPA3 = 0;
    let totalPA4 = 0;
    let totalSA2 = 0;
    let totalMainTotal = 0;

    subjectRows.forEach(row => {
      if (row.sub.toLowerCase() === "drawing") return; // ❌ Drawing ko skip

      totalPA1 += row.pa1 || 0;
      totalPA2 += row.pa2 || 0;
      totalSA1 += row.sa1 || 0;
      totalPA3 += row.pa3 || 0;
      totalPA4 += row.pa4 || 0;
      totalSA2 += row.sa2 || 0;
      totalMainTotal += row.total || 0;
    });


    let grandTotal = 0;
    let maxPossible = subjectsArray.length * 100;
    grandTotal = subjectRows.reduce((sum, row) => {
      if (row.sub.toLowerCase() === "drawing") return sum; // ❌ Skip Drawing
      return sum + row.total;
    }, 0);
    const percentage = ((grandTotal / maxPossible) * 100).toFixed(2);

    return (
      <>

        <div
          style={{
            border: "2px solid #000",
            padding: "6px",
            marginBottom: "10px",
            borderRadius: "6px",
            width: "100%",
            boxSizing: "border-box"
          }}
        >

          {/* TOP ROW INSIDE BORDER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12pt",
              fontWeight: "bold",
              marginBottom: "12px"
            }}
          >
            <span>Reg. No :- 21912662021926123218</span>
            <span>UDISE No :- 10170504508</span>
          </div>

          {/* LOGO + SCHOOL NAME */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              width: "100%"
            }}
          >
            <img
              src={Logo}
              alt="School Logo"
              style={{
                width: "70px",
                height: "auto",
                marginRight: "12px"
              }}
            />

            <div style={{ flexGrow: 1 }}>
              <h1
                style={{
                  fontFamily: 'Algerian, "Times New Roman", serif',
                  fontWeight: "normal",
                  fontSize: "32px",
                  margin: 0
                }}
              >
                AMBIKA INTERNATIONAL SCHOOL
              </h1>

              <p style={{ margin: 0, fontSize: "14pt" }}>
                Based on CBSE curriculum (Play to Xth)
              </p>
              <p style={{ margin: 0, fontSize: "14pt" }}>
                Saidpur, Dighwara (Saran), 841207
              </p>
              <p style={{ margin: 0, fontSize: "14pt" }}>
                Mob. 8797118188
              </p>
            </div>

          </div>

        </div>



        <div
          style={{
            border: "2px solid #000",
            padding: "6px",
            borderRadius: "6px",
            marginBottom: "15px",
            background: "#fff"
          }}
        >

          <h3
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: "16pt",
              margin: "0 auto 8px auto",
              display: "block"
            }}
          >
            {isHalfYearly ? "REPORT CARD OF S.A.I" : "ANNUAL REPORT CARD"}
          </h3>


          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              fontSize: "12pt",
              marginBottom: "10px",
              width: "100%",
            }}
          >
            <div><strong>CLASS:</strong> {r.class.toUpperCase()}</div>
            <div><strong>SECTION:</strong> A</div>
            <div><strong>SESSION:</strong> 2025-26</div>
          </div>


          <div
            style={{
              textAlign: "center",
              fontSize: "12pt",
              fontWeight: "bold",
              padding: "6px 0",
              margin: "10px 0",
              border: "2px solid #000",
              background: "#e6e6e6",
              borderRadius: "6px",
              letterSpacing: "1px"
            }}
          >
            STUDENT'S DETAIL
          </div>


          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12pt",   // Font size increased
              lineHeight: "1.6",  // Better spacing
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    width: "50%",
                    verticalAlign: "top",
                    paddingRight: "10px",
                    textAlign: "left",   // Left aligned
                    fontWeight: "500"
                  }}
                >
                  <strong>Student's Name:</strong> {student.name}<br />
                  <strong>Mother's Name:</strong> {student.motherName || "N/A"}<br />
                  <strong>Father's Name:</strong> {student.fatherName || "N/A"}<br />
                  <strong>Address:</strong> {student.address || "N/A"}
                </td>

                <td
                  style={{
                    width: "50%",
                    verticalAlign: "top",
                    paddingLeft: "10px",
                    textAlign: "left",   // Left aligned
                    fontWeight: "500"
                  }}
                >
                  <strong>Roll No:</strong> {student.rollNo || "N/A"}<br />
                  <strong>Contact No:</strong> {student.mobile || "N/A"}<br />
                  <strong>Attendance:</strong> {attendanceDisplay}
                </td>
              </tr>
            </tbody>
          </table>


        </div>

        <div
          style={{
            border: "2px solid #000",
            padding: "12px",
            borderRadius: "6px",
            marginTop: "15px",
            background: "#fff"
          }}
        >

          <h4
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: "14pt",
              margin: "0 auto 10px auto",
              display: "block",
              fontWeight: "bold",
              textDecoration: "underline"
            }}
          >
            Academic Performance : Scholastic Area (9 Point Scale)
          </h4>

          <div className="table-container" style={{ marginTop: "10px" }}>
            <table className="marks-table">
              <thead>
                <tr>
                  <th>SUBJECT</th>
                  {isPrimary ? (
                    <>
                      <th>PA I</th>
                      <th>PA II</th>
                      <th>PA II</th>
                      <th>SA I</th>
                    </>
                  ) : isHalfYearly ? (
                    <>
                      <th>PA I</th>
                      <th>PA II</th>
                      <th>SA I</th>
                    </>
                  ) : (
                    <>
                      <th>PA I</th>
                      <th>PA II</th>
                      <th>SA I</th>
                      <th>PA III</th>
                      <th>PA IV</th>
                      <th>SA II</th>
                    </>
                  )}
                  <th>TOTAL</th>
                  <th>GRADE<br />POINT</th>
                  <th>GRADE</th>
                </tr>
              </thead>

              <tbody>
                {subjectRows.map((row) => (
                  <tr key={row.sub}>
                    <td>{row.sub.toUpperCase()}</td>

                    {isPrimary ? (
                      <>
                        <td>{row.pa1}</td>
                        <td>{row.pa2}</td>
                        <td>{row.pa2}</td>
                        <td>{row.sa1}</td>
                      </>
                    ) : isHalfYearly ? (
                      <>
                        <td>{row.pa1}</td>
                        <td>{row.pa2}</td>
                        <td>{row.sa1}</td>
                      </>
                    ) : (
                      <>
                        <td>{row.pa1}</td>
                        <td>{row.pa2}</td>
                        <td>{row.sa1}</td>
                        <td>{row.pa3}</td>
                        <td>{row.pa4}</td>
                        <td>{row.sa2}</td>
                      </>
                    )}

                    <td>{typeof row.total === "number" ? row.total.toFixed(1) : row.total}</td>
                    <td>{row.point}</td>
                    <td>{row.grade}</td>
                  </tr>
                ))}

                {isPrimary && (
                  <tr>
                    <td>DRAWING</td>
                    <td colSpan="8">B</td>
                  </tr>
                )}

                {/* ===== TOTAL ROW (Drawing removed) ===== */}
                <tr style={{ fontWeight: "bold", background: "#f0f0f0" }}>
                  <td>TOTAL</td>

                  {isPrimary ? (
                    <>
                      <td>{totalPA1}</td>
                      <td>{totalPA2}</td>
                      <td>{totalPA2}</td>
                      <td>{totalSA1}</td>
                    </>
                  ) : isHalfYearly ? (
                    <>
                      <td>{totalPA1}</td>
                      <td>{totalPA2}</td>
                      <td>{totalSA1}</td>
                    </>
                  ) : (
                    <>
                      <td>{totalPA1}</td>
                      <td>{totalPA2}</td>
                      <td>{totalSA1}</td>
                      <td>{totalPA3}</td>
                      <td>{totalPA4}</td>
                      <td>{totalSA2}</td>
                    </>
                  )}

                  <td>{totalMainTotal.toFixed(1)}</td>
                  <td>—</td>
                  <td>—</td>
                </tr>

              </tbody>
            </table>
          </div>

        </div>

        {/* Combined Section: Grading Scale | Notes | Signature */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "15px",
          fontSize: "10pt",
          gap: "10px",
          flexWrap: "wrap" // for small screens
        }}>
          {/* Column 1: Grading Scale */}
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

          {/* Column 2: Notes */}

          {/* Column 2: Notes + Result Box Together */}
          <div style={{
            flex: "1 1 55%",
            minWidth: "300px",
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.4
          }}>

            {/* Notes Section */}
            <div>
              Students are assessed according to the following :-<br /> Promotion is based on the day-to-day work of the student<br /> Throughout the year and also on the performance in the half<br /> Yearly/Summative examination.<br />
              First Term : PAⅠ(10%)+PAII(10%)+SAI(80%) =100%<br />
              {!isHalfYearly && "Second Term : PAIII(10%)+PAIV(10%)+SAII(80%) =100%"}<br />
              {!isHalfYearly && "Final Result : 50% of 1st Term + 50% of 2nd Term =100%"} </div>

            {/* Row: Principal Left + Result Box Right */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: "25px",
              width: "100%"
            }}>

              {/* LEFT SIDE : Principal Signature */}
              <div style={{ fontSize: "10pt", display: "flex" ,gap: "20px",marginTop: "10px"}}>
                <div style={{ marginBottom: "40px" }}>
                  Class Teacher Sig._________
                </div>
                Principal Sig.__________
              </div>

              {/* RIGHT SIDE : RESULT BOX */}
              <div style={{
                border: "1px solid black",
                padding: "3px",
                width: "140px",
                fontSize: "10pt",
                height: "fit-content"
              }}>

                <div style={{ borderBottom: "1px solid black", padding: "4px 0" }}>
                  <strong>Total obtain<br />marks</strong>
                  <div style={{ textAlign: "right" }}>{grandTotal}</div>
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