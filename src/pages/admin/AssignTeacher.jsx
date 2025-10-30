// src/pages/admin/AssignTeacher.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../config/api";
import { useTeachers } from "../../hooks/useTeachers";

const AssignTeacher = () => {
  const navigate = useNavigate();
  const { teachers, loading, error, refetch } = useTeachers();

  // ✅ Dynamic data from backend
  const [allClasses, setAllClasses] = useState([]);
  const [classSubjectsMap, setClassSubjectsMap] = useState({}); // { "1st": ["Math", "Hindi"], ... }

  // Local state to manage dynamic subjects per teacher
  const [teacherLocalState, setTeacherLocalState] = useState({});

  // ✅ Fetch classes and class-subject mapping from backend
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [classesRes, mappingRes] = await Promise.all([
          fetch(endpoints.classes.list, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(endpoints.classSubjects.getAll, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const classes = classesRes.ok ? await classesRes.json() : [];
        const mapping = mappingRes.ok ? await mappingRes.json() : {};

        setAllClasses(classes);
        setClassSubjectsMap(mapping);
      } catch (err) {
        console.error("Failed to load class/subject data", err);
      }
    };

    fetchData();
  }, []);

  // ✅ Initialize local state for each teacher
  useEffect(() => {
    if (teachers.length === 0) return;

    const init = {};
    teachers.forEach((teacher) => {
      const assignedClasses = teacher.assignedClasses || [];
      const availableSubjects = getSubjectsForClasses(assignedClasses);
      init[teacher._id] = {
        selectedClasses: assignedClasses,
        availableSubjects,
        selectedSubjects: teacher.assignedSubjects || []
      };
    });
    setTeacherLocalState(init);
  }, [teachers, classSubjectsMap]);

  // ✅ Helper: Get union of subjects for selected classes
  const getSubjectsForClasses = (selectedClasses) => {
    const subjectSet = new Set();
    selectedClasses.forEach((cls) => {
      const subs = classSubjectsMap[cls] || [];
      subs.forEach((sub) => subjectSet.add(sub));
    });
    return Array.from(subjectSet);
  };

  // ✅ Handle class selection change
  const handleClassChange = async (teacherId, selectedClasses) => {
    const availableSubjects = getSubjectsForClasses(selectedClasses);
    const currentSubjects = teacherLocalState[teacherId]?.selectedSubjects || [];
    // Keep only subjects that are valid for newly selected classes
    const validSubjects = currentSubjects.filter((sub) =>
      availableSubjects.includes(sub)
    );

    setTeacherLocalState((prev) => ({
      ...prev,
      [teacherId]: {
        selectedClasses,
        availableSubjects,
        selectedSubjects: validSubjects
      }
    }));

    // Save classes to backend
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(endpoints.teachers.assign(teacherId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          assignedClasses: selectedClasses,
          assignedSubjects: validSubjects // auto-clean invalid subjects
        })
      });

      if (res.ok) {
        refetch();
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Failed to save: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Network error");
    }
  };

  // ✅ Handle subject selection change
  const handleSubjectChange = async (teacherId, selectedSubjects) => {
    const selectedClasses = teacherLocalState[teacherId]?.selectedClasses || [];

    setTeacherLocalState((prev) => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        selectedSubjects
      }
    }));

    // Save subjects to backend
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(endpoints.teachers.assign(teacherId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          assignedClasses: selectedClasses,
          assignedSubjects: selectedSubjects
        })
      });

      if (res.ok) {
        refetch();
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Failed to save: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Network error");
    }
  };

  const handleAttendanceToggle = async (teacherId, canMark) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(endpoints.teachers.attendanceAccess(teacherId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ canMarkAttendance: canMark })
      });

      if (res.ok) {
        refetch();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert("Failed: " + (errData.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error – please check your connection");
    }
  };

  const handleMultiSelectChange = (e) => {
    return Array.from(e.target.selectedOptions, (opt) => opt.value);
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        Loading teachers and class data...
      </div>
    );
  if (error)
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>
        {error}
      </div>
    );

  return (
    <div style={{ padding: "1.5rem", fontFamily: "Poppins, sans-serif" }}>
      <style>{`
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: nowrap;
        }
        .back-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: #3498db;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          white-space: nowrap;
          transition: background 0.2s;
        }
        .back-btn:hover {
          background: #2980b9;
        }
        .page-title {
          color: #2c3e50;
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0;
          flex: 1;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.8rem;
          margin-top: 1rem;
        }
        .teacher-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #eaeaea;
          padding: 1.4rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          transition: all 0.25s ease;
        }
        .teacher-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.1);
        }
        .teacher-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #2980b9;
          margin-bottom: 0.2rem;
        }
        .teacher-email {
          font-size: 0.875rem;
          color: #7f8c8d;
          margin-bottom: 1.2rem;
        }
        .field {
          margin-bottom: 1.2rem;
        }
        .field label {
          display: block;
          font-weight: 600;
          color: #2c3e50;
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
        }
        .dropdown {
          width: 100%;
          padding: 0.65rem 0.8rem;
          border: 1px solid #dcdfe6;
          border-radius: 8px;
          background-color: #fafafa;
          font-size: 0.95rem;
          color: #333;
          outline: none;
          transition: border-color 0.2s;
        }
        .dropdown:focus {
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        .dropdown[multiple] {
          min-height: 110px;
        }
        .attendance-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.6rem;
          border-top: 1px solid #eee;
          margin-top: 0.6rem;
        }
        .attendance-toggle span {
          font-weight: 600;
          color: #2c3e50;
          font-size: 0.95rem;
        }
        .switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: #2ecc71;
        }
        input:checked + .slider:before {
          transform: translateX(24px);
        }

        @media (max-width: 768px) {
          .page-title { font-size: 1.4rem; }
          .card-grid { gap: 1.4rem; }
          .teacher-card { padding: 1.2rem; }
          .dropdown[multiple] { min-height: 90px; }
        }
        @media (max-width: 480px) {
          .card-grid { grid-template-columns: 1fr; }
          .teacher-card { padding: 1rem; }
          .dropdown { font-size: 0.9rem; padding: 0.6rem 0.7rem; }
          .dropdown[multiple] { min-height: 80px; }
          .attendance-toggle { flex-wrap: wrap; gap: 0.6rem; }
        }
      `}</style>

      <div className="header-row">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <h2 className="page-title">Assign Classes & Subjects</h2>
      </div>

      <div className="card-grid">
        {teachers.map((teacher) => {
          const local = teacherLocalState[teacher._id] || {};
          return (
            <div className="teacher-card" key={teacher._id}>
              <div className="teacher-name">{teacher.name}</div>
              <div className="teacher-email">{teacher.email}</div>

              <div className="field">
                <label>Assign Classes:</label>
                <select
                  multiple
                  className="dropdown"
                  value={local.selectedClasses || []}
                  onChange={(e) =>
                    handleClassChange(teacher._id, handleMultiSelectChange(e))
                  }
                >
                  {allClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Assign Subjects:</label>
                <select
                  multiple
                  className="dropdown"
                  value={local.selectedSubjects || []}
                  onChange={(e) =>
                    handleSubjectChange(teacher._id, handleMultiSelectChange(e))
                  }
                >
                  {local.availableSubjects?.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  )) || (
                    <option disabled>
                      {local.selectedClasses?.length
                        ? "No subjects defined for selected classes"
                        : "Select classes first"}
                    </option>
                  )}
                </select>
              </div>

              <div className="attendance-toggle">
                <span>Can Mark Attendance</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={teacher.canMarkAttendance || false}
                    onChange={(e) =>
                      handleAttendanceToggle(teacher._id, e.target.checked)
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignTeacher;