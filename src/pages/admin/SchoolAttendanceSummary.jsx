import React, { useState,useEffect } from "react";
import { endpoints } from "../../config/api";

const SchoolAttendanceSummary = ({ onBack }) => {
  const todayStr = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(todayStr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null); // backend se data
  const [view, setView] = useState("present"); // "present" | "absent"

  const handleFetch = async () => {
    if (!date) {
      setError("Please select a date");
      return;
    }

    setLoading(true);
    setError("");
    setSummary(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(endpoints.attendance.schoolSummary(date), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch summary");
      }

      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("School summary error:", err);
      setError(err.message || "Failed to fetch school summary");
    } finally {
      setLoading(false);
    }
  };

    // 🔹 AUTO LOAD TODAY'S SUMMARY ON PAGE LOAD
  useEffect(() => {
    handleFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleCardClick = (mode) => {
    setView(mode);
  };

  const formatDateLabel = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString();
  };

  const classesForTable = summary?.classes || [];

  const handleBackClick = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div style={styles.container}>
      {/* Header with back button */}
      <div style={styles.headerRow}>
        <button type="button" style={styles.backButton} onClick={handleBackClick}>
          ← Back
        </button>
        <h2 style={styles.heading}>School Attendance Summary</h2>
      </div>

      {/* Date + Fetch */}
      <div style={styles.formRow}>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSummary(null);
            setError("");
          }}
          style={styles.dateInput}
        />
        <button
          onClick={handleFetch}
          style={styles.fetchButton}
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Summary"}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Summary cards */}
      {summary && (
        <>
          <div style={styles.dateInfo}>
            Date: <strong>{formatDateLabel(summary.date)}</strong>
          </div>

          <div style={styles.cardsRow}>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Total Students</div>
              <div style={styles.cardValue}>{summary.totalStudents}</div>
            </div>

            <button
              style={{
                ...styles.card,
                ...styles.clickableCard,
                borderColor: view === "present" ? "#16a34a" : "#e5e7eb",
              }}
              onClick={() => handleCardClick("present")}
            >
              <div style={styles.cardLabel}>Present</div>
              <div style={{ ...styles.cardValue, color: "#16a34a" }}>
                {summary.totalPresent}
              </div>
              <div style={styles.cardHint}>Click to see per class</div>
            </button>

            <button
              style={{
                ...styles.card,
                ...styles.clickableCard,
                borderColor: view === "absent" ? "#dc2626" : "#e5e7eb",
              }}
              onClick={() => handleCardClick("absent")}
            >
              <div style={styles.cardLabel}>Not Present</div>
              <div style={{ ...styles.cardValue, color: "#dc2626" }}>
                {summary.totalAbsent}
              </div>
              <div style={styles.cardHint}>Click to see per class</div>
            </button>
          </div>

          {/* Per-class table */}
          <div style={styles.tableWrapper}>
            <h3 style={styles.tableTitle}>
              {view === "present"
                ? "Present students per class"
                : "Not present (absent + not marked) per class"}
            </h3>

            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6" }}>
                    <th style={styles.th}>Class</th>
                    <th style={styles.th}>Total Students</th>
                    <th style={styles.th}>Present</th>
                    <th style={styles.th}>Absent / Not Present</th>
                    <th style={styles.th}>Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classesForTable.map((item) => {
                    const notPresent = item.totalStudents - item.present;

                    // view filter: sirf woh rows jahan present/absent > 0
                    if (view === "present" && item.present === 0) return null;
                    if (view === "absent" && notPresent === 0) return null;

                    let statusLabel = "";
                    if (item.isSchoolClosed) {
                      statusLabel = "School Closed / Holiday";
                    } else if (!item.marked) {
                      statusLabel = "Not Marked";
                    } else {
                      statusLabel = "Marked";
                    }

                    return (
                      <tr key={item.class}>
                        <td style={styles.td}>{item.class || "-"}</td>
                        <td style={styles.tdCenter}>{item.totalStudents}</td>
                        <td style={{ ...styles.tdCenter, color: "#16a34a" }}>
                          {item.present}
                        </td>
                        <td style={{ ...styles.tdCenter, color: "#dc2626" }}>
                          {notPresent}
                        </td>
                        <td style={styles.td}>{statusLabel}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={styles.legend}>
              <div>
                🔹 <strong>Not Present</strong> = Total students − Present
              </div>
              <div>
                🔹 If attendance not marked, sabko “Not Present” count karega.
              </div>
              <div>
                🔹 School closed class: Present = 0, Not Present = total
                students (top summary me).
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "1rem 1rem 1.5rem",
    maxWidth: "1100px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI'",
    boxSizing: "border-box",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  backButton: {
    padding: "0.4rem 0.8rem",
    borderRadius: "999px",
    border: "1px solid #d1d5db",
    backgroundColor: "#2563eb",
    cursor: "pointer",
    fontSize: "0.85rem",
    color: "white",
  },
  heading: {
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: 0,
    flex: 1,
    textAlign: "left",
  },
  formRow: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  dateInput: {
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    minWidth: "180px",
    flex: "1 1 200px",
  },
  fetchButton: {
    padding: "0.55rem 1.1rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    flexShrink: 0,
  },
  error: {
    color: "#b91c1c",
    marginBottom: "0.75rem",
    fontSize: "0.9rem",
  },
  dateInfo: {
    marginBottom: "0.75rem",
    fontSize: "0.95rem",
  },
  cardsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.75rem",
    marginBottom: "1.25rem",
  },
  card: {
    padding: "0.9rem 1rem",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    backgroundColor: "white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },
  clickableCard: {
    cursor: "pointer",
    textAlign: "left",
  },
  cardLabel: {
    fontSize: "0.9rem",
    color: "#6b7280",
  },
  cardValue: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginTop: "0.2rem",
  },
  cardHint: {
    fontSize: "0.8rem",
    color: "#9ca3af",
    marginTop: "0.25rem",
  },
  tableWrapper: {
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    backgroundColor: "white",
    padding: "1rem",
  },
  tableTitle: {
    marginTop: 0,
    marginBottom: "0.75rem",
    fontSize: "1.05rem",
    fontWeight: "600",
  },
  tableScroll: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.9rem",
    minWidth: "600px", // mobile pe horizontal scroll ke liye
  },
  th: {
    padding: "0.5rem",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "center",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "0.45rem",
    borderBottom: "1px solid #f3f4f6",
    textAlign: "left",
  },
  tdCenter: {
    padding: "0.45rem",
    borderBottom: "1px solid #f3f4f6",
    textAlign: "center",
  },
  legend: {
    marginTop: "0.75rem",
    fontSize: "0.8rem",
    color: "#6b7280",
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
  },
};

export default SchoolAttendanceSummary;
