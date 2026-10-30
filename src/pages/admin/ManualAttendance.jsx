import React, { useState, useEffect } from "react";
import { endpoints } from "../../config/api";

const ManualAttendance = ({ onBack }) => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    class: "",
    session: "2025-26",
    totalWorkingDays: 220,
  });

  const handleBackClick = () => {
    if (typeof onBack === "function") onBack();
    else window.history.back();
  };

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await fetch(endpoints.classes.list, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          const classArray = Array.isArray(data) ? data : data.classes || [];
          setClasses(classArray.map((c) => c.name || c));
        }
      } catch (err) { console.error("Error loading classes:", err); }
    };
    loadClasses();
  }, []);

  useEffect(() => {
    if (!formData.class) { setStudents([]); return; }

    const loadStudents = async () => {
      setLoading(true);
      try {
        const res = await fetch(endpoints.students.list, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          const normalizedClass = String(formData.class).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
          const filtered = data.filter((s) => 
            String(s.class || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedClass
          );
          
          filtered.sort((a, b) => {
            const rollA = parseInt(a.rollNo, 10);
            const rollB = parseInt(b.rollNo, 10);
            return (!isNaN(rollA) && !isNaN(rollB)) ? rollA - rollB : String(a.rollNo || "").localeCompare(String(b.rollNo || ""));
          });

          const studentsWithAtt = filtered.map(s => {
            const existing = s.sessionAttendance?.find(a => a.session === formData.session);
            return { ...s, presentDays: existing ? existing.presentDays : 0 };
          });

          setStudents(studentsWithAtt);
        }
      } catch (err) { console.error("Error:", err); } 
      finally { setLoading(false); }
    };
    loadStudents();
  }, [formData.class, formData.session]);

  const handlePresentDaysChange = (studentId, value) => {
    const numVal = Math.max(0, Math.min(formData.totalWorkingDays, parseInt(value) || 0));
    setStudents(prev => prev.map(s => s._id === studentId ? { ...s, presentDays: numVal } : s));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    const payload = {
      session: formData.session,
      className: formData.class,
      totalWorkingDays: parseInt(formData.totalWorkingDays) || 0,
      studentData: students.map(s => ({ studentId: s._id, presentDays: s.presentDays })),
    };

    try {
      const res = await fetch(endpoints.students.manualAttendance, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "✅ Manual attendance saved successfully!" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={handleBackClick}>← Back</button>
        <h2 style={styles.heading}>Manual Session Attendance</h2>
      </div>

      <div style={styles.form}>
        <select name="class" value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })} style={styles.select}>
          <option value="">Select Class</option>
          {classes.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
        </select>
        <input type="text" name="session" placeholder="Session (e.g., 2025-26)" value={formData.session} onChange={(e) => setFormData({ ...formData, session: e.target.value })} style={styles.input} />
        <input type="number" name="totalWorkingDays" placeholder="Total Working Days" value={formData.totalWorkingDays} onChange={(e) => {
          setFormData({ ...formData, totalWorkingDays: e.target.value });
          setStudents(prev => prev.map(s => ({ ...s, presentDays: Math.min(s.presentDays, parseInt(e.target.value) || 0) })));
        }} style={styles.input} />
      </div>

      {message.text && (
        <div style={{ ...styles.message, backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da", color: message.type === "success" ? "#155724" : "#721c24" }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Loading data...</div>
      ) : students.length > 0 ? (
        <>
          <div style={styles.infoBox}>
            Enter the total days each student was <strong>Present</strong> out of <strong>{formData.totalWorkingDays} Total Working Days</strong> for the session <strong>{formData.session}</strong>.
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Roll No</th>
                  <th style={styles.th}>Student Name</th>
                  <th style={styles.th}>Total Working Days</th>
                  <th style={styles.th}>Days Present (Enter)</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu) => (
                  <tr key={stu._id}>
                    <td style={styles.td}>{stu.rollNo}</td>
                    <td style={{ ...styles.td, fontWeight: "600" }}>{stu.name}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>{formData.totalWorkingDays}</td>
                    <td style={styles.td}>
                      <input type="number" min="0" max={formData.totalWorkingDays} value={stu.presentDays} onChange={(e) => handlePresentDaysChange(stu._id, e.target.value)} style={styles.numberInput} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.buttonGroup}>
            <button onClick={handleSave} style={styles.saveBtn} disabled={loading}>
              {loading ? "Saving..." : "💾 Save Manual Attendance"}
            </button>
          </div>
        </>
      ) : (
        formData.class && <div style={styles.emptyState}>No students found in this class.</div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" },
  topBar: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
  heading: { flex: 1, textAlign: "center", margin: 0, color: "#2c3e50" },
  backBtn: { padding: "8px 16px", borderRadius: "8px", border: "none", background: "#2563eb", color: "white", cursor: "pointer", fontWeight: "bold" },
  form: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  select: { flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "150px" },
  input: { width: "150px", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" },
  infoBox: { backgroundColor: "#e0f2fe", padding: "12px", borderRadius: "8px", marginBottom: "15px", border: "1px solid #bae6fd", fontSize: "0.95rem" },
  tableWrapper: { overflowX: "auto", border: "1px solid #ddd", borderRadius: "8px" },
  table: { width: "100%", borderCollapse: "collapse", backgroundColor: "white" },
  th: { padding: "12px", textAlign: "left", backgroundColor: "#f8f9fa", borderBottom: "2px solid #ddd", fontWeight: "bold" },
  td: { padding: "10px 12px", borderBottom: "1px solid #eee" },
  numberInput: { width: "100px", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center", fontSize: "1rem" },
  buttonGroup: { marginTop: "20px", textAlign: "center" },
  saveBtn: { padding: "12px 24px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer" },
  loading: { textAlign: "center", padding: "20px", color: "#666" },
  emptyState: { textAlign: "center", padding: "20px", color: "#666", backgroundColor: "#f9f9f9", borderRadius: "8px" },
  message: { padding: "12px", borderRadius: "8px", marginBottom: "15px", fontWeight: "bold", textAlign: "center" },
};

export default ManualAttendance;