


// // src/pages/admin/AssignTeacher.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { endpoints } from "../../config/api";
// import { useTeachers } from "../../hooks/useTeachers";

// const AssignTeacher = () => {
//   const navigate = useNavigate();
//   const { teachers, loading, error, refetch } = useTeachers();

//   const [allClasses, setAllClasses] = useState([]);
//   const [classSubjectsMap, setClassSubjectsMap] = useState({});
//   const [teacherLocalState, setTeacherLocalState] = useState({});

//   // Fetch classes and subject mapping
//   useEffect(() => {
//     const fetchData = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       try {
//         const [classesRes, mappingRes] = await Promise.all([
//           fetch(endpoints.classes.list, {
//             headers: { Authorization: `Bearer ${token}` }
//           }),
//           fetch(endpoints.classSubjects.getAll, {
//             headers: { Authorization: `Bearer ${token}` }
//           })
//         ]);

//         const classes = classesRes.ok ? await classesRes.json() : [];
//         const mapping = mappingRes.ok ? await mappingRes.json() : {};

//         setAllClasses(classes);
//         setClassSubjectsMap(mapping);
//       } catch (err) {
//         console.error("Failed to load class/subject data", err);
//       }
//     };

//     fetchData();
//   }, []);

//   // Initialize local state from backend teacher data
//   useEffect(() => {
//     if (teachers.length === 0) return;

//     const init = {};
//     teachers.forEach((teacher) => {
//       const assignments = (teacher.teachingAssignments || []).map(a => ({
//         class: a.class,
//         subjects: Array.isArray(a.subjects) ? a.subjects : [],
//         canMarkAttendance: !!a.canMarkAttendance
//       }));
//       init[teacher._id] = { assignments };
//     });
//     setTeacherLocalState(init);
//   }, [teachers]);

//   // Add a class to a teacher
//   const addClassToTeacher = (teacherId, className) => {
//     setTeacherLocalState(prev => {
//       const current = prev[teacherId] || { assignments: [] };
//       if (current.assignments.some(a => a.class === className)) return prev;

//       return {
//         ...prev,
//         [teacherId]: {
//           assignments: [...current.assignments, {
//             class: className,
//             subjects: [],
//             canMarkAttendance: false
//           }]
//         }
//       };
//     });
//   };

//   // Remove a class from teacher
//   const removeClassFromTeacher = (teacherId, className) => {
//     setTeacherLocalState(prev => ({
//       ...prev,
//       [teacherId]: {
//         assignments: (prev[teacherId]?.assignments || []).filter(a => a.class !== className)
//       }
//     }));
//   };

//   // Update subjects for a specific class
//   const updateSubjectsForClass = (teacherId, className, subjects) => {
//     setTeacherLocalState(prev => {
//       const assignments = [...(prev[teacherId]?.assignments || [])];
//       const index = assignments.findIndex(a => a.class === className);
//       if (index !== -1) {
//         assignments[index] = { ...assignments[index], subjects };
//       }
//       return { ...prev, [teacherId]: { assignments } };
//     });
//   };

//   // Toggle attendance for a specific class
//   const toggleAttendanceForClass = (teacherId, className) => {
//     setTeacherLocalState(prev => {
//       const assignments = [...(prev[teacherId]?.assignments || [])];
//       const index = assignments.findIndex(a => a.class === className);
//       if (index !== -1) {
//         assignments[index] = {
//           ...assignments[index],
//           canMarkAttendance: !assignments[index].canMarkAttendance
//         };
//       }
//       return { ...prev, [teacherId]: { assignments } };
//     });
//   };

//   // Save all assignments for a teacher
//   const saveAssignments = async (teacherId, assignments) => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(endpoints.teachers.assign(teacherId), {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({ teachingAssignments: assignments })
//       });

