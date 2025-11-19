

// // src/components/AddMarks.jsx
// import React, { useState, useEffect } from "react";
// import { endpoints } from "../../config/api";

// const AddMarks = () => {
//   const [students, setStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState("");
//   const [marks, setMarks] = useState({});
//   const [subjects, setSubjects] = useState([]);
//   const [message, setMessage] = useState("");
//   const [loadingStudents, setLoadingStudents] = useState(true);
//   const [loadingMarks, setLoadingMarks] = useState(false);
//   const [classSubjectMap, setClassSubjectMap] = useState({});
//   const [teacherAssignments, setTeacherAssignments] = useState([]);

//   // Fetch teacher assignments
//   useEffect(() => {
//     const fetchTeacherAssignments = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await fetch(endpoints.auth.me, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (res.ok) {
//           const teacher = await res.json();
//           setTeacherAssignments(teacher.teachingAssignments || []);
//         }
//       } catch (err) {
//         console.error("Failed to load teacher assignments", err);
//       }
//     };
//     fetchTeacherAssignments();
//   }, []);

//   // Fetch class-subject mapping
//   useEffect(() => {
//     const fetchClassSubjects = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await fetch(endpoints.classSubjects.getAll, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (res.ok) {
//           const mapping = await res.json();
//           setClassSubjectMap(mapping);
//         }
//       } catch (err) {
//         console.error("Failed to load class-subject mapping", err);
//       }
//     };
//     fetchClassSubjects();
//   }, []);

//   // Fetch assigned students
//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const res = await fetch(endpoints.students.myStudents, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });
//         if (!res.ok) throw new Error("Failed to load students");
//         const data = await res.json();
//         setStudents(Array.isArray(data) ? data : []);
//         if (Array.isArray(data) && data.length === 0) {
//           setMessage("⚠️ No students found. You may not have any assigned classes.");
//         }
//       } catch (err) {
//         console.error("Error fetching students:", err);
//         setMessage(`❌ Failed to load students: ${err.message}`);
//       } finally {
//         setLoadingStudents(false);
//       }
//     };
//     fetchStudents();
//   }, []);

//   // Load marks when student is selected
//   useEffect(() => {
//     if (!selectedStudent) {
//       setMarks({});
//       setSubjects([]);
//       return;
//     }

//     const loadMarksForStudent = async () => {
//       setLoadingMarks(true);
//       setMessage("");

//       const student = students.find(stu => String(stu._id) === String(selectedStudent));
//       if (!student || !student.class) {
//         setLoadingMarks(false);
//         return;
//       }

//       const assignment = teacherAssignments.find(a => a.class === student.class);
//       const allowedSubjects = assignment ? assignment.subjects || [] : [];
//       setSubjects(allowedSubjects);

//       const initialMarks = {};
//       ["pa1", "pa2", "halfYear", "pa3", "pa4", "final"].forEach((exam) => {
//         initialMarks[exam] = {};
//         allowedSubjects.forEach((sub) => {
//           initialMarks[exam][sub] = "";
//         });
//       });

//       try {
//         const res = await fetch(endpoints.marks.getStudent(selectedStudent), {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });

//         if (res.ok) {
//           const data = await res.json();
//           if (data && data.exams) {
//             Object.keys(initialMarks).forEach((exam) => {
//               if (data.exams[exam]) {
//                 allowedSubjects.forEach((sub) => {
//                   const savedValue = data.exams[exam][sub];
//                   if (savedValue !== undefined && savedValue !== null) {
//                     initialMarks[exam][sub] = savedValue;
//                   }
//                 });
//               }
//             });
//           }
//         }
//         setMarks(initialMarks);
//       } catch (err) {
//         console.error("Error loading existing marks:", err);
//         setMessage("⚠️ Could not load saved marks. You can still enter new ones.");
//         setMarks(initialMarks);
//       } finally {
//         setLoadingMarks(false);
//       }
//     };
//     loadMarksForStudent();
//   }, [selectedStudent, students, teacherAssignments]);

//   const handleChange = (exam, subject, value) => {
//     if (value === "" || value === null) {
//       setMarks((prev) => ({
//         ...prev,
//         [exam]: { ...prev[exam], [subject]: "" },
//       }));
//       return;
//     }

//     const num = Number(value);
//     if (isNaN(num) || num < 0 || num > 100) return;

//     setMarks((prev) => ({
//       ...prev,
//       [exam]: { ...prev[exam], [subject]: num },
//     }));
//   };

