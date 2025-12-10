

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../config/api";
import { useTeachers } from "../../hooks/useTeachers";

const AssignTeacher = () => {
  const navigate = useNavigate();
  const { teachers, loading, error, refetch } = useTeachers();

  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [classSubjectsMap, setClassSubjectsMap] = useState({});
  const [teacherLocalState, setTeacherLocalState] = useState({});
  
  // Fetch classes & subject mapping
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const [classesRes, mappingRes] = await Promise.all([
          fetch(endpoints.classes.list, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(endpoints.classSubjects.getAll, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const classes = classesRes.ok ? await classesRes.json() : [];
        const mapping = mappingRes.ok ? await mappingRes.json() : {};
        setAllClasses(classes);
        setClassSubjectsMap(mapping);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    fetchData();
  }, []);

  // Initialize teacher assignments
  useEffect(() => {
    if (!teachers?.length) return;
    const init = {};
    teachers.forEach((t) => {
      const assignments = (t.teachingAssignments || []).map((a) => ({
        class: a.class,
        subjects: a.subjects || [],
        canMarkAttendance: !!a.canMarkAttendance,
      }));
      init[t._id] = { assignments };
    });
    setTeacherLocalState(init);
  }, [teachers]);

  // Toggle expand/collapse teacher card
  const toggleExpand = (id) => {
    setExpandedTeacher((prev) => (prev === id ? null : id));
  };

  // Toggle subject selection (clickable chips)
  const toggleSubject = (id, cls, subject) => {
    setTeacherLocalState((prev) => {
      const list = [...(prev[id]?.assignments || [])];
      const i = list.findIndex((a) => a.class === cls);
      if (i !== -1) {
        const subjects = list[i].subjects.includes(subject)
          ? list[i].subjects.filter((s) => s !== subject)
          : [...list[i].subjects, subject];
        list[i] = { ...list[i], subjects };
      }
      return { ...prev, [id]: { assignments: list } };
    });
  };

  // Toggle attendance
  const toggleAttendance = (id, cls) => {
    setTeacherLocalState((prev) => {
      const list = [...(prev[id]?.assignments || [])];
      const i = list.findIndex((a) => a.class === cls);
      if (i !== -1)
        list[i] = { ...list[i], canMarkAttendance: !list[i].canMarkAttendance };
      return { ...prev, [id]: { assignments: list } };
    });
  };

  const addClassToTeacher = (id, cls) =>
    setTeacherLocalState((prev) => {
      const current = prev[id] || { assignments: [] };
      if (current.assignments.some((a) => a.class === cls)) return prev;
      return {
        ...prev,
        [id]: {
          assignments: [
            ...current.assignments,
            { class: cls, subjects: [], canMarkAttendance: false },
          ],
        },
      };
    });

  const removeClassFromTeacher = (id, cls) =>
    setTeacherLocalState((prev) => ({
      ...prev,
      [id]: {
        assignments: (prev[id]?.assignments || []).filter((a) => a.class !== cls),
      },
    }));

  const saveAssignments = async (id, assignments) => {
    try {
      const res = await fetch(endpoints.teachers.assign(id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ teachingAssignments: assignments }),
      });
      if (res.ok) {
        alert("✅ Assignments saved successfully!");
        refetch();
      } else {
        alert("❌ Failed to save assignments.");
      }
    } catch {
      alert("⚠️ Network error");
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div style={styles.page}>
      <style>{`
        .teacher-list {
          background: white;
          border-radius: 14px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .teacher-header {
          padding: 1rem 1.2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          background: #f8fafc;
        }
        .teacher-header:hover {
          background: #eff6ff;
        }
        .teacher-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e3a8a;
        }
        .teacher-email {
          color: #475569;
          font-size: 0.9rem;
        }
        .teacher-body {
          padding: 1.2rem;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .subject-chip {
          display: inline-block;
          margin: 4px;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          border: 1px solid #cbd5e1;
          cursor: pointer;
          background: #fff;
          transition: 0.2s;
          font-size: 0.9rem;
        }
        .subject-chip.selected {
          background: #2563eb;
          color: white;
          border-color: #1d4ed8;
        }
        .save-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 0.7rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
        }
        .save-btn:hover {
          background: #059669;
        }
      `}</style>

      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 style={styles.title}>Assign Teachers</h1>
      </div>

      {teachers.map((t) => {
        const local = teacherLocalState[t._id] || { assignments: [] };
        const isOpen = expandedTeacher === t._id;
        const unassigned = allClasses.filter(
          (cls) => !local.assignments.some((a) => a.class === cls)
        );

        return (
          <div key={t._id} className="teacher-list">
            <div className="teacher-header" onClick={() => toggleExpand(t._id)}>
              <div>
                <div className="teacher-name">{t.name}</div>
                <div className="teacher-email">{t.email}</div>
              </div>
              <span style={{ fontSize: "1.3rem", color: "#64748b" }}>
                {isOpen ? "▲" : "▼"}
              </span>
            </div>

            {isOpen && (
              <div className="teacher-body">
                {local.assignments.map((a) => (
                  <div key={a.class} style={styles.classBox}>
                    <div style={styles.classHeader}>
                      <strong>Class: {a.class}</strong>
                      <button
                        onClick={() => removeClassFromTeacher(t._id, a.class)}
                        style={styles.removeBtn}
                      >
                        Remove
                      </button>
                    </div>

                    <div><strong>Subjects:</strong></div>
                    <div>
                      {(classSubjectsMap[a.class] || []).map((sub) => (
                        <span
                          key={sub}
                          className={`subject-chip ${
                            a.subjects.includes(sub) ? "selected" : ""
                          }`}
                          onClick={() => toggleSubject(t._id, a.class, sub)}
                        >
                          {sub}
                        </span>
                      ))}
                    </div>

                    <label style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                      <input
                        type="checkbox"
                        checked={a.canMarkAttendance}
                        onChange={() => toggleAttendance(t._id, a.class)}
                      />
                      Can mark attendance
                    </label>
                  </div>
                ))}

                {unassigned.length > 0 && (
                  <select
                    style={styles.addSelect}
                    onChange={(e) => {
                      const cls = e.target.value;
                      if (cls) addClassToTeacher(t._id, cls);
                      e.target.value = "";
                    }}
                  >
                    <option value="">+ Add New Class</option>
                    {unassigned.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  className="save-btn"
                  onClick={() => saveAssignments(t._id, local.assignments)}
                >
                  Save Assignments
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Styles
const styles = {
  page: {
    background: "linear-gradient(to bottom right, #e0f2fe, #ecfdf5)",
    minHeight: "100vh",
    padding: "2rem 1rem",
    fontFamily: "Poppins, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.8rem",
  },
  title: { fontSize: "1.7rem", fontWeight: 700, color: "#1e3a8a" },
  back: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.6rem 1.2rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  classBox: {
    background: "#f9fafb",
    borderRadius: "10px",
    padding: "0.8rem",
    marginBottom: "0.8rem",
    border: "1px solid #e2e8f0",
  },
  classHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  removeBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "0.3rem 0.6rem",
    cursor: "pointer",
  },
  addSelect: {
    width: "100%",
    padding: "0.6rem",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#fff",
    marginTop: "1rem",
  },
};

export default AssignTeacher;
