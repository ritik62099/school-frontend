


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
//   const [teacherAssignments, setTeacherAssignments] = useState([]);
//   const [visibleExams, setVisibleExams] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [classes, setClasses] = useState([]);
//   const [rowStatus, setRowStatus] = useState({}); // ✅ per-row status

//   // Fetch visible exams
//   useEffect(() => {
//     const loadVisibleExams = async () => {
//       try {
//         const res = await fetch(endpoints.settings.getExamVisibility, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
//         });

//         if (res.ok) {
//           const data = await res.json();
//           setVisibleExams(data.visibleExams || []);
//         }
//       } catch (err) {
//         console.error("Error loading exam visibility", err);
//       }
//     };

//     loadVisibleExams();
//   }, []);

//   // Fetch teacher assignments
//   useEffect(() => {
//     const fetchTeacherAssignments = async () => {
//       try {
//         const res = await fetch(endpoints.auth.me, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });

//         if (res.ok) {
//           const teacher = await res.json();

//           const assignments = teacher.teachingAssignments || [];
//           setTeacherAssignments(assignments);

//           const classList = [...new Set(assignments.map(a => a.class))];
//           setClasses(classList);
//         }
//       } catch (err) {
//         console.error("Failed to load teacher assignments", err);
//       }
//     };
//     fetchTeacherAssignments();
//   }, []);

//   // Fetch my students
//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const res = await fetch(endpoints.students.myStudents, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });
//         const data = await res.json();
//         setStudents(data || []);
//       } catch (err) {
//         setMessage("❌ Failed to load students");
//       } finally {
//         setLoadingStudents(false);
//       }
//     };
//     fetchStudents();
//   }, []);

//   const filteredStudents = selectedClass
//     ? students.filter(s => s.class === selectedClass)
//     : [];

//   // Load marks per student
//   useEffect(() => {
//     if (!selectedStudent) return;

//     const loadMarks = async () => {
//       setLoadingMarks(true);
//       const student = students.find(s => s._id === selectedStudent);
//       const assignment = teacherAssignments.find(a => a.class === student?.class);
//       const allowedSubjects = assignment ? assignment.subjects : [];
//       setSubjects(allowedSubjects);

//       const initialMarks = {};
//       visibleExams.forEach(ex => {
//         initialMarks[ex] = {};
//         allowedSubjects.forEach(sub => (initialMarks[ex][sub] = ""));
//       });

//       try {
//         const res = await fetch(endpoints.marks.getStudent(selectedStudent), {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });
//         if (res.ok) {
//           const data = await res.json();
//           visibleExams.forEach(exam => {
//             if (data.exams?.[exam]) {
//               allowedSubjects.forEach(sub => {
//                 initialMarks[exam][sub] = data.exams[exam][sub] ?? "";
//               });
//             }
//           });
//         }
//       } catch {
//         // ignore
//       }
//       setMarks(initialMarks);
//       setRowStatus({}); // ✅ reset row status when student change / marks reload
//       setLoadingMarks(false);
//     };

//     if (visibleExams.length > 0) loadMarks();
//   }, [selectedStudent, visibleExams, students, teacherAssignments]);

//   const handleChange = (exam, subject, value) => {
//     const num = Number(value);
//     if (value !== "" && (num < 0 || num > 100)) return;

//     setMarks(prev => ({
//       ...prev,
//       [exam]: { ...prev[exam], [subject]: value }
//     }));

//     // value change hone par status reset kar do
//     setRowStatus(prev => ({
//       ...prev,
//       [exam]: {
//         ...(prev[exam] || {}),
//         [subject]: undefined,
//       },
//     }));
//   };

//   const saveSingle = async (exam, subject) => {
//     const value = marks[exam]?.[subject];
//     if (value === "" || value === undefined) {
//       setMessage("⚠ Enter valid marks");
//       return;
//     }

//     // ✅ Row ko "saving" state pe daal do
//     setRowStatus(prev => ({
//       ...prev,
//       [exam]: {
//         ...(prev[exam] || {}),
//         [subject]: "saving",
//       },
//     }));

//     try {
//       const res = await fetch(endpoints.marks.save(selectedStudent), {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({ exams: { [exam]: { [subject]: value } } }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMessage("✅ Saved!");
//         setRowStatus(prev => ({
//           ...prev,
//           [exam]: {
//             ...(prev[exam] || {}),
//             [subject]: "saved",
//           },
//         }));
//       } else {
//         setMessage(data.message || "❌ Error saving");
//         setRowStatus(prev => ({
//           ...prev,
//           [exam]: {
//             ...(prev[exam] || {}),
//             [subject]: "error",
//           },
//         }));
//       }
//     } catch {
//       setMessage("❌ Error saving");
//       setRowStatus(prev => ({
//         ...prev,
//         [exam]: {
//           ...(prev[exam] || {}),
//           [subject]: "error",
//         },
//       }));
//     }
//   };

