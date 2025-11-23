
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


  useEffect(() => {
    const fetchTeacherAssignments = async () => {
      try {
        const res = await fetch(endpoints.auth.me, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.ok) {
          const teacher = await res.json();

          const assignments = teacher.teachingAssignments || [];
          setTeacherAssignments(assignments);

          const classList = [...new Set(assignments.map(a => a.class))];
          setClasses(classList);
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



  const filteredStudents = selectedClass
    ? students.filter(s => s.class === selectedClass)
    : [];


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
      } catch { }
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


        {/* Class Dropdown */}
        <label style={styles.label}>Select Class</label>
        <select
          style={styles.dropdown}
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedStudent("");
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
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Select Student --</option>
          {filteredStudents.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
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