//   // ✅ Save marks for a single subject in a specific exam
//   const handleSaveSingle = async (exam, subject) => {
//     if (!selectedStudent) return;

//     const value = marks[exam]?.[subject];
//     if (value === "" || value === undefined || value === null) {
//       setMessage("⚠️ Enter a valid mark before saving.");
//       return;
//     }

//     setMessage(`💾 Saving ${subject} (${exam})...`);

//     try {
//       // Fetch current full marks from server
//       const fetchRes = await fetch(endpoints.marks.getStudent(selectedStudent), {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });

//       let currentExams = {
//         pa1: {}, pa2: {}, halfYear: {}, pa3: {}, pa4: {}, final: {}
//       };

//       if (fetchRes.ok) {
//         const data = await fetchRes.json();
//         if (data?.exams) currentExams = data.exams;
//       }

//       // Update only the changed subject
//       currentExams[exam] = {
//         ...currentExams[exam],
//         [subject]: value,
//       };

//       // Save full object back
//       const saveRes = await fetch(endpoints.marks.save(selectedStudent), {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({ exams: currentExams }),
//       });

//       const saveData = await saveRes.json();
//       setMessage(
//         saveRes.ok
//           ? `✅ ${subject} saved for ${exam}!`
//           : saveData.message || "❌ Failed to save marks"
//       );

//       // Optional: Re-fetch to stay in sync (not strictly needed, but safe)
//       // You can skip this to reduce API calls if confident

//     } catch (err) {
//       console.error("Save error:", err);
//       setMessage("⚠️ Network error. Please try again.");
//     }
//   };

//   return (
//     <div>
//       <style>{`
//         .container {
//           max-width: 750px;
//           margin: 20px auto;
//           padding: 20px;
//           border: 1px solid #ddd;
//           border-radius: 12px;
//           background: white;
//           box-shadow: 0 4px 12px rgba(0,0,0,0.08);
//           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//           width: 95%;
//           box-sizing: border-box;
//         }

//         h2 {
//           text-align: center;
//           color: #2c3e50;
//           margin-bottom: 20px;
//           font-size: 1.5rem;
//         }

//         label {
//           font-weight: 600;
//           margin-bottom: 6px;
//           color: #34495e;
//           font-size: 0.95rem;
//         }

//         select, input {
//           padding: 10px;
//           border: 1px solid #ccc;
//           border-radius: 6px;
//           width: 100%;
//           font-size: 15px;
//           box-sizing: border-box;
//         }

//         .message {
//           text-align: center;
//           margin-top: 15px;
//           padding: 10px;
//           border-radius: 6px;
//           font-weight: bold;
//         }

//         .message:empty {
//           display: none;
//         }

//         .exam-section {
//           border: 1px solid #e0e0e0;
//           padding: 16px;
//           border-radius: 10px;
//           background-color: #f8f9fa;
//           margin-bottom: 16px;
//         }

//         .exam-title {
//           font-weight: bold;
//           margin-bottom: 14px;
//           color: #e74c3c;
//           font-size: 1.1rem;
//         }

//         .subject-row {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 12px;
//           flex-wrap: wrap;
//           gap: 8px;
//         }

//         .subject-label {
//           min-width: 120px;
//           font-size: 14px;
//           flex: 1;
//           word-break: break-word;
//         }

//         input[type="number"] {
//           width: 90px;
//           max-width: 100px;
//           text-align: center;
//           padding: 8px;
//           font-size: 15px;
//           flex-shrink: 0;
//         }

//         .student-info {
//           background: #e8f4fc;
//           padding: 12px;
//           border-radius: 8px;
//           margin-top: 10px;
//           font-size: 14px;
//           color: #2980b9;
//           word-break: break-word;
//         }

//         .loading {
//           text-align: center;
//           color: #7f8c8d;
//           font-style: italic;
//           font-size: 14px;
//         }

//         .no-subjects {
//           padding: 12px;
//           background: #fff3cd;
//           border: 1px solid #ffeaa7;
//           border-radius: 6px;
//           color: #856404;
//           font-size: 14px;
//         }

//         .save-btn {
//           background: #3498db;
//           color: white;
//           border: none;
//           border-radius: 4px;
//           padding: 6px 10px;
//           font-size: 14px;
//           cursor: pointer;
//           white-space: nowrap;
//         }

//         .save-btn:hover:not(:disabled) {
//           background: #2980b9;
//         }