//   return (
//     <div style={styles.wrapper}>
//       <div style={styles.container}>
//         <h2 style={styles.title}>Add / Update Student Marks</h2>

//         {/* Class Dropdown */}
//         <label style={styles.label}>Select Class</label>
//         <select
//           style={styles.dropdown}
//           value={selectedClass}
//           onChange={(e) => {
//             setSelectedClass(e.target.value);
//             setSelectedStudent("");
//             setMarks({});
//             setRowStatus({});
//           }}
//         >
//           <option value="">-- Select Class --</option>
//           {classes.map((cls) => (
//             <option key={cls} value={cls}>
//               Class {cls}
//             </option>
//           ))}
//         </select>

//         {/* Student Dropdown */}
//         {/* Student Dropdown */}
// <label style={styles.label}>Select Student</label>
// <select
//   style={styles.dropdown}
//   value={selectedStudent}
//   disabled={!selectedClass}
//   onChange={(e) => {
//     setSelectedStudent(e.target.value);
//     setMessage("");
//   }}
// >
//   <option value="">-- Select Student --</option>

//   {filteredStudents.map((s) => {
//     const roll =
//       s.rollNo || s.roll || s.roll_number || s.rno || "No Roll"; // ← auto detect roll no field

//     return (
//       <option key={s._id} value={s._id}>
//         {/* {s.name} ({roll}) ← NOW SHOWING NAME + ROLL */}
//          {roll} - {s.name}
//       </option>
//     );
//   })}
// </select>


//         {/* No exams enabled */}
//         {visibleExams.length === 0 && (
//           <p style={styles.warning}>⚠ No exam enabled by admin.</p>
//         )}

//         {/* Ask to select student */}
//         {visibleExams.length > 0 && !selectedStudent && (
//           <p style={styles.info}>Please select a student to continue.</p>
//         )}

//         {/* Exams */}
//         {selectedStudent &&
//           subjects.length > 0 &&
//           visibleExams.map((exam) => (
//             <div key={exam} style={styles.examCard}>
//               <h3 style={styles.examTitle}>{exam.toUpperCase()}</h3>

//               {subjects.map((sub) => (
//                 <div style={styles.subjectRow} key={sub}>
//                   <span style={styles.subjectLabel}>{sub}</span>

//                   <input
//                     style={styles.input}
//                     type="number"
//                     value={marks[exam]?.[sub] ?? ""}
//                     onChange={(e) => handleChange(exam, sub, e.target.value)}
//                   />

//                   <button
//                     style={{
//                       ...styles.saveBtn,
//                       background:
//                         rowStatus[exam]?.[sub] === "saved"
//                           ? "#16a34a" // green
//                           : rowStatus[exam]?.[sub] === "saving"
//                           ? "#6b7280" // grey
//                           : styles.saveBtn.background,
//                       cursor:
//                         rowStatus[exam]?.[sub] === "saving"
//                           ? "not-allowed"
//                           : "pointer",
//                     }}
//                     disabled={rowStatus[exam]?.[sub] === "saving"}
//                     onClick={() => saveSingle(exam, sub)}
//                   >
//                     {rowStatus[exam]?.[sub] === "saving"
//                       ? "Saving..."
//                       : rowStatus[exam]?.[sub] === "saved"
//                       ? "Saved ✓"
//                       : "Save"}
//                   </button>

//                   {rowStatus[exam]?.[sub] === "error" && (
//                     <span style={{ color: "red", fontSize: "12px" }}>
//                       Error saving
//                     </span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           ))}

