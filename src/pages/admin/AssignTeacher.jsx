// src/pages/admin/AssignTeacher.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from '../../config/api'; // ✅ Import centralized API config

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
      // ✅ Use centralized endpoint
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

      // ✅ Use dynamic endpoint
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
      // ✅ Use dynamic endpoint
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
        .page-title {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 1.5rem;
          font-size: 1.8rem;
          font-weight: 600;
        }
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .teacher-card {
          background: #fff;
          border-radius: 10px;
          border: 1px solid #ddd;
          padding: 1.2rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.3s;
        }
        .teacher-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }
        .teacher-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #3498db;
        }
        .teacher-email {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.8rem;
        }
        .dropdown {
          width: 100%;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 0.9rem;
          margin-top: 0.3rem;
          cursor: pointer;
          background: #fafafa;
        }
        .dropdown[multiple] {
          height: 100px;
        }
        .field {
          margin-top: 1rem;
        }
        .field label {
          font-weight: 600;
          color: #2c3e50;
          font-size: 0.9rem;
        }
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 22px;
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
          border-radius: 22px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px; width: 16px;
          left: 3px; bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: #4CAF50;
        }
        input:checked + .slider:before {
          transform: translateX(22px);
        }
        .attendance-toggle {
          margin-top: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .back-btn {
          margin-bottom: 1.5rem;
          padding: 0.6rem 1.2rem;
          border: none;
          background: #3498db;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }
        .back-btn:hover {
          background: #2980b9;
        }

        /* ✅ Mobile Responsive */
        @media (max-width: 768px) {
          .page-title {
            font-size: 1.4rem;
          }
          .teacher-card {
            padding: 1rem;
          }
          .dropdown[multiple] {
            height: 80px;
          }
          .attendance-toggle {
            flex-direction: row;
            justify-content: space-between;
            gap: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .card-grid {
            grid-template-columns: 1fr;
          }
          .teacher-card {
            padding: 0.9rem;
          }
          .dropdown[multiple] {
            height: 70px;
            font-size: 0.85rem;
          }
          .teacher-name {
            font-size: 1rem;
          }
          .back-btn {
            width: 100%;
          }
        }
      `}</style>

      <button onClick={() => navigate(-1)} className="back-btn">
        ← Back to Dashboard
      </button>
      <h2 className="page-title">Assign Multiple Classes & Subjects</h2>

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
