// src/pages/admin/AttendanceOverview.jsx
import React, { useState, useEffect } from "react";
import { endpoints } from "../../config/api";

const AttendanceOverview = ({ onBack }) => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    class: "",
    year: new Date().getFullYear().toString(),
    month: String(new Date().getMonth() + 1).padStart(2, "0"),
  });

  const [error, setError] = useState("");

  // Excel-style data
  const [daysInMonth, setDaysInMonth] = useState(0);
  const [studentMonthlyData, setStudentMonthlyData] = useState({}); // id -> {report, byDay, presentDays, workingDays, percentage}

  // Detail view
  const [selectedStudentId, setSelectedStudentId] = useState(null);


  const handleBackClick = () => {
  if (typeof onBack === "function") onBack();
  else window.history.back();
};
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

          const classArray = Array.isArray(data)
            ? data
            : Array.isArray(data.classes)
            ? data.classes
            : [];

          setClasses(classArray.map((c) => c.name || c));
        }
      } catch (err) {
        console.error("Error loading classes:", err);
      }
    };

    loadClasses();
  }, []);

  // Load students when class changes
  useEffect(() => {
    if (!formData.class) {
      setStudents([]);
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

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate(); // month: 1..12

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setSelectedStudentId(null);
    setStudentMonthlyData({});
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Search / Generate Excel-style report
  const searchAttendance = async () => {
    if (!formData.class) {
      setError("Please select a class");
      return;
    }
    if (!students.length) {
      setError("No students found in this class");
      return;
    }

    setLoading(true);
    setError("");
    setSelectedStudentId(null);
    setStudentMonthlyData({});

    const token = localStorage.getItem("token");
    const { year, month } = formData;
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const totalDays = getDaysInMonth(yearNum, monthNum);
    setDaysInMonth(totalDays);

    const resultData = {};

    try {
      await Promise.all(
        students.map(async (stu) => {
          try {
            const res = await fetch(
              endpoints.attendance.studentMonthly(stu._id, year, month),
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (!res.ok) return;
            const data = await res.json();
            const report = data.report || [];

            const workingDays = report.filter((r) => !r.isSchoolClosed).length;
            const presentDays = report.filter(
              (r) => !r.isSchoolClosed && r.present
            ).length;
            const percentage =
              workingDays > 0
                ? ((presentDays / workingDays) * 100).toFixed(2)
                : "0.00";

            const byDay = {};
            for (let day = 1; day <= totalDays; day++) {
              const dateStr = `${yearNum}-${String(monthNum).padStart(
                2,
                "0"
              )}-${String(day).padStart(2, "0")}`;

              const row = report.find((r) => r.date === dateStr);

              if (!row) {
                byDay[day] = "-";
              } else if (row.isSchoolClosed) {
                byDay[day] = "H";
              } else {
                byDay[day] = row.present ? "P" : "A";
              }
            }

            resultData[stu._id] = {
              report,
              byDay,
              presentDays,
              workingDays,
              percentage,
            };
          } catch (err) {
            console.error("Error fetching attendance for", stu._id, err);
          }
        })
      );

      setStudentMonthlyData(resultData);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("Failed to fetch attendance");
    }

    setLoading(false);
  };

  const monthLabel = new Date(
    Number(formData.year),
    Number(formData.month) - 1
  ).toLocaleString("default", { month: "long" });

  const selectedStudent =
    selectedStudentId && students.find((s) => s._id === selectedStudentId);

  const selectedDetails =
    selectedStudentId &&
    studentMonthlyData[selectedStudentId] &&
    studentMonthlyData[selectedStudentId].report
      ? studentMonthlyData[selectedStudentId].report
      : null;

  const selectedSummary =
    selectedStudentId && studentMonthlyData[selectedStudentId]
      ? {
          presentDays: studentMonthlyData[selectedStudentId].presentDays,
          workingDays: studentMonthlyData[selectedStudentId].workingDays,
          percentage: studentMonthlyData[selectedStudentId].percentage,
        }
      : null;

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
  <button style={styles.backBtn} onClick={handleBackClick}>
    ← Back
  </button>

  <h2 style={styles.heading}>Class Attendance Overview (Excel Style)</h2>
</div>


      {/* CLASS + YEAR + MONTH + SEARCH BUTTON */}
      <div style={styles.form}>
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

        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          style={styles.input}
        />

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
          onClick={searchAttendance}
          style={styles.button}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* EXCEL STYLE TABLE */}
      {students.length > 0 && Object.keys(studentMonthlyData).length > 0 && (
        <>
          <div
            style={{
              marginBottom: "0.5rem",
              fontWeight: 600,
            }}
          >
            Class: {formData.class} | Month: {monthLabel} {formData.year}
          </div>

          <div
            style={{
              overflowX: "auto",
              borderRadius: "8px",
              border: "1px solid #ddd",
              marginBottom: "1.5rem",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.85rem",
                minWidth: "900px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f1f1f1" }}>
                  <th style={headerCellStyle}>Roll</th>
                  <th style={headerCellStyle}>Name</th>
                  <th style={headerCellStyle}>P</th>
                  <th style={headerCellStyle}>W</th>
                  <th style={headerCellStyle}>%</th>
                  {/* Days columns */}
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <th key={i + 1} style={headerCellStyle}>
                      {i + 1}
                    </th>
                  ))}
                  <th style={headerCellStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu) => {
                  const stuData = studentMonthlyData[stu._id];
                  const byDay = stuData ? stuData.byDay : {};
                  const presentDays = stuData ? stuData.presentDays : 0;
                  const workingDays = stuData ? stuData.workingDays : 0;
                  const percentage = stuData ? stuData.percentage : "0.00";

                  return (
                    <tr
                      key={stu._id}
                      style={{
                        backgroundColor:
                          selectedStudentId === stu._id ? "#e8f6ff" : "white",
                      }}
                    >
                      <td style={bodyCellStyle}>{stu.rollNo}</td>
                      <td style={{ ...bodyCellStyle, fontWeight: 600 }}>
                        {stu.name}
                      </td>

                      {/* TOTALS */}
                      <td
                        style={{
                          ...bodyCellStyle,
                          textAlign: "center",
                          fontWeight: "bold",
                          backgroundColor: "#d4edda",
                        }}
                      >
                        {presentDays}
                      </td>
                      <td
                        style={{
                          ...bodyCellStyle,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {workingDays}
                      </td>
                      <td
                        style={{
                          ...bodyCellStyle,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {percentage}%
                      </td>

                      {/* Per-day cells */}
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const val = byDay ? byDay[day] : "-";
                        let bg = "white";
                        if (val === "P") bg = "#d4edda";
                        else if (val === "A") bg = "#f8d7da";
                        else if (val === "H") bg = "#fff3cd";
                        else if (val === "-") bg = "#f9f9f9";

                        return (
                          <td
                            key={day}
                            style={{
                              ...bodyCellStyle,
                              backgroundColor: bg,
                              textAlign: "center",
                              fontWeight:
                                val === "P" || val === "A" ? "bold" : "normal",
                            }}
                          >
                            {val}
                          </td>
                        );
                      })}

                      {/* DETAILS BUTTON */}
                      <td style={{ ...bodyCellStyle, textAlign: "center" }}>
                        <button
                          onClick={() =>
                            setSelectedStudentId(
                              selectedStudentId === stu._id ? null : stu._id
                            )
                          }
                          style={{
                            padding: "4px 10px",
                            borderRadius: "4px",
                            border: "none",
                            cursor: "pointer",
                            backgroundColor:
                              selectedStudentId === stu._id
                                ? "#6b7280"
                                : "#2563eb",
                            color: "white",
                            fontSize: "0.8rem",
                          }}
                        >
                          {selectedStudentId === stu._id
                            ? "Hide Details"
                            : "Details"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div
            style={{
              fontSize: "0.85rem",
              marginBottom: "1rem",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <span>
              <strong>P</strong> = Present
            </span>
            <span>
              <strong>A</strong> = Absent
            </span>
            <span>
              <strong>H</strong> = Holiday / School Closed
            </span>
            <span>
              <strong>-</strong> = Attendance not marked
            </span>
            <span>
              <strong>Column P</strong> = Total Present Days
            </span>
            <span>
              <strong>Column W</strong> = Total Working Days
            </span>
            <span>
              <strong>%</strong> = (P / W) × 100
            </span>
          </div>
        </>
      )}

      {/* DAILY DETAIL + STUDENT INFO */}
      {selectedStudent && selectedDetails && (
        <div style={styles.detailsWrapper}>
          {/* 🧑‍🎓 Student Details Card */}
          <div style={styles.detailsCard}>
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
              Student Details
            </h3>
            <div style={styles.detailsRow}>
              <span style={styles.detailsLabel}>Name:</span>
              <span>{selectedStudent.name}</span>
            </div>
            <div style={styles.detailsRow}>
              <span style={styles.detailsLabel}>Roll No:</span>
              <span>{selectedStudent.rollNo || "-"}</span>
            </div>
            <div style={styles.detailsRow}>
              <span style={styles.detailsLabel}>Father's Name:</span>
              <span>{selectedStudent.fatherName || "-"}</span>
            </div>
            <div style={styles.detailsRow}>
              <span style={styles.detailsLabel}>Mother's Name:</span>
              <span>{selectedStudent.motherName || "-"}</span>
            </div>
            <div style={styles.detailsRow}>
              <span style={styles.detailsLabel}>Mobile:</span>
              <span>{selectedStudent.mobile || "-"}</span>
            </div>
            <div style={styles.detailsRow}>
              <span style={styles.detailsLabel}>Address:</span>
              <span>{selectedStudent.address || "-"}</span>
            </div>
            <div style={styles.detailsRow}>
              <span style={styles.detailsLabel}>Class / Section:</span>
              <span>
                {selectedStudent.class} {selectedStudent.section || ""}
              </span>
            </div>

            {selectedSummary && (
              <div
                style={{
                  marginTop: "0.5rem",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid #e5e7eb",
                  fontSize: "0.9rem",
                }}
              >
                <strong>Attendance Summary:</strong> Present{" "}
                {selectedSummary.presentDays} /{" "}
                {selectedSummary.workingDays} days (
                {selectedSummary.percentage}%)
              </div>
            )}
          </div>

          {/* 📅 Daily Attendance Table */}
          <div style={styles.dailyTableWrapper}>
            <h3
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
              }}
            >
              Daily Attendance — {monthLabel} {formData.year}
            </h3>

            <div
              style={{
                maxHeight: "260px",
                overflowY: "auto",
                borderRadius: "6px",
                border: "1px solid #e0e0e0",
                backgroundColor: "white",
                marginTop: "0.5rem",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f1f1f1" }}>
                    <th style={headerCellStyle}>Date</th>
                    <th style={headerCellStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDetails.map((row, idx) => {
                    let label = "";
                    let color = "";
                    if (row.isSchoolClosed) {
                      label = "🏫 Holiday / School Closed";
                      color = "#555";
                    } else if (row.present) {
                      label = "✅ Present";
                      color = "green";
                    } else {
                      label = "❌ Absent";
                      color = "red";
                    }

                    return (
                      <tr
                        key={idx}
                        style={
                          idx % 2 === 0
                            ? { backgroundColor: "#fafafa" }
                            : { backgroundColor: "white" }
                        }
                      >
                        <td style={bodyCellStyle}>{row.date}</td>
                        <td
                          style={{
                            ...bodyCellStyle,
                            color,
                            fontWeight: "bold",
                          }}
                        >
                          {label}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const headerCellStyle = {
  padding: "0.5rem",
  textAlign: "center",
  fontWeight: "bold",
  borderBottom: "2px solid #ddd",
  borderRight: "1px solid #eee",
  whiteSpace: "nowrap",
};

const bodyCellStyle = {
  padding: "0.4rem",
  borderBottom: "1px solid #eee",
  borderRight: "1px solid #f3f3f3",
  textAlign: "left",
};

const styles = {
  container: { padding: "20px", maxWidth: "1200px", margin: "0 auto" },
  heading: { textAlign: "center", marginBottom: "20px" },
  topBar: {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "15px",
  flexWrap: "wrap",
},

backBtn: {
  padding: "6px 14px",
  borderRadius: "20px",
  border: "1px solid #d1d5db",
  background: "#2563eb",
  cursor: "pointer",
  fontSize: "14px",
  color: "white",
},

  form: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px",
    alignItems: "center",
  },
  select: { flex: 1, padding: "10px", minWidth: "160px" },
  input: { width: "120px", padding: "10px" },
  button: {
    padding: "10px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    minWidth: "120px",
  },

  // Details section styles
  detailsWrapper: {
    marginTop: "1rem",
    display: "grid",
    gridTemplateColumns: "minmax(260px, 1fr) 2fr",
    gap: "1rem",
    alignItems: "flex-start",
  },
  detailsCard: {
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    fontSize: "0.95rem",
  },
  detailsRow: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "0.3rem",
  },
  detailsLabel: {
    minWidth: "120px",
    fontWeight: "600",
  },
  dailyTableWrapper: {
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#fdfdfd",
  },
};

export default AttendanceOverview;
