// src/components/AddMarks.jsx
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

  // 📥 Fetch teacher's assigned students on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(endpoints.students.myStudents, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to load students");
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length === 0) {
          setMessage("⚠️ No students found. You may not have any assigned classes.");
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setMessage(`❌ Failed to load students: ${err.message}`);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  // 📥 Fetch existing marks when student is selected
  useEffect(() => {
    if (!selectedStudent) {
      setMarks({});
      setSubjects([]);
      return;
    }

    const loadMarksForStudent = async () => {
      setLoadingMarks(true);
      setMessage("");

      const student = students.find(stu => String(stu._id) === String(selectedStudent));
      if (!student) {
        setLoadingMarks(false);
        return;
      }

      // Determine subjects based on class
      const cls = String(student.class).trim().toLowerCase();
      const classSubjects = 
        cls.includes("nursery") || cls === "lkg" || cls === "ukg" || cls === "play"
          ? ["English", "Hindi", "Math", "EVS"]
          : ["Math", "English", "Science", "Hindi", "Social Science"];

      setSubjects(classSubjects);

      // Initialize all marks as empty
      const initialMarks = {};
      ["pa1", "pa2", "halfYear", "pa3", "pa4", "final"].forEach((exam) => {
        initialMarks[exam] = {};
        classSubjects.forEach((sub) => {
          initialMarks[exam][sub] = "";
        });
      });

      try {
        // Fetch existing marks from backend
        const res = await fetch(endpoints.marks.getStudent(selectedStudent), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.exams) {
            // Merge saved marks into initial structure
            Object.keys(initialMarks).forEach((exam) => {
              if (data.exams[exam]) {
                classSubjects.forEach((sub) => {
                  const savedValue = data.exams[exam][sub];
                  if (savedValue !== undefined && savedValue !== null) {
                    initialMarks[exam][sub] = savedValue;
                  }
                });
              }
            });
          }
        }

        setMarks(initialMarks);
      } catch (err) {
        console.error("Error loading existing marks:", err);
        setMessage("⚠️ Could not load saved marks. You can still enter new ones.");
        setMarks(initialMarks); // fallback to empty
      } finally {
        setLoadingMarks(false);
      }
    };

    loadMarksForStudent();
  }, [selectedStudent, students]);

  // 🔤 Handle input change (only allow 0–100 numbers)
  const handleChange = (exam, subject, value) => {
    if (value === "" || value === null) {
      setMarks((prev) => ({
        ...prev,
        [exam]: { ...prev[exam], [subject]: "" },
      }));
      return;
    }

    const num = Number(value);
    if (isNaN(num) || num < 0 || num > 100) return;

    setMarks((prev) => ({
      ...prev,
      [exam]: { ...prev[exam], [subject]: num },
    }));
  };

  // 💾 Submit marks
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!selectedStudent) return setMessage("⚠️ Please select a student");
    if (subjects.length === 0) return setMessage("⚠️ No subjects available");

    try {
      const res = await fetch(endpoints.marks.save(selectedStudent), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ exams: marks }),
      });

      const data = await res.json();
      setMessage(
        res.ok
          ? "✅ Marks saved successfully!"
          : data.message || "❌ Failed to save marks"
      );
    } catch (err) {
      console.error("Submission error:", err);
      setMessage("⚠️ Network or server error. Please try again.");
    }
  };

  return (
    <div>
      <style>{`
        .container {
          max-width: 750px;
          margin: 30px auto;
          padding: 25px;
          border: 1px solid #ddd;
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        h2 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 20px;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        label {
          font-weight: 600;
          margin-bottom: 6px;
          color: #34495e;
        }
        select, input {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          width: 100%;
          font-size: 15px;
          box-sizing: border-box;
        }
        button {
          background: #27ae60;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: background 0.2s;
        }
        button:hover {
          background: #219653;
        }
        button:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
        .message {
          text-align: center;
          margin-top: 15px;
          padding: 10px;
          border-radius: 6px;
          font-weight: bold;
        }
        .message:empty {
          display: none;
        }
        .exam-section {
          border: 1px solid #e0e0e0;
          padding: 16px;
          border-radius: 10px;
          background-color: #f8f9fa;
        }
        .exam-title {
          font-weight: bold;
          margin-bottom: 14px;
          color: #e74c3c;
          font-size: 16px;
        }
        .subject-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .subject-label {
          min-width: 130px;
          font-size: 14px;
        }
        input[type="number"] {
          width: 100px;
          text-align: center;
          padding: 8px;
        }
        .student-info {
          background: #e8f4fc;
          padding: 12px;
          border-radius: 8px;
          margin-top: 10px;
          font-size: 14px;
          color: #2980b9;
        }
        .loading {
          text-align: center;
          color: #7f8c8d;
          font-style: italic;
        }
      `}</style>

      <div className="container">
        <h2>Add / Update Student Marks</h2>

        {loadingStudents ? (
          <p className="loading">Loading students...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>Select Student:</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={loadingMarks}
            >
              <option value="">-- Choose a student --</option>
              {students.map((stu) => (
                <option key={stu._id} value={stu._id}>
                  {stu.name} (Class: {stu.class}, Roll: {stu.rollNo})
                </option>
              ))}
            </select>

            {selectedStudent && (
              <div className="student-info">
                {(() => {
                  const stu = students.find(s => String(s._id) === String(selectedStudent));
                  return stu ? `✅ Selected: ${stu.name} | Class: ${stu.class} | Section: ${stu.section || 'A'}` : "";
                })()}
              </div>
            )}

            {loadingMarks && selectedStudent && (
              <p className="loading">Loading existing marks...</p>
            )}

            {!loadingMarks && subjects.length > 0 && Object.keys(marks).length > 0 && (
              ["pa1", "pa2", "halfYear", "pa3", "pa4", "final"].map((exam) => (
                <div className="exam-section" key={exam}>
                  <div className="exam-title">
                    {exam
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase())}
                  </div>
                  {subjects.map((subject) => (
                    <div className="subject-row" key={subject}>
                      <span className="subject-label">{subject}:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={marks[exam]?.[subject] !== undefined ? marks[exam][subject] : ""}
                        onChange={(e) => handleChange(exam, subject, e.target.value)}
                        placeholder="0–100"
                        disabled={loadingMarks}
                      />
                    </div>
                  ))}
                </div>
              ))
            )}

            <button 
              type="submit" 
              disabled={!selectedStudent || loadingMarks}
            >
              💾 Save Marks
            </button>
          </form>
        )}

        <div
          className="message"
          style={{
            color: message.includes("✅")
              ? "green"
              : message.includes("❌") || message.includes("⚠️")
              ? "red"
              : "#e67e22",
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

export default AddMarks;
