// src/pages/admin/AttendanceOverview.jsx
import React, { useState, useEffect } from "react";
import { endpoints } from "../../config/api";
import { saveAs } from "file-saver";

const AttendanceOverview = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    class: "",
    studentId: "",
    year: new Date().getFullYear().toString(),
    month: String(new Date().getMonth() + 1).padStart(2, "0"),
  });

  const [studentInfo, setStudentInfo] = useState(null);

  // Load all classes
useEffect(() => {
  const loadClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(endpoints.classes.list, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();

        // FIX: Normalize class list  
        const classArray = Array.isArray(data)
          ? data
          : Array.isArray(data.classes)
          ? data.classes
          : [];

        setClasses(classArray.map((c) => c.name || c));
      } else {
        console.log("Failed to load classes");
      }
    } catch (err) {
      console.error("Error loading classes:", err);
    }
  };

  loadClasses();
}, []);


  // Load students of selected class
  useEffect(() => {
    if (!formData.class) {
      setStudents([]);
      setFormData((prev) => ({ ...prev, studentId: "" }));
      return;
    }

    const loadStudents = async () => {
      try {
        const res = await fetch(endpoints.students.list, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.ok) {
          const data = await res.json();
          setStudents(data.filter((s) => s.class === formData.class));
        }
      } catch (err) {
        console.error("Error loading students:", err);
      }
    };

    loadStudents();
  }, [formData.class]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "class" ? { studentId: "" } : {}),
    }));
  };

  const generateReport = async () => {
    if (!formData.studentId) return alert("Please select a student");

    setLoading(true);
    setReport([]);

    try {
      const res = await fetch(
        endpoints.attendance.studentMonthly(
          formData.studentId,
          formData.year,
          formData.month
        ),
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setStudentInfo(data.student);
        setReport(data.report);
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      console.error("Error loading report:", err);
    }

    setLoading(false);
  };

  const downloadCSV = () => {
    if (report.length === 0 || !studentInfo) return;

    const headers = ["Date", "Status"];
    const csvContent = [
      headers.join(","),
      ...report.map((row) => [
        row.date,
        row.present ? "Present" : "Absent",
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    saveAs(
      blob,
      `attendance-${studentInfo.name}-${formData.year}-${formData.month}.csv`
    );
  };

  // Summary Values
  const totalPresent = report.filter((r) => r.present).length;
  const totalAbsent = report.filter((r) => !r.present).length;
  const percentage =
    report.length > 0
      ? ((totalPresent / report.length) * 100).toFixed(2)
      : 0;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Student Attendance Overview</h2>

      <div style={styles.form}>
        {/* Class Dropdown */}
        <select
          name="class"
          value={formData.class}
          onChange={handleChange}
          style={styles.select}
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        {/* Student Dropdown */}
        <select
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          style={styles.select}
          disabled={!students.length}
        >
          <option value="">Select Student</option>
          {students.map((stu) => (
            <option key={stu._id} value={stu._id}>
              {stu.name} (Roll: {stu.rollNo})
            </option>
          ))}
        </select>

        {/* YEAR */}
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          style={styles.input}
        />

        {/* MONTH */}
        <select
          name="month"
          value={formData.month}
          onChange={handleChange}
          style={styles.select}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <button
          onClick={generateReport}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Loading..." : "Generate"}
        </button>
      </div>

      {/* Student Info */}
      {studentInfo && (
        <div style={styles.studentCard}>
          <strong>{studentInfo.name}</strong> — Class: {studentInfo.class}, Roll:{" "}
          {studentInfo.rollNo}
        </div>
      )}

      {/* Download Button */}
      {report.length > 0 && (
        <button style={styles.downloadBtn} onClick={downloadCSV}>
          📥 Download CSV
        </button>
      )}

      {/* Attendance Table */}
      {report.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.map((row, i) => (
                <tr key={i}>
                  <td style={styles.td}>{row.date}</td>
                  <td
                    style={{
                      ...styles.td,
                      color: row.present ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {row.present ? "Present" : "Absent"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUMMARY BOX */}
      {report.length > 0 && (
        <div style={styles.summaryBox}>
          <p><strong>Total Present:</strong> {totalPresent} days</p>
          <p><strong>Total Absent:</strong> {totalAbsent} days</p>
          <p>
            <strong>Attendance Percentage:</strong>{" "}
            <span style={{ color: percentage >= 75 ? "green" : "red" }}>
              {percentage}%
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

// 🎨 CSS-in-JS Styling
const styles = {
  container: {
    padding: "20px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px",
  },
  select: {
    flex: 1,
    padding: "10px",
    minWidth: "160px",
  },
  input: {
    width: "120px",
    padding: "10px",
  },
  button: {
    padding: "10px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  downloadBtn: {
    marginBottom: "10px",
    padding: "10px 15px",
    background: "green",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "10px",
    background: "#f1f5f9",
    fontWeight: "bold",
    borderBottom: "2px solid #ddd",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #eee",
    textAlign: "center",
  },
  summaryBox: {
    marginTop: "20px",
    padding: "15px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    lineHeight: "1.6",
  },
  studentCard: {
    background: "#eef2ff",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontWeight: "500",
  },
};

export default AttendanceOverview;
