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

  // ✅ Updated: PDF with controlled logo size
  const downloadReportCard = (studentId, name, examType) => {
  const element = document.getElementById(`report-card-${studentId}-${examType}`);
  if (!element) return;

  const logo = element.querySelector('img');
  const originalWidth = logo?.style.width || logo?.width || '40px';
  const originalHeight = logo?.style.height || 'auto';

  // 👇 Set to 36px for PDF
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
  // ✅ Updated: Print with embedded print-safe CSS + small logo
 const printReportCard = (studentId, examType) => {
  const element = document.getElementById(`report-card-${studentId}-${examType}`);
  if (!element) return;

  const clone = element.cloneNode(true);
  const logo = clone.querySelector('img');
  if (logo) {
    logo.style.width = '60px'; // 👈 Updated
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
          .header {
            display: flex;
            align-items: center;
            border-bottom: 2px solid #000;
            margin-bottom: 10px;
          }
          .header img {
            width: 60px ; /* 👈 Updated */
            height: auto;
            margin-right: 10px;
          }
          h1 { font-size: 16px; margin: 0; }
          h3 { font-size: 14px; margin: 8px 0; text-align: center; }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          th, td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
            .header img { width: 36px !important; } /* 👈 Also here for safety */
          }
        </style>
      </head>
      <body>${printContent}</body>
    </html>
  `);
  printWin.document.close();
  printWin.print();
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

        @media (max-width: 768px) {
          .filters {
            flex-direction: column;
            align-items: stretch;
          }
          .filters input,
          .filters select {
            min-width: auto;
            width: 100%;
          }
          .header {
            flex-direction: column;
            text-align: center;
          }
          .header img {
            width: 32px;
            margin-bottom: 8px;
            margin-right: 0;
          }
          .marks-table {
            font-size: 0.7rem;
          }
          .marks-table th,
          .marks-table td {
            padding: 5px 3px;
          }
          h3 {
            font-size: 1.1rem;
          }
        }

        @media (max-width: 480px) {
          .view-result-container {
            padding: 0.8rem;
          }
          .report-card {
            padding: 0.8rem;
          }
          .header img {
            width: 28px;
          }
          .marks-table {
            font-size: 0.65rem;
          }
          .action-buttons button {
            padding: 0.35rem 0.7rem;
            font-size: 0.8rem;
          }
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
            if (!r.studentId) return null;
            const student = r.studentId;
            const studentId = student._id || student;
            const examData = r.exams || {};
            const subjects = new Set();
            Object.values(examData).forEach((exam) => {
              if (exam) Object.keys(exam).forEach((sub) => subjects.add(sub));
            });
            const subjectsArray = Array.from(subjects);

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
              const finalTotal = (term1 / 2) + (term2Component / 2);
              return finalTotal.toFixed(1);
            };

            const totalTerm1 = subjectsArray.reduce((sum, sub) => sum + parseFloat(getTerm1Total(sub)), 0).toFixed(1);
            const totalFinal = subjectsArray.reduce((sum, sub) => sum + parseFloat(getFinalTotal(sub)), 0).toFixed(1);
            const percentageTerm1 = ((totalTerm1 / (subjectsArray.length * 100)) * 100).toFixed(2);
            const percentageFinal = ((totalFinal / (subjectsArray.length * 100)) * 100).toFixed(2);

            return (
              <div key={`${r._id}-${selectedExamType}`} className="report-card">
                {selectedExamType === "halfYearly" && (
                  <div id={`report-card-${r._id}-halfYearly`}>
                    <div className="header">
                      <img src={Logo} alt="School Logo" />
                      <div>
                        <h1>AMBIKA INTERNATIONAL SCHOOL</h1>
                        <p>Saidpur, Dighwara (Saran), 841207</p>
                      </div>
                    </div>
                    <h3>HALF YEARLY REPORT CARD</h3>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>CLASS:</strong> {r.class} &nbsp;&nbsp;&nbsp;
                      <strong>SECTION:</strong> A &nbsp;&nbsp;&nbsp;
                      <strong>SESSION:</strong> 2025-26
                    </div>
                    <div style={{ marginBottom: "10px", border: "1px solid #ccc", padding: "5px" }}>
                      <strong>STUDENT'S DETAIL</strong><br />
                      <strong>Student's Name:</strong> {student.name} &nbsp;&nbsp;&nbsp;
                      <strong>Roll No:</strong> {student.rollNo || "N/A"}<br />
                      <strong>Mother's Name:</strong> {student.motherName || "N/A"} &nbsp;&nbsp;&nbsp;
                      <strong>Contact No:</strong> {student.phone || "N/A"}<br />
                      <strong>Father's Name:</strong> {student.fatherName || "N/A"} &nbsp;&nbsp;&nbsp;
                      <strong>Attendance:</strong> {attendanceDisplay}<br />
                      <strong>Address:</strong> {student.address || "N/A"}
                    </div>
                    <div className="table-container">
                      <table className="marks-table">
                        <thead>
                          <tr>
                            <th>SUBJECT</th>
                            <th>PA I (20)</th>
                            <th>PA II (20)</th>
                            <th>SA I (80)</th>
                            <th>TERM I TOTAL (100)</th>
                            <th>GRADE POINT</th>
                            <th>GRADE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectsArray.map((sub) => {
                            const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
                            const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
                            const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
                            const term1 = (pa1 / 2) + (pa2 / 2) + sa1;
                            const grade = getGrade(term1, r.class);
                            const gradePoint = ["A1","A2","B1","B2","C1","C2","D"].includes(grade)
                              ? (10 - ["A1","A2","B1","B2","C1","C2","D"].indexOf(grade))
                              : 0;
                            return (
                              <tr key={sub}>
                                <td>{sub}</td>
                                <td>{pa1}</td>
                                <td>{pa2}</td>
                                <td>{sa1}</td>
                                <td>{term1.toFixed(1)}</td>
                                <td>{gradePoint}</td>
                                <td>{grade}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td><strong>TOTAL</strong></td>
                            <td colSpan="3"></td>
                            <td><strong>{totalTerm1}</strong></td>
                            <td></td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div style={{ marginTop: "10px", borderTop: "1px solid #000", paddingTop: "10px" }}>
                      <strong>SCHOLASTIC AREAS (9 Point Scale)</strong>
                      <div className="table-container">
                        <table className="marks-table">
                          <thead>
                            <tr>
                              <th>MARKS RANGE</th>
                              <th>GRADE</th>
                              <th>GRADE POINT</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr><td>91-100</td><td>A1</td><td>10.0</td></tr>
                            <tr><td>81-90</td><td>A2</td><td>9.0</td></tr>
                            <tr><td>71-80</td><td>B1</td><td>8.0</td></tr>
                            <tr><td>61-70</td><td>B2</td><td>7.0</td></tr>
                            <tr><td>51-60</td><td>C1</td><td>6.0</td></tr>
                            <tr><td>41-50</td><td>C2</td><td>5.0</td></tr>
                            <tr><td>33-40</td><td>D</td><td>4.0</td></tr>
                            <tr><td>00-32</td><td>E</td><td>0.0</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "0.8rem" }}>
                      <strong>Students are assessed according to the following:</strong><br />
                      Promotion is based on the day-to-day work of the student throughout the year and also on the performance in the half yearly/summative examination.<br />
                      <strong>First Term:</strong> PA I (10%) + PA II (10%) + SA I (80%) = 100%<br />
                      <strong>Second Term:</strong> PA III (10%) + PA IV (10%) + SA II (80%) = 100%<br />
                      <strong>Final Result:</strong> 50% of 1st Term + 50% of 2nd Term = 100%
                    </div>
                    <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <div>
                        <strong>Total Obtain Marks:</strong> {totalTerm1}<br />
                        <strong>Percentage:</strong> {percentageTerm1}%
                      </div>
                      <div>
                        <strong>Class Teacher Sig:</strong> _______________<br />
                        <strong>Principal Sig:</strong> _______________
                      </div>
                    </div>
                  </div>
                )}

                {selectedExamType === "final" && (
                  <div id={`report-card-${r._id}-final`}>
                    <div className="header">
                      <img src={Logo} alt="School Logo" />
                      <div>
                        <h1>AMBIKA INTERNATIONAL SCHOOL</h1>
                        <p>Saidpur, Dighwara (Saran), 841207</p>
                      </div>
                    </div>
                    <h3>ANNUAL REPORT CARD</h3>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>CLASS:</strong> {r.class} &nbsp;&nbsp;&nbsp;
                      <strong>SECTION:</strong> A &nbsp;&nbsp;&nbsp;
                      <strong>SESSION:</strong> 2025-26
                    </div>
                    <div style={{ marginBottom: "10px", border: "1px solid #ccc", padding: "5px" }}>
                      <strong>STUDENT'S DETAIL</strong><br />
                      <strong>Student's Name:</strong> {student.name} &nbsp;&nbsp;&nbsp;
                      <strong>Roll No:</strong> {student.rollNo || "N/A"}<br />
                      <strong>Mother's Name:</strong> {student.motherName || "N/A"} &nbsp;&nbsp;&nbsp;
                      <strong>Contact No:</strong> {student.phone || "N/A"}<br />
                      <strong>Father's Name:</strong> {student.fatherName || "N/A"} &nbsp;&nbsp;&nbsp;
                      <strong>Attendance:</strong> {attendanceDisplay}<br />
                      <strong>Address:</strong> {student.address || "N/A"}
                    </div>
                    <div className="table-container">
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
                            <th>GRADE POINT</th>
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
                            const term1 = (pa1 / 2) + (pa2 / 2) + sa1;
                            const term2Component = pa3 + pa4 + sa2;
                            const finalTotal = (term1 / 2) + (term2Component / 2);
                            const grade = getGrade(finalTotal, r.class);
                            const gradePoint = ["A1","A2","B1","B2","C1","C2","D"].includes(grade)
                              ? (10 - ["A1","A2","B1","B2","C1","C2","D"].indexOf(grade))
                              : 0;
                            return (
                              <tr key={sub}>
                                <td>{sub}</td>
                                <td>{pa1}</td>
                                <td>{pa2}</td>
                                <td>{sa1}</td>
                                <td>{pa3}</td>
                                <td>{pa4}</td>
                                <td>{sa2}</td>
                                <td>{finalTotal.toFixed(1)}</td>
                                <td>{gradePoint}</td>
                                <td>{grade}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td><strong>TOTAL</strong></td>
                            <td><strong>{subjectsArray.reduce((sum, sub) => sum + Math.min(examData.pa1?.[sub] || 0, 20), 0).toFixed(1)}</strong></td>
                            <td><strong>{subjectsArray.reduce((sum, sub) => sum + Math.min(examData.pa2?.[sub] || 0, 20), 0).toFixed(1)}</strong></td>
                            <td><strong>{subjectsArray.reduce((sum, sub) => sum + Math.min(examData.halfYear?.[sub] || 0, 80), 0).toFixed(1)}</strong></td>
                            <td><strong>{subjectsArray.reduce((sum, sub) => sum + Math.min(examData.pa3?.[sub] || 0, 20), 0).toFixed(1)}</strong></td>
                            <td><strong>{subjectsArray.reduce((sum, sub) => sum + Math.min(examData.pa4?.[sub] || 0, 20), 0).toFixed(1)}</strong></td>
                            <td><strong>{subjectsArray.reduce((sum, sub) => sum + Math.min(examData.final?.[sub] || 0, 80), 0).toFixed(1)}</strong></td>
                            <td><strong>{totalFinal}</strong></td>
                            <td></td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div style={{ marginTop: "10px", borderTop: "1px solid #000", paddingTop: "10px" }}>
                      <strong>SCHOLASTIC AREAS (9 Point Scale)</strong>
                      <div className="table-container">
                        <table className="marks-table">
                          <thead>
                            <tr>
                              <th>MARKS RANGE</th>
                              <th>GRADE</th>
                              <th>GRADE POINT</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr><td>91-100</td><td>A1</td><td>10.0</td></tr>
                            <tr><td>81-90</td><td>A2</td><td>9.0</td></tr>
                            <tr><td>71-80</td><td>B1</td><td>8.0</td></tr>
                            <tr><td>61-70</td><td>B2</td><td>7.0</td></tr>
                            <tr><td>51-60</td><td>C1</td><td>6.0</td></tr>
                            <tr><td>41-50</td><td>C2</td><td>5.0</td></tr>
                            <tr><td>33-40</td><td>D</td><td>4.0</td></tr>
                            <tr><td>00-32</td><td>E</td><td>0.0</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "0.8rem" }}>
                      <strong>Students are assessed according to the following:</strong><br />
                      Promotion is based on the day-to-day work of the student throughout the year and also on the performance in the half yearly/summative examination.<br />
                      <strong>First Term:</strong> PA I (10%) + PA II (10%) + SA I (80%) = 100%<br />
                      <strong>Second Term:</strong> PA III (10%) + PA IV (10%) + SA II (80%) = 100%<br />
                      <strong>Final Result:</strong> 50% of 1st Term + 50% of 2nd Term = 100%
                    </div>
                    <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <div>
                        <strong>Total Obtain Marks (Final):</strong> {totalFinal}<br />
                        <strong>Percentage:</strong> {percentageFinal}%
                      </div>
                      <div>
                        <strong>Class Teacher Sig:</strong> _______________<br />
                        <strong>Principal Sig:</strong> _______________
                      </div>
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