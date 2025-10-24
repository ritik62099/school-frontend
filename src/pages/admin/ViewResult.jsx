

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

  // Fetch teacher info & marks
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

  // Filter results
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

  // 🎓 Grading logic (based on CBSE 9-point scale)
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

  // PDF + Print functions
  const downloadReportCard = (studentId, name, examType) => {
    const element = document.getElementById(`report-card-${studentId}-${examType}`);
    if (!element) return;
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
    const content = document.getElementById(`report-card-${studentId}-${examType}`).innerHTML;
    const printWin = window.open("", "_blank");
    printWin.document.write(`
      <html>
        <head><title>Print Report Card</title></head>
        <body>${content}</body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  return (
    <div className="view-result-container" style={{ padding: "1.5rem", background: "#f9f9f9" }}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Student Marks Record</h2>

      {/* Filters */}
      <div className="filters" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
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

      {/* Reports */}
      {filteredResults.length === 0 ? (
        <p style={{ textAlign: "center", color: "#7f8c8d" }}>No matching results found.</p>
      ) : (
        <div className="report-cards-grid" style={{ display: "grid", gap: "2rem", marginTop: "1.5rem" }}>
          {filteredResults.map((r) => {
            if (!r.studentId) return null;
            const student = r.studentId;
            const examData = r.exams || {};
            const subjects = new Set();
            Object.values(examData).forEach((exam) => {
              if (exam) Object.keys(exam).forEach((sub) => subjects.add(sub));
            });
            const subjectsArray = Array.from(subjects);

            // Calculate Term1 Total for Half Yearly
            const getTerm1Total = (sub) => {
              const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
              const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
              const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
              return ((pa1 / 2) + (pa2 / 2) + sa1).toFixed(1); // Out of 100
            };

            // Calculate Final Total for Annual
            const getFinalTotal = (sub) => {
              const pa1 = Math.min(examData.pa1?.[sub] || 0, 20);
              const pa2 = Math.min(examData.pa2?.[sub] || 0, 20);
              const sa1 = Math.min(examData.halfYear?.[sub] || 0, 80);
              const pa3 = Math.min(examData.pa3?.[sub] || 0, 20);
              const pa4 = Math.min(examData.pa4?.[sub] || 0, 20);
              const sa2 = Math.min(examData.final?.[sub] || 0, 80);

              const term1 = (pa1 / 2) + (pa2 / 2) + sa1; // out of 100
              const term2Component = pa3 + pa4 + sa2; // out of 120
              const finalTotal = (term1 / 2) + (term2Component / 2); // weighted average out of 100

              return finalTotal.toFixed(1);
            };

            // Calculate Overall Totals
            const totalTerm1 = subjectsArray.reduce((sum, sub) => sum + parseFloat(getTerm1Total(sub)), 0).toFixed(1);
            const totalFinal = subjectsArray.reduce((sum, sub) => sum + parseFloat(getFinalTotal(sub)), 0).toFixed(1);

            // Calculate Percentage
            const percentageTerm1 = ((totalTerm1 / (subjectsArray.length * 100)) * 100).toFixed(2);
            const percentageFinal = ((totalFinal / (subjectsArray.length * 100)) * 100).toFixed(2);

            return (
              <div key={`${r._id}-${selectedExamType}`} style={{ background: "#fff", padding: "1rem", borderRadius: "8px" }}>
                {/* Half Yearly */}
                {selectedExamType === "halfYearly" && (
                  <div id={`report-card-${r._id}-halfYearly`} className="report-card">
                    <div className="header" style={{ display: "flex", alignItems: "center", borderBottom: "2px solid #000", marginBottom: "10px" }}>
                      <img src={Logo} alt="Logo" style={{ width: "50px", marginRight: "10px" }} />
                      <div>
                        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>AMBIKA INTERNATIONAL SCHOOL</h1>
                        <p style={{ margin: 0 }}>Saidpur, Dighwara (Saran), 841207</p>
                      </div>
                    </div>

                    <h3 style={{ textAlign: "center", margin: "10px 0" }}>HALF YEARLY REPORT CARD</h3>

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
                      <strong>Attendance:</strong> {student.attendance || "0"} / 115<br />
                      <strong>Address:</strong> {student.address || "N/A"}
                    </div>

                    <table className="marks-table" border="1" style={{ width: "100%", textAlign: "center", borderCollapse: "collapse" }}>
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
                          // Grade Point Mapping (example: A1=10, A2=9, B1=8, etc.)
                          const gradePoint = grade === "A1" ? 10 :
                                            grade === "A2" ? 9 :
                                            grade === "B1" ? 8 :
                                            grade === "B2" ? 7 :
                                            grade === "C1" ? 6 :
                                            grade === "C2" ? 5 :
                                            grade === "D" ? 4 : 0;

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

                    <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <strong>Total Obtain Marks:</strong> {totalTerm1}<br />
                        <strong>Percentage:</strong> {percentageTerm1}%
                      </div>
                      <div>
                        <strong>Class Teacher Sig:</strong> _______________<br />
                        <strong>Principal Sig:</strong> _______________
                      </div>
                    </div>

                    <div style={{ marginTop: "10px", borderTop: "1px solid #000", paddingTop: "10px" }}>
                      <strong>SCHOLASTIC AREAS (9 Point Scale)</strong><br />
                      <table border="1" style={{ width: "100%", textAlign: "center", borderCollapse: "collapse" }}>
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

                    <div style={{ marginTop: "10px", fontSize: "0.8rem" }}>
                      <strong>Students are assessed according to the following:</strong><br />
                      Promotion is based on the day-to-day work of the student throughout the year and also on the performance in the half yearly/summative examination.<br />
                      <strong>First Term:</strong> PA I (10%) + PA II (10%) + SA I (80%) = 100%<br />
                      <strong>Second Term:</strong> PA III (10%) + PA IV (10%) + SA II (80%) = 100%<br />
                      <strong>Final Result:</strong> 50% of 1st Term + 50% of 2nd Term = 100%
                    </div>
                  </div>
                )}

                {/* Annual */}
                {selectedExamType === "final" && (
                  <div id={`report-card-${r._id}-final`} className="report-card">
                    <div className="header" style={{ display: "flex", alignItems: "center", borderBottom: "2px solid #000", marginBottom: "10px" }}>
                      <img src={Logo} alt="Logo" style={{ width: "50px", marginRight: "10px" }} />
                      <div>
                        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>AMBIKA INTERNATIONAL SCHOOL</h1>
                        <p style={{ margin: 0 }}>Saidpur, Dighwara (Saran), 841207</p>
                      </div>
                    </div>

                    <h3 style={{ textAlign: "center", margin: "10px 0" }}>ANNUAL REPORT CARD</h3>

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
                      <strong>Attendance:</strong> {student.attendance || "0"} / 115<br />
                      <strong>Address:</strong> {student.address || "N/A"}
                    </div>

                    <table className="marks-table" border="1" style={{ width: "100%", textAlign: "center", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th>SUBJECT</th>
                          <th>TERM I (100)</th>
                          <th>TERM II (100)</th>
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

                          const term1 = (pa1 / 2) + (pa2 / 2) + sa1; // out of 100
                          const term2Component = pa3 + pa4 + sa2; // out of 120
                          const finalTotal = (term1 / 2) + (term2Component / 2); // weighted average out of 100

                          const grade = getGrade(finalTotal, r.class);
                          const gradePoint = grade === "A1" ? 10 :
                                            grade === "A2" ? 9 :
                                            grade === "B1" ? 8 :
                                            grade === "B2" ? 7 :
                                            grade === "C1" ? 6 :
                                            grade === "C2" ? 5 :
                                            grade === "D" ? 4 : 0;

                          return (
                            <tr key={sub}>
                              <td>{sub}</td>
                              <td>{term1.toFixed(1)}</td>
                              <td>{term2Component.toFixed(1)}</td>
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
                          <td><strong>{totalTerm1}</strong></td>
                          <td><strong>{subjectsArray.reduce((sum, sub) => {
                            const pa3 = Math.min(examData.pa3?.[sub] || 0, 20);
                            const pa4 = Math.min(examData.pa4?.[sub] || 0, 20);
                            const sa2 = Math.min(examData.final?.[sub] || 0, 80);
                            return sum + (pa3 + pa4 + sa2);
                          }, 0).toFixed(1)}</strong></td>
                          <td><strong>{totalFinal}</strong></td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>

                    <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <strong>Total Obtain Marks:</strong> {totalFinal}<br />
                        <strong>Percentage:</strong> {percentageFinal}%
                      </div>
                      <div>
                        <strong>Class Teacher Sig:</strong> _______________<br />
                        <strong>Principal Sig:</strong> _______________
                      </div>
                    </div>

                    <div style={{ marginTop: "10px", borderTop: "1px solid #000", paddingTop: "10px" }}>
                      <strong>SCHOLASTIC AREAS (9 Point Scale)</strong><br />
                      <table border="1" style={{ width: "100%", textAlign: "center", borderCollapse: "collapse" }}>
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

                    <div style={{ marginTop: "10px", fontSize: "0.8rem" }}>
                      <strong>Students are assessed according to the following:</strong><br />
                      Promotion is based on the day-to-day work of the student throughout the year and also on the performance in the half yearly/summative examination.<br />
                      <strong>First Term:</strong> PA I (10%) + PA II (10%) + SA I (80%) = 100%<br />
                      <strong>Second Term:</strong> PA III (10%) + PA IV (10%) + SA II (80%) = 100%<br />
                      <strong>Final Result:</strong> 50% of 1st Term + 50% of 2nd Term = 100%
                    </div>
                  </div>
                )}

                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <button onClick={() => downloadReportCard(r._id, student.name, selectedExamType)} style={{ marginRight: "10px" }}>📥 Download PDF</button>
                  <button onClick={() => printReportCard(r._id, selectedExamType)}>🖨️ Print</button>
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