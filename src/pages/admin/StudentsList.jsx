// src/pages/admin/StudentsList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStudents } from "../../hooks/useStudents";

const StudentsList = () => {
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedRoll, setSelectedRoll] = useState("all");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  const { students, loading, error } = useStudents();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get sorted unique classes
  const classes = useMemo(() => {
    const unique = [...new Set(students.map((s) => s.class).filter(Boolean))];
    return unique.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [students]);

  // Get roll numbers based on selected class
  const rolls = useMemo(() => {
    let filtered = students;
    if (selectedClass !== "all") {
      filtered = students.filter((s) => s.class === selectedClass);
    }
    const rollSet = new Set(filtered.map((s) => s.rollNo).filter(Boolean));
    return Array.from(rollSet).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [students, selectedClass]);

  // Apply both filters
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesClass = selectedClass === "all" || student.class === selectedClass;
      const matchesRoll = selectedRoll === "all" || student.rollNo === selectedRoll;
      return matchesClass && matchesRoll;
    });
  }, [students, selectedClass, selectedRoll]);

  if (loading) return <div style={styles.center}>Loading students...</div>;
  if (error)
    return <div style={{ ...styles.center, color: "red" }}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>All Students</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/')} style={styles.backBtn}>← Back</button>
        </div>
      </div>

      {/* Class Filter */}
      <div style={styles.filterContainer}>
        <label htmlFor="class-filter" style={styles.label}>Filter by Class:</label>
        <select
          id="class-filter"
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedRoll("all"); // Reset roll when class changes
          }}
          style={styles.select}
        >
          <option value="all">All Classes</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>Class {cls}</option>
          ))}
        </select>
      </div>

      {/* Roll No Filter */}
      <div style={styles.filterContainer}>
        <label htmlFor="roll-filter" style={styles.label}>Filter by Roll No:</label>
        <select
          id="roll-filter"
          value={selectedRoll}
          onChange={(e) => setSelectedRoll(e.target.value)}
          style={styles.select}
          disabled={rolls.length === 0}
        >
          <option value="all">All Rolls</option>
          {rolls.map((roll) => (
            <option key={roll} value={roll}>
              {roll}
            </option>
          ))}
        </select>
      </div>

      {!isMobile && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Roll No</th>
                <th>DOB</th>       {/* ✅ NEW */}
                <th>Admission</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id} style={styles.row}>
                  <td>
                    {student.photo ? (
                      <img src={student.photo} alt={student.name} style={styles.photo} />
                    ) : (
                      <div style={styles.noPhoto}>—</div>
                    )}
                  </td>
                  <td>{student.name || "—"}</td>
                  <td>{student.class || "—"}</td>
                  <td>{student.section || "—"}</td>
                  <td>{student.rollNo || "—"}</td>
                  <td>
                    {student.dob
                      ? new Date(student.dob).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>
                    {student.admissionDate
                      ? new Date(student.admissionDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <button
                      style={styles.editBtn}
                      onClick={() => navigate(`/admin/students/edit/${student._id}`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isMobile && (
        <div style={styles.cardGrid}>
          {filteredStudents.map((student) => (
            <div key={student._id} style={styles.card}>
              <div style={styles.cardHeader}>
                {student.photo ? (
                  <img src={student.photo} alt={student.name} style={styles.cardPhoto} />
                ) : (
                  <div style={styles.noPhoto}>—</div>
                )}
                <div>
                  <h3 style={styles.cardName}>{student.name || "—"}</h3>
                  <p style={styles.cardSub}>
                    Class {student.class || "—"} • {student.section || "—"}
                  </p>
                </div>
              </div>
              <div style={styles.cardBody}>
                <p><strong>Roll No:</strong> {student.rollNo || "—"}</p>
                <p><strong>Admission:</strong> {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "—"}</p>
                <p><strong>DOB:</strong> {student.dob ? new Date(student.dob).toLocaleDateString() : "—"}</p>

              </div>
              <button
                onClick={() => navigate(`/admin/students/edit/${student._id}`)}
                style={styles.cardBtn}
              >
                ✏️ Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "1.2rem",
    fontFamily: "Inter, system-ui, sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  heading: {
    color: "#1e293b",
    fontWeight: "700",
    fontSize: "1.8rem",
  },
  backBtn: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0.6rem 1.2rem",
    fontWeight: "600",
    cursor: "pointer",
    height: "fit-content",
  },
  filterContainer: {
    marginBottom: "1.2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: { fontWeight: "600", color: "#475569" },
  select: {
    padding: "0.7rem",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    backgroundColor: "#fff",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    backgroundColor: "#f8fafc",
    textAlign: "left",
  },
  row: {
    borderBottom: "1px solid #e2e8f0",
  },
  photo: {
    width: "45px",
    height: "45px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  noPhoto: {
    width: "45px",
    height: "45px",
    borderRadius: "8px",
    backgroundColor: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
  },
  editBtn: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.4rem 0.8rem",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  center: {
    textAlign: "center",
    marginTop: "2rem",
    color: "#64748b",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "1rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "1rem",
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  cardPhoto: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #e2e8f0",
  },
  cardName: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1e293b",
  },
  cardSub: { margin: 0, fontSize: "0.9rem", color: "#64748b" },
  cardBody: {
    marginTop: "0.7rem",
    fontSize: "0.9rem",
    color: "#475569",
  },
  cardBtn: {
    marginTop: "0.9rem",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "0.7rem",
    fontSize: "0.95rem",
    cursor: "pointer",
    width: "100%",
    fontWeight: "600",
  },
};

export default StudentsList;