//         .save-btn:disabled {
//           background: #bdc3c7;
//           cursor: not-allowed;
//         }

//         @media (max-width: 600px) {
//           .container {
//             padding: 16px;
//             margin: 10px;
//           }

//           h2 {
//             font-size: 1.3rem;
//             margin-bottom: 16px;
//           }

//           .subject-row {
//             flex-direction: column;
//             align-items: flex-start;
//             gap: 6px;
//           }

//           .subject-label {
//             min-width: auto;
//             width: 100%;
//           }

//           input[type="number"] {
//             width: 100%;
//             max-width: 100%;
//             height: auto;
//           }

//           .save-btn {
//             width: 100%;
//             margin-top: 4px;
//           }
//         }
//       `}</style>

//       <div className="container">
//         <h2>Add / Update Student Marks</h2>

//         {loadingStudents ? (
//           <p className="loading">Loading students...</p>
//         ) : (
//           <>
//             <label>Select Student:</label>
//             <select
//               value={selectedStudent}
//               onChange={(e) => setSelectedStudent(e.target.value)}
//               disabled={loadingMarks}
//             >
//               <option value="">-- Choose a student --</option>
//               {students.map((stu) => (
//                 <option key={stu._id} value={stu._id}>
//                   {stu.name} (Class: {stu.class}, Roll: {stu.rollNo})
//                 </option>
//               ))}
//             </select>

//             {selectedStudent && (
//               <div className="student-info">
//                 {(() => {
//                   const stu = students.find(s => String(s._id) === String(selectedStudent));
//                   return stu ? `✅ Selected: ${stu.name} | Class: ${stu.class} | Section: ${stu.section || 'A'}` : "";
//                 })()}
//               </div>
//             )}

//             {loadingMarks && selectedStudent && (
//               <p className="loading">Loading existing marks...</p>
//             )}

//             {!loadingMarks && subjects.length === 0 && selectedStudent && (
//               <div className="no-subjects">
//                 ⚠️ No subjects assigned to class <strong>{students.find(s => String(s._id) === String(selectedStudent))?.class}</strong>.
//                 Please assign subjects in <strong>Class & Subject Manager</strong>.
//               </div>
//             )}

//             {!loadingMarks && subjects.length > 0 && selectedStudent && (
//               ["pa1", "pa2", "halfYear", "pa3", "pa4", "final"].map((exam) => (
//                 <div className="exam-section" key={exam}>
//                   <div className="exam-title">
//                     {exam
//                       .replace(/([A-Z])/g, ' $1')
//                       .replace(/^./, str => str.toUpperCase())}
//                   </div>
//                   {subjects.map((subject) => {
//                     const currentValue = marks[exam]?.[subject] !== undefined ? marks[exam][subject] : "";
//                     return (
//                       <div className="subject-row" key={`${exam}-${subject}`}>
//                         <span className="subject-label">{subject}:</span>
//                         <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
//                           <input
//                             type="number"
//                             min="0"
//                             max="100"
//                             value={currentValue}
//                             onChange={(e) => handleChange(exam, subject, e.target.value)}
//                             placeholder="0–100"
//                             disabled={loadingMarks}
//                           />
//                           <button
//                             type="button"
//                             className="save-btn"
//                             onClick={() => handleSaveSingle(exam, subject)}
//                             disabled={loadingMarks || currentValue === ""}
//                           >
//                             💾 Save
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ))
//             )}
//           </>
//         )}

//         <div
//           className="message"
//           style={{
//             color: message.includes("✅")
//               ? "green"
//               : message.includes("❌") || message.includes("⚠️")
//                 ? "red"
//                 : "#e67e22",
//           }}
//         >
//           {message}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddMarks;
import React, { useState, useEffect } from "react";
import { endpoints } from "../../config/api";