//         {message && (
//           <p
//             style={{
//               color: message.includes("✅") ? "green" : "red",
//               marginTop: "15px",
//               fontWeight: "bold",
//             }}
//           >
//             {message}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// const styles = {
//   wrapper: {
//     padding: "20px",
//     background: "#f4f6f9",
//     minHeight: "100vh",
//   },
//   container: {
//     maxWidth: "800px",
//     margin: "0 auto",
//     padding: "20px",
//     background: "white",
//     borderRadius: "14px",
//     boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
//   },
//   title: {
//     textAlign: "center",
//     fontSize: "22px",
//     fontWeight: "bold",
//     marginBottom: "20px",
//   },
//   label: { fontWeight: "600", marginBottom: "5px", display: "block" },
//   dropdown: {
//     width: "100%",
//     padding: "10px",
//     borderRadius: "8px",
//     border: "1px solid #ccc",
//     marginBottom: "20px",
//   },
//   examCard: {
//     background: "#f9fbff",
//     border: "1px solid #dbe7ff",
//     padding: "15px",
//     borderRadius: "10px",
//     marginBottom: "20px",
//   },
//   examTitle: {
//     fontSize: "18px",
//     fontWeight: "bold",
//     marginBottom: "12px",
//     color: "#1e40af",
//   },
//   subjectRow: {
//     display: "flex",
//     gap: "10px",
//     alignItems: "center",
//     marginBottom: "10px",
//     flexWrap: "wrap",
//   },
//   subjectLabel: { width: "140px", fontWeight: "500" },
//   input: {
//     width: "100px",
//     padding: "8px",
//     borderRadius: "6px",
//     border: "1px solid #ccc",
//   },
//   saveBtn: {
//     padding: "8px 12px",
//     background: "#1e3a8a",
//     color: "white",
//     border: "none",
//     borderRadius: "6px",
//     cursor: "pointer",
//   },
//   warning: { color: "red", fontWeight: "bold", marginTop: "10px" },
//   info: { color: "#555", marginTop: "10px" },
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
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState([]);

  const [rowStatus, setRowStatus] = useState({});
  const [userRole, setUserRole] = useState(null);         // "admin" / "teacher"
  const [classSubjectsMap, setClassSubjectsMap] = useState({}); // { "1": ["Math","Eng"], ... }

  // 🔹 Fetch visible exams
  useEffect(() => {
    const loadVisibleExams = async () => {
      try {
        const res = await fetch(endpoints.settings.getExamVisibility, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

  // 🔹 Fetch current user (role + teacher assignments)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(endpoints.auth.me, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) return;
        const user = await res.json();

        const role = user.role || "teacher";
        setUserRole(role);

        if (role === "teacher") {
          const assignments = user.teachingAssignments || [];
          setTeacherAssignments(assignments);

          // teacher ke liye classes -> assignments se
          const classList = [...new Set(assignments.map((a) => a.class))];
          setClasses(classList);
        }
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };

    fetchUser();
  }, []);

  // 🔹 Fetch class-subjects mapping (admin + teacher dono use kar sakte hain)
  useEffect(() => {
    const fetchClassSubjects = async () => {
      try {
        const res = await fetch(endpoints.classSubjects.getAll, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) return;
        const data = await res.json();

        // AssignTeacher se dekh ke: mapping ek OBJECT hai
        // Example: { "1": ["Math","English"], "2": ["Math","Science"] }
        setClassSubjectsMap(data || {});
      } catch (err) {
        console.error("Failed to load class-subjects", err);
      }
    };

    fetchClassSubjects();
  }, []);

  // 🔹 Fetch students (admin: sab students, teacher: sirf apne students – backend already handle)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(endpoints.students.myStudents, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setMessage("❌ Failed to load students");
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  // 🔹 Admin ke liye: students se classes nikaalo
  useEffect(() => {
    if (userRole !== "admin") return;
    if (!students.length) return;

    const classList = [
      ...new Set(students.map((s) => s.class).filter(Boolean)),
    ];
    setClasses(classList);
  }, [students, userRole]);

  const filteredStudents = selectedClass
    ? students.filter((s) => s.class === selectedClass)
    : [];

  // 🔹 Class change hone par (ADMIN) subjects set karo
  useEffect(() => {
    if (!selectedClass) {
      setSubjects([]);
      return;
    }

    if (userRole === "admin") {
      const subs = classSubjectsMap[selectedClass] || [];
      setSubjects(subs);
    }
    // teacher ke liye subjects yaha nahi set kar rahe, wo student se aayenge
  }, [selectedClass, userRole, classSubjectsMap]);

  // 🔹 Load marks + subjects when student change
  useEffect(() => {
    if (!selectedStudent) return;

    const loadMarks = async () => {
      setLoadingMarks(true);

      const student = students.find((s) => s._id === selectedStudent);
      if (!student) {
        setLoadingMarks(false);
        return;
      }

      let allowedSubjects = [];

      if (userRole === "teacher") {
        // teacher ke liye subjects => teachingAssignments
        const assignment = teacherAssignments.find(
          (a) => a.class === student.class
        );
        allowedSubjects = assignment ? assignment.subjects || [] : [];
        setSubjects(allowedSubjects);
      } else if (userRole === "admin") {
        // admin ke liye subjects already selectedClass effect me set ho chuke hain
        allowedSubjects = subjects;
      }

      const finalSubjects = allowedSubjects || [];

      const initialMarks = {};
      visibleExams.forEach((ex) => {
        initialMarks[ex] = {};
        finalSubjects.forEach((sub) => (initialMarks[ex][sub] = ""));
      });

      try {
        const res = await fetch(endpoints.marks.getStudent(selectedStudent), {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          visibleExams.forEach((exam) => {
            if (data.exams?.[exam]) {
              finalSubjects.forEach((sub) => {
                initialMarks[exam][sub] = data.exams[exam][sub] ?? "";
              });
            }
          });
        }
      } catch {
        // ignore
      }
      setMarks(initialMarks);
      setRowStatus({});
      setLoadingMarks(false);
    };

    if (visibleExams.length > 0) loadMarks();
  }, [
    selectedStudent,
    visibleExams,
    students,
    teacherAssignments,
    userRole,
    subjects, // admin case me needed
  ]);

  const handleChange = (exam, subject, value) => {
    const num = Number(value);
    if (value !== "" && (num < 0 || num > 100)) return;

    setMarks((prev) => ({
      ...prev,
      [exam]: { ...prev[exam], [subject]: value },
    }));

    setRowStatus((prev) => ({
      ...prev,
      [exam]: {
        ...(prev[exam] || {}),
        [subject]: undefined,
      },
    }));
  };

  const saveSingle = async (exam, subject) => {
    const value = marks[exam]?.[subject];
    if (value === "" || value === undefined) {
      setMessage("⚠ Enter valid marks");
      return;
    }

    setRowStatus((prev) => ({
      ...prev,
      [exam]: {
        ...(prev[exam] || {}),
        [subject]: "saving",
      },
    }));

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

      if (res.ok) {
        setMessage("✅ Saved!");
        setRowStatus((prev) => ({
          ...prev,
          [exam]: {
            ...(prev[exam] || {}),
            [subject]: "saved",
          },
        }));
      } else {
        setMessage(data.message || "❌ Error saving");
        setRowStatus((prev) => ({
          ...prev,
          [exam]: {
            ...(prev[exam] || {}),
            [subject]: "error",
          },
        }));
      }
    } catch {
      setMessage("❌ Error saving");
      setRowStatus((prev) => ({
        ...prev,
        [exam]: {
          ...(prev[exam] || {}),
          [subject]: "error",
        },
      }));
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Add / Update Student Marks</h2>

        {/* Class Dropdown */}
        <label style={styles.label}>Select Class</label>
        <select
          style={styles.dropdown}
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedStudent("");
            setMarks({});
            setRowStatus({});
            if (userRole === "teacher") setSubjects([]);
          }}
        >
          <option value="">-- Select Class --</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              Class {cls}
            </option>
          ))}
        </select>

        {/* Student Dropdown */}
        <label style={styles.label}>Select Student</label>
        <select
          style={styles.dropdown}
          value={selectedStudent}
          disabled={!selectedClass}
          onChange={(e) => {
            setSelectedStudent(e.target.value);
            setMessage("");
          }}
        >
          <option value="">-- Select Student --</option>

          {filteredStudents.map((s) => {
            const roll =
              s.rollNo || s.roll || s.roll_number || s.rno || "No Roll";

            return (
              <option key={s._id} value={s._id}>
                {roll} - {s.name}
              </option>
            );
          })}
        </select>

        {/* No exams enabled */}
        {visibleExams.length === 0 && (
          <p style={styles.warning}>⚠ No exam enabled by admin.</p>
        )}

        {/* Ask to select student */}
        {visibleExams.length > 0 && !selectedStudent && (
          <p style={styles.info}>Please select a student to continue.</p>
        )}

        {/* Exams + subjects */}
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
                    type="text"
                    value={marks[exam]?.[sub] ?? ""}
                    onChange={(e) => handleChange(exam, sub, e.target.value)}
                  />

                  <button
                    style={{
                      ...styles.saveBtn,
                      background:
                        rowStatus[exam]?.[sub] === "saved"
                          ? "#16a34a"
                          : rowStatus[exam]?.[sub] === "saving"
                          ? "#6b7280"
                          : styles.saveBtn.background,
                      cursor:
                        rowStatus[exam]?.[sub] === "saving"
                          ? "not-allowed"
                          : "pointer",
                    }}
                    disabled={rowStatus[exam]?.[sub] === "saving"}
                    onClick={() => saveSingle(exam, sub)}
                  >
                    {rowStatus[exam]?.[sub] === "saving"
                      ? "Saving..."
                      : rowStatus[exam]?.[sub] === "saved"
                      ? "Saved ✓"
                      : "Save"}
                  </button>

                  {rowStatus[exam]?.[sub] === "error" && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      Error saving
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}

        {/* Jab class ke liye subjects hi nahi mile */}
        {selectedClass && selectedStudent && subjects.length === 0 && (
          <p style={styles.warning}>
            {userRole === "teacher"
              ? "⚠ No subjects assigned for this class in your assignment."
              : "⚠ No subjects configured for this class. Please set class subjects from admin panel."}
          </p>
        )}

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
