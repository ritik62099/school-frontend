


// src/pages/admin/StudentsList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStudents } from "../../hooks/useStudents";
import { endpoints } from "../../config/api"; // ✅

const StudentsList = () => {
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedRoll, setSelectedRoll] = useState("all");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [promotingId, setPromotingId] = useState(null);       // ✅ kis student ko promote kar rahe
  const [promoteClass, setPromoteClass] = useState("");       // ✅ target class
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteError, setPromoteError] = useState("");

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
    return Array.from(rollSet).sort(
      (a, b) => parseInt(a, 10) - parseInt(b, 10)
    );
  }, [students, selectedClass]);

  // Apply both filters
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesClass =
        selectedClass === "all" || student.class === selectedClass;
      const matchesRoll =
        selectedRoll === "all" || student.rollNo === selectedRoll;
      return matchesClass && matchesRoll;
    });
  }, [students, selectedClass, selectedRoll]);

  // ✅ Promote handler – ab naya /students/:id/promote route hit karega
  const handlePromote = async (studentId) => {
    if (!promoteClass) {
      setPromoteError("Please select new class to promote.");
      return;
    }

    setPromoteLoading(true);
    setPromoteError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(endpoints.students.promote(studentId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newClass: promoteClass }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to promote student");
      }

      alert("✅ Student promoted, marks & attendance reset ho gaye!");
      // agar useStudents me refetch ho to use kar sakte ho, warna simple reload:
      window.location.reload();
    } catch (err) {
      setPromoteError(err.message || "Error while promoting student");
      console.error(err);
    } finally {
      setPromoteLoading(false);
      setPromotingId(null);
      setPromoteClass("");
    }
  };

  if (loading) return <div style={styles.center}>Loading students...</div>;
  if (error)
    return <div style={{ ...styles.center, color: "red" }}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>All Students</h2>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/")} style={styles.backBtn}>
            ← Back
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterContainer}>
        <label htmlFor="class-filter" style={styles.label}>
          Filter by Class:
        </label>
        <select
          id="class-filter"
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedRoll("all");
          }}
          style={styles.select}
        >
          <option value="all">All Classes</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              Class {cls}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.filterContainer}>
        <label htmlFor="roll-filter" style={styles.label}>
          Filter by Roll No:
        </label>
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

      {promoteError && (
        <div style={{ ...styles.center, color: "red" }}>{promoteError}</div>
      )}

      {/* 💻 DESKTOP TABLE */}
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
                <th>DOB</th>
                <th>Admission</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id} style={styles.row}>
                  <td>
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                        style={styles.photo}
                      />
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
                    {promotingId === student._id ? (
                      <div style={styles.promoteControls}>
                        <select
                          style={styles.promoteSelect}
                          value={promoteClass}
                          onChange={(e) => setPromoteClass(e.target.value)}
                        >
                          <option value="">Select class</option>
                          {classes.map((cls) => (
                            <option key={cls} value={cls}>
                              Class {cls}
                            </option>
                          ))}
                        </select>
                        <button
                          style={styles.promoteSaveBtn}
                          disabled={promoteLoading}
                          onClick={() => handlePromote(student._id)}
                        >
                          {promoteLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          style={styles.promoteCancelBtn}
                          onClick={() => {
                            setPromotingId(null);
                            setPromoteClass("");
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          style={styles.editBtn}
                          onClick={() =>
                            navigate(`/admin/students/edit/${student._id}`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          style={styles.promoteBtn}
                          onClick={() => {
                            setPromotingId(student._id);
                            setPromoteClass(student.class || "");
                          }}
                        >
                          Promote
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 📱 MOBILE CARDS */}
      {isMobile && (
        <div style={styles.cardGrid}>
          {filteredStudents.map((student) => (
            <div key={student._id} style={styles.card}>
              <div style={styles.cardHeader}>
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt={student.name}
                    style={styles.cardPhoto}
                  />
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
                <p>
                  <strong>Roll No:</strong> {student.rollNo || "—"}
                </p>
                <p>
                  <strong>Admission:</strong>{" "}
                  {student.admissionDate
                    ? new Date(student.admissionDate).toLocaleDateString()
                    : "—"}
                </p>
                <p>
                  <strong>DOB:</strong>{" "}
                  {student.dob
                    ? new Date(student.dob).toLocaleDateString()
                    : "—"}
                </p>
              </div>

              {promotingId === student._id ? (
                <div style={{ marginTop: "0.8rem" }}>
                  <select
                    style={styles.promoteSelect}
                    value={promoteClass}
                    onChange={(e) => setPromoteClass(e.target.value)}
                  >
                    <option value="">Select class</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                  <button
                    style={{ ...styles.cardBtn, marginTop: "0.5rem" }}
                    disabled={promoteLoading}
                    onClick={() => handlePromote(student._id)}
                  >
                    {promoteLoading ? "Saving..." : "Save Promotion"}
                  </button>
                  <button
                    style={{
                      ...styles.cardBtn,
                      marginTop: "0.4rem",
                      backgroundColor: "#e5e7eb",
                      color: "#111827",
                    }}
                    onClick={() => {
                      setPromotingId(null);
                      setPromoteClass("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "0.8rem",
                  }}
                >
                  <button
                    onClick={() =>
                      navigate(`/admin/students/edit/${student._id}`)
                    }
                    style={styles.cardBtn}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      setPromotingId(student._id);
                      setPromoteClass(student.class || "");
                    }}
                    style={{
                      ...styles.cardBtn,
                      backgroundColor: "#10b981",
                    }}
                  >
                    ⬆️ Promote
                  </button>
                </div>
              )}
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
  promoteBtn: {
    backgroundColor: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.4rem 0.8rem",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  promoteControls: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
  },
  promoteSelect: {
    padding: "0.3rem 0.4rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "0.85rem",
  },
  promoteSaveBtn: {
    backgroundColor: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.3rem 0.6rem",
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  promoteCancelBtn: {
    backgroundColor: "#e5e7eb",
    color: "#111827",
    border: "none",
    borderRadius: "6px",
    padding: "0.3rem 0.6rem",
    fontSize: "0.8rem",
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
