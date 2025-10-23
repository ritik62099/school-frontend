

// src/pages/teacher/ViewResult.jsx
import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import Logo from '../../assets/logo.png'

const ViewResult = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedExamType, setSelectedExamType] = useState("halfYearly"); // 'halfYearly' or 'final'
  // const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Fetch teacher info
    fetch(`https://school-api-gd9l.onrender.com/api/auth/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAssignedClasses(data.assignedClasses || []);
      })
      .catch((err) => console.error("Error fetching teacher info:", err));

    // Fetch marks
    fetch(`https://school-api-gd9l.onrender.com/api/marks`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
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

  if (loading) return <h3 style={{ textAlign: "center" }}>Loading results...</h3>;
  if (error) return <h3 style={{ textAlign: "center", color: "red" }}>{error}</h3>;

  const classOptions = [...new Set(filteredResults.map((r) => r.class))];

  const getGrade = (marks) => {
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

    const opt = {
      margin: 0.4,
      filename: `${name.replace(/\s+/g, "_")}_${examType === 'halfYearly' ? 'HalfYearly' : 'Final'}_ReportCard.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(element).set(opt).save();
  };

  const printReportCard = (studentId, examType) => {
    const content = document.getElementById(`report-card-${studentId}-${examType}`).innerHTML;
    const printWin = window.open("", "_blank");
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Report Card</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .report-card { width: 210mm; min-height: 297mm; margin: 0 auto; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  return (
    <div>
      {/* ✅ Internal CSS */}
      <style>
        {`
          .view-result-container {
            padding: 1.5rem;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f9f9f9;
          }
          .view-result-container h2 {
            text-align: center;
            margin-bottom: 1.5rem;
            color: #2c3e50;
          }
          .filters {
            display: flex;
            gap: 1rem;
            margin: 1rem 0;
            flex-wrap: wrap;
            justify-content: center;
          }
          .filters input,
          .filters select {
            padding: 0.5rem;
            font-size: 1rem;
            border: 1px solid #ccc;
            border-radius: 6px;
            min-width: 180px;
          }
          .exam-type-selector {
            min-width: 200px !important;
          }
          .no-data {
            text-align: center;
            color: #7f8c8d;
            margin-top: 2rem;
            font-size: 1.1rem;
          }
          .report-cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(800px, 1fr));
            gap: 2rem;
            margin-top: 1.5rem;
            justify-content: center;
          }
          .report-card-wrapper {
            background: white;
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 1.2rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          .report-card {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            box-sizing: border-box;
            font-size: 12px;
            line-height: 1.4;
            background: white;
            margin: 0 auto;
            position: relative;
          }
          .report-card .header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
          }
          .report-card .header img {
            width: 50px;
            height: 50px;
            object-fit: contain;
          }
          .report-card .header h1 {
            font-size: 18px;
            margin: 0;
            color: #000;
            font-weight: bold;
          }
          .section-title {
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin: 15px 0;
            color: #2c3e50;
          }
          .info-row {
            text-align: center;
            margin: 10px 0;
            font-size: 13px;
            font-weight: bold;
          }
          .student-details {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 12px;
            flex-wrap: wrap;
          }
          .student-details div {
            flex: 1;
            margin-right: 10px;
            min-width: 120px;
          }
          .marks-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            border: 1px solid #000;
          }
          .marks-table th,
          .marks-table td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
            font-size: 11px;
          }
          .marks-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .card-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
            justify-content: center;
          }
          .card-actions button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            font-size: 13px;
          }
          .card-actions button:first-child {
            background: #27ae60;
            color: white;
          }
          .card-actions button:last-child {
            background: #3498db;
            color: white;
          }
        `}
      </style>

      <div className="view-result-container">
        <h2>Student Marks Record</h2>

        <div className="filters">
          <input
            type="text"
            placeholder="🔍 Search by Student Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
          {/* ✅ Exam Type Dropdown */}
          <select
            className="exam-type-selector"
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
          >
            <option value="halfYearly">Half Yearly (PA1, PA2, SA1)</option>
            <option value="final">Final (PA1-PA4, Half, Final)</option>
          </select>
        </div>

        {filteredResults.length === 0 ? (
          <p className="no-data">No matching results found.</p>
        ) : (
          <div className="report-cards-grid">
            {filteredResults.map((r) => {
              if (!r.studentId) return null;

              const student = r.studentId;
              const examData = r.exams || {};

              // Subjects
              const subjects = new Set();
              Object.values(examData).forEach(exam => {
                Object.keys(exam || {}).forEach(sub => subjects.add(sub));
              });
              const subjectsArray = Array.from(subjects);

              return (
                <div key={`${r._id}-${selectedExamType}`} className="report-card-wrapper">
                  {/* Half Yearly Report Card */}
                  {selectedExamType === "halfYearly" && (
                    <div id={`report-card-${r._id}-halfYearly`} className="report-card">
                      <div className="header">
                        <img src={Logo} alt="School Logo" />
                        <div>
                          <h1>AMBIKA INTERNATIONAL SCHOOL</h1>
                          <p>Saidpur, Dighwara (Saran), 841207</p>
                        </div>
                      </div>

                      <div className="section-title">HALF YEARLY REPORT CARD</div>

                      <div className="student-details">
                        <div><strong>Name:</strong> {student.name || "N/A"}</div>
                        <div><strong>Father:</strong> {student.fatherName || "N/A"}</div>
                        <div><strong>Class:</strong> {r.class || "N/A"}</div>
                        <div><strong>Roll No:</strong> {student.rollNo || "N/A"}</div>
                      </div>

                      <table className="marks-table">
                        <thead>
                          <tr>
                            <th>SUBJECT</th>
                            <th>PA I</th>
                            <th>PA II</th>
                            <th>SA I</th>
                            <th>TOTAL</th>
                            <th>GRADE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectsArray.map((sub) => {
                            const pa1 = examData.pa1?.[sub] || 0;
                            const pa2 = examData.pa2?.[sub] || 0;
                            const sa1 = examData.halfYear?.[sub] || 0;
                            const total = pa1 + pa2 + sa1;
                            return (
                              <tr key={sub}>
                                <td>{sub.toUpperCase()}</td>
                                <td>{pa1}</td>
                                <td>{pa2}</td>
                                <td>{sa1}</td>
                                <td>{total}</td>
                                <td>{getGrade(total)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td><strong>OVERALL</strong></td>
                            <td>{Object.values(examData.pa1 || {}).reduce((a, b) => a + b, 0)}</td>
                            <td>{Object.values(examData.pa2 || {}).reduce((a, b) => a + b, 0)}</td>
                            <td>{Object.values(examData.halfYear || {}).reduce((a, b) => a + b, 0)}</td>
                            <td><strong>{subjectsArray.reduce((sum, sub) => sum + (examData.pa1?.[sub] || 0) + (examData.pa2?.[sub] || 0) + (examData.halfYear?.[sub] || 0), 0)}</strong></td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>

                      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ height: '40px', borderBottom: '1px solid #000', marginBottom: '5px' }}></div>
                          Class Teacher
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ height: '40px', borderBottom: '1px solid #000', marginBottom: '5px' }}></div>
                          Principal
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Final Report Card */}
                  {selectedExamType === "final" && (
                    <div id={`report-card-${r._id}-final`} className="report-card">
                      <div className="header">
                        <img src={Logo} alt="School Logo" />
                        <div>
                          <h1>AMBIKA INTERNATIONAL SCHOOL</h1>
                          <p>Saidpur, Dighwara (Saran), 841207</p>
                        </div>
                      </div>

                      <div className="section-title">ANNUAL REPORT CARD</div>

                      <div className="student-details">
                        <div><strong>Name:</strong> {student.name || "N/A"}</div>
                        <div><strong>Father:</strong> {student.fatherName || "N/A"}</div>
                        <div><strong>Class:</strong> {r.class || "N/A"}</div>
                        <div><strong>Roll No:</strong> {student.rollNo || "N/A"}</div>
                      </div>

                      <table className="marks-table">
                        <thead>
                          <tr>
                            <th>SUBJECT</th>
                            <th>PA I</th>
                            <th>PA II</th>
                            <th>Half Yearly</th>
                            <th>PA III</th>
                            <th>PA IV</th>
                            <th>Final</th>
                            <th>GRAND TOTAL</th>
                            <th>GRADE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectsArray.map((sub) => {
                            const pa1 = examData.pa1?.[sub] || 0;
                            const pa2 = examData.pa2?.[sub] || 0;
                            const half = examData.halfYear?.[sub] || 0;
                            const pa3 = examData.pa3?.[sub] || 0;
                            const pa4 = examData.pa4?.[sub] || 0;
                            const final = examData.final?.[sub] || 0;
                            const grandTotal = pa1 + pa2 + half + pa3 + pa4 + final;
                            return (
                              <tr key={sub}>
                                <td>{sub.toUpperCase()}</td>
                                <td>{pa1}</td>
                                <td>{pa2}</td>
                                <td>{half}</td>
                                <td>{pa3}</td>
                                <td>{pa4}</td>
                                <td>{final}</td>
                                <td>{grandTotal}</td>
                                <td>{getGrade(grandTotal)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td><strong>OVERALL</strong></td>
                            <td>{Object.values(examData.pa1 || {}).reduce((a, b) => a + b, 0)}</td>
                            <td>{Object.values(examData.pa2 || {}).reduce((a, b) => a + b, 0)}</td>
                            <td>{Object.values(examData.halfYear || {}).reduce((a, b) => a + b, 0)}</td>
                            <td>{Object.values(examData.pa3 || {}).reduce((a, b) => a + b, 0)}</td>
                            <td>{Object.values(examData.pa4 || {}).reduce((a, b) => a + b, 0)}</td>
                            <td>{Object.values(examData.final || {}).reduce((a, b) => a + b, 0)}</td>
                            <td><strong>{subjectsArray.reduce((sum, sub) => sum + (examData.pa1?.[sub] || 0) + (examData.pa2?.[sub] || 0) + (examData.halfYear?.[sub] || 0) + (examData.pa3?.[sub] || 0) + (examData.pa4?.[sub] || 0) + (examData.final?.[sub] || 0), 0)}</strong></td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>

                      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ height: '40px', borderBottom: '1px solid #000', marginBottom: '5px' }}></div>
                          Class Teacher
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ height: '40px', borderBottom: '1px solid #000', marginBottom: '5px' }}></div>
                          Principal
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="card-actions">
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
    </div>
  );
};

export default ViewResult;