//       if (res.ok) {
//         refetch(); // Refresh teacher list to reflect changes
//       } else {
//         const err = await res.json().catch(() => ({}));
//         alert("Save failed: " + (err.message || "Unknown error"));
//       }
//     } catch (err) {
//       console.error("Save error:", err);
//       alert("Network error – please try again");
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: "center", padding: "2rem", fontSize: "1.1rem" }}>
//         Loading teachers and class data...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ textAlign: "center", padding: "2rem", color: "red", fontSize: "1.1rem" }}>
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: "1.5rem", fontFamily: "Poppins, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
//       <style>{`
//         .header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 2rem;
//         }
//         .back-btn {
//           padding: 0.5rem 1rem;
//           background: #3498db;
//           color: white;
//           border: none;
//           border-radius: 8px;
//           cursor: pointer;
//           font-weight: 600;
//           font-size: 1rem;
//         }
//         .back-btn:hover {
//           background: #2980b9;
//         }
//         .page-title {
//           font-size: 1.8rem;
//           font-weight: 700;
//           color: #2c3e50;
//           margin: 0;
//         }
//         .card-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
//           gap: 1.8rem;
//         }
//         .teacher-card {
//           background: white;
//           border-radius: 12px;
//           padding: 1.4rem;
//           box-shadow: 0 4px 12px rgba(0,0,0,0.06);
//           border: 1px solid #eaeaea;
//         }
//         .teacher-header {
//           margin-bottom: 1.2rem;
//         }
//         .teacher-name {
//           font-size: 1.25rem;
//           font-weight: 700;
//           color: #2980b9;
//           margin: 0 0 0.3rem;
//         }
//         .teacher-email {
//           font-size: 0.9rem;
//           color: #7f8c8d;
//         }
//         .class-section {
//           margin-bottom: 1.4rem;
//         }
//         .class-item {
//           background: #f8fafc;
//           border: 1px solid #e2e8f0;
//           border-radius: 10px;
//           padding: 1rem;
//           margin-bottom: 0.8rem;
//         }
//         .class-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 0.8rem;
//           font-weight: 600;
//           color: #1e293b;
//           font-size: 1.05rem;
//         }
//         .remove-class-btn {
//           background: #ef4444;
//           color: white;
//           border: none;
//           border-radius: 6px;
//           padding: 0.3rem 0.6rem;
//           cursor: pointer;
//           font-size: 0.85rem;
//         }
//         .subjects-select {
//           width: 100%;
//           padding: 0.5rem;
//           border: 1px solid #cbd5e1;
//           border-radius: 8px;
//           background: white;
//           margin: 0.4rem 0;
//         }
//         .attendance-row {
//           display: flex;
//           align-items: center;
//           gap: 0.7rem;
//           margin-top: 0.6rem;
//         }
//         .attendance-row input[type="checkbox"] {
//           width: 18px;
//           height: 18px;
//           cursor: pointer;
//         }
//         .attendance-row label {
//           font-size: 0.95rem;
//           color: #334155;
//           cursor: pointer;
//         }
//         .add-class-select {
//           width: 100%;
//           padding: 0.6rem;
//           border: 1px solid #cbd5e1;
//           border-radius: 8px;
//           margin: 1rem 0;
//           background: white;
//         }
//         .save-btn {
//           width: 100%;
//           padding: 0.7rem;
//           background: #10b981;
//           color: white;
//           border: none;
//           border-radius: 8px;
//           font-weight: 600;
//           font-size: 1.05rem;
//           cursor: pointer;
//           transition: background 0.2s;
//         }
//         .save-btn:hover {
//           background: #0da271;
//         }
//         @media (max-width: 768px) {
//           .card-grid {
//             grid-template-columns: 1fr;
//           }
//           .header {
//             flex-direction: column;
//             gap: 1rem;
//             align-items: flex-start;
//           }
//         }
//       `}</style>

//       <div className="header">
//         <button className="back-btn" onClick={() => navigate(-1)}>
//           ← Back
//         </button>
//         <h1 className="page-title">Assign Teachers (Class & Subject Wise)</h1>
//       </div>

//       <div className="card-grid">
//         {teachers.map((teacher) => {
//           const local = teacherLocalState[teacher._id] || { assignments: [] };
//           const assignments = local.assignments;
//           const unassignedClasses = allClasses.filter(cls =>
//             !assignments.some(a => a.class === cls)
//           );

//           return (
//             <div className="teacher-card" key={teacher._id}>
//               <div className="teacher-header">
//                 <h2 className="teacher-name">{teacher.name}</h2>
//                 <div className="teacher-email">{teacher.email}</div>
//               </div>

//               <div className="class-section">
//                 {assignments.map((item) => (
//                   <div className="class-item" key={item.class}>
//                     <div className="class-header">
//                       <span>Class: {item.class}</span>
//                       <button
//                         className="remove-class-btn"
//                         onClick={() => removeClassFromTeacher(teacher._id, item.class)}
//                       >
//                         Remove
//                       </button>
//                     </div>

//                     <label>Subjects:</label>
//                     <select
//                       className="subjects-select"
//                       multiple
//                       value={item.subjects || []}
//                       onChange={(e) => {
//                         const selected = Array.from(e.target.selectedOptions, opt => opt.value);
//                         updateSubjectsForClass(teacher._id, item.class, selected);
//                       }}
//                     >
//                       {(classSubjectsMap[item.class] || []).map((subject) => (
//                         <option key={subject} value={subject}>
//                           {subject}
//                         </option>
//                       ))}
//                     </select>

//                     <div className="attendance-row">
//                       <input
//                         type="checkbox"
//                         id={`att-${teacher._id}-${item.class}`}
//                         checked={item.canMarkAttendance || false}
//                         onChange={() => toggleAttendanceForClass(teacher._id, item.class)}
//                       />
//                       <label htmlFor={`att-${teacher._id}-${item.class}`}>
//                         Can mark attendance for {item.class}
//                       </label>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Add new class dropdown */}
//               {unassignedClasses.length > 0 && (
//                 <>
//                   <label>Add New Class:</label>
//                   <select
//                     className="add-class-select"
//                     onChange={(e) => {
//                       const cls = e.target.value;
//                       if (cls) {
//                         addClassToTeacher(teacher._id, cls);
//                         e.target.value = ""; // reset
//                       }
//                     }}
//                   >
//                     <option value="">— Select a class —</option>
//                     {unassignedClasses.map((cls) => (
//                       <option key={cls} value={cls}>
//                         {cls}
//                       </option>
//                     ))}
//                   </select>
//                 </>
//               )}

//               <button
//                 className="save-btn"
//                 onClick={() => saveAssignments(teacher._id, assignments)}
//               >
//                 Save Assignments
//               </button>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default AssignTeacher;

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
