// src/pages/admin/AssignTeacher.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from '../../config/api';

const AssignTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes] = useState([
    "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th",
    "6th", "7th", "8th", "9th", "10th", "11th", "12th",
  ]);
  const [subjects] = useState([
    "Mathematics", "Science", "English", "Hindi",
    "Social Studies", "Physics", "Chemistry", "Biology",
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch(endpoints.teachers.list, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setTeachers(data.filter((t) => t.role === "teacher" && t.isApproved));
    } catch {
      alert("Failed to load teachers");
    }
  };

  const handleAssign = async (teacherId, field, selectedValues) => {
    try {
      const teacher = teachers.find((t) => t._id === teacherId);
      const updateData = {
        assignedClasses:
          field === "classes" ? selectedValues : teacher?.assignedClasses || [],
        assignedSubjects:
          field === "subjects" ? selectedValues : teacher?.assignedSubjects || [],
      };

      const res = await fetch(endpoints.teachers.assign(teacherId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        setTeachers(
          teachers.map((t) =>
            t._id === teacherId ? { ...t, ...updateData } : t
          )
        );
      } else {
        const err = await res.json();
        alert("Failed: " + (err.message || "Unknown error"));
      }
    } catch {
      alert("Server error");
    }
  };

  const handleAttendanceToggle = async (teacherId, canMark) => {
    try {
      const res = await fetch(endpoints.teachers.attendanceAccess(teacherId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ canMarkAttendance: canMark }),
      });

      if (res.ok) {
        setTeachers(
          teachers.map((t) =>
            t._id === teacherId ? { ...t, canMarkAttendance: canMark } : t
          )
        );
      } else {
        alert("Failed to update attendance access");
      }
    } catch {
      alert("Server error");
    }
  };

  const handleMultiSelectChange = (e) => {
    return Array.from(e.target.selectedOptions, (opt) => opt.value);
  };

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

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .page-title {
            font-size: 1.4rem;
          }
          .card-grid {
            gap: 1.4rem;
          }
          .teacher-card {
            padding: 1.2rem;
          }
          .dropdown[multiple] {
            min-height: 90px;
          }
        }

        @media (max-width: 480px) {
          .card-grid {
            grid-template-columns: 1fr;
          }
          .teacher-card {
            padding: 1rem;
          }
          .dropdown {
            font-size: 0.9rem;
            padding: 0.6rem 0.7rem;
          }
          .dropdown[multiple] {
            min-height: 80px;
          }
          .attendance-toggle {
            flex-wrap: wrap;
            gap: 0.6rem;
          }
        }
      `}</style>

      {/* Header Row: Button + Title on same line */}
      <div className="header-row">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <h2 className="page-title">Assign Multiple Classes & Subjects</h2>
      </div>

      <div className="card-grid">
        {teachers.map((teacher) => (
          <div className="teacher-card" key={teacher._id}>
            <div className="teacher-name">{teacher.name}</div>
            <div className="teacher-email">{teacher.email}</div>

            <div className="field">
              <label>Assign Classes:</label>
              <select
                multiple
                className="dropdown"
                value={teacher.assignedClasses || []}
                onChange={(e) =>
                  handleAssign(teacher._id, "classes", handleMultiSelectChange(e))
                }
              >
                {classes.map((cls) => (
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
                value={teacher.assignedSubjects || []}
                onChange={(e) =>
                  handleAssign(teacher._id, "subjects", handleMultiSelectChange(e))
                }
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
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
        ))}
      </div>
    </div>
  );
};

export default AssignTeacher;