const AddMarks = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [marks, setMarks] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [visibleExams, setVisibleExams] = useState([]);

  // Fetch visible exams
  useEffect(() => {
    const loadVisibleExams = async () => {
      try {
        const res = await fetch(endpoints.settings.getExamVisibility, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (res.ok) {
          const data = await res.json();
          setVisibleExams(data.visibleExams || []);
        }
      } catch (err) {
        console.error("Error loading exam visibility", err);
      }
    };

    loadVisibleExams();
  }, []);

  // Fetch teacher assignments
  useEffect(() => {
    const fetchTeacherAssignments = async () => {
      try {
        const res = await fetch(endpoints.auth.me, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.ok) {
          const teacher = await res.json();
          setTeacherAssignments(teacher.teachingAssignments || []);
        }
      } catch (err) {
        console.error("Failed to load teacher assignments", err);
      }
    };
    fetchTeacherAssignments();
  }, []);

  // Fetch my students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(endpoints.students.myStudents, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setStudents(data || []);
      } catch (err) {
        setMessage("❌ Failed to load students");
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  // Load marks per student
  useEffect(() => {
    if (!selectedStudent) return;

    const loadMarks = async () => {
      setLoadingMarks(true);
      const student = students.find(s => s._id === selectedStudent);
      const assignment = teacherAssignments.find(a => a.class === student?.class);
      const allowedSubjects = assignment ? assignment.subjects : [];
      setSubjects(allowedSubjects);

      const initialMarks = {};
      visibleExams.forEach(ex => {
        initialMarks[ex] = {};
        allowedSubjects.forEach(sub => (initialMarks[ex][sub] = ""));
      });

      try {
        const res = await fetch(endpoints.marks.getStudent(selectedStudent), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          visibleExams.forEach(exam => {
            if (data.exams?.[exam]) {
              allowedSubjects.forEach(sub => {
                initialMarks[exam][sub] = data.exams[exam][sub] ?? "";
              });
            }
          });
        }
      } catch {}
      setMarks(initialMarks);
      setLoadingMarks(false);
    };

    if (visibleExams.length > 0) loadMarks();
  }, [selectedStudent, visibleExams]);

  const handleChange = (exam, subject, value) => {
    const num = Number(value);
    if (num < 0 || num > 100) return;

    setMarks(prev => ({
      ...prev,
      [exam]: { ...prev[exam], [subject]: value }
    }));
  };

  const saveSingle = async (exam, subject) => {
    const value = marks[exam][subject];
    if (value === "") return setMessage("⚠ Enter valid marks");

    try {
      const res = await fetch(endpoints.marks.save(selectedStudent), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ exams: { [exam]: { [subject]: value } } }),
      });

      const data = await res.json();
      setMessage(res.ok ? "✅ Saved!" : data.message);
    } catch {
      setMessage("❌ Error saving");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Add / Update Student Marks</h2>

        {/* Student Dropdown */}
        <label style={styles.label}>Select Student</label>
        <select
          style={styles.dropdown}
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Choose --</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} (Class {s.class})
            </option>
          ))}
        </select>

        {/* No exams enabled */}
        {visibleExams.length === 0 && (
          <p style={styles.warning}>⚠ No exam enabled by admin.</p>
        )}

        {/* Ask to select student */}
        {visibleExams.length > 0 && !selectedStudent && (
          <p style={styles.info}>Please select a student to continue.</p>
        )}

        {/* Exams */}
        {selectedStudent &&
          subjects.length > 0 &&
          visibleExams.map((exam) => (
            <div key={exam} style={styles.examCard}>
              <h3 style={styles.examTitle}>{exam.toUpperCase()}</h3>

              {subjects.map((sub) => (
                <div style={styles.subjectRow} key={sub}>
                  <span style={styles.subjectLabel}>{sub}</span>

                  <input
                    style={styles.input}
                    type="number"
                    value={marks[exam]?.[sub] ?? ""}
                    onChange={(e) => handleChange(exam, sub, e.target.value)}
                  />

                  <button
                    style={styles.saveBtn}
                    onClick={() => saveSingle(exam, sub)}
                  >
                    Save
                  </button>
                </div>
              ))}
            </div>
          ))}

        {message && (
          <p
            style={{
              color: message.includes("✅") ? "green" : "red",
              marginTop: "15px",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    padding: "20px",
    background: "#f4f6f9",
    minHeight: "100vh",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    background: "white",
    borderRadius: "14px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  label: { fontWeight: "600", marginBottom: "5px", display: "block" },
  dropdown: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "20px",
  },
  examCard: {
    background: "#f9fbff",
    border: "1px solid #dbe7ff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  examTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "12px",
    color: "#1e40af",
  },
  subjectRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  subjectLabel: { width: "140px", fontWeight: "500" },
  input: {
    width: "100px",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  saveBtn: {
    padding: "8px 12px",
    background: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  warning: { color: "red", fontWeight: "bold", marginTop: "10px" },
  info: { color: "#555", marginTop: "10px" },
};

export default AddMarks;
