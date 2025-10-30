// src/pages/admin/ClassSubjectManager.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../config/api";

const ClassSubjectManager = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classSubjects, setClassSubjects] = useState({});
  const [newClass, setNewClass] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingClass, setSavingClass] = useState(null);
  const [deleteClassValue, setDeleteClassValue] = useState("");
  const [deleteSubjectValue, setDeleteSubjectValue] = useState("");
  const [updateClassFrom, setUpdateClassFrom] = useState("");
  const [updateClassTo, setUpdateClassTo] = useState("");
  const [updateSubjectFrom, setUpdateSubjectFrom] = useState("");
  const [updateSubjectTo, setUpdateSubjectTo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [classesRes, subjectsRes, mappingRes] = await Promise.all([
          fetch(endpoints.classes.list, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(endpoints.subjects.list, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(endpoints.classSubjects.getAll, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const classesData = classesRes.ok ? await classesRes.json() : [];
        const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
        const mappingData = mappingRes.ok ? await mappingRes.json() : {};

        const allClassNames = [...new Set([...classesData, ...Object.keys(mappingData)])];
        const normalizedMapping = {};
        allClassNames.forEach((cls) => {
          normalizedMapping[cls] = Array.isArray(mappingData[cls]) ? mappingData[cls] : [];
        });

        setClasses(classesData);
        setSubjects(subjectsData);
        setClassSubjects(normalizedMapping);
      } catch (err) {
        console.error("Failed to load data", err);
        alert("Failed to load data. Check console.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMultiSelectChange = (e) => Array.from(e.target.selectedOptions, (opt) => opt.value);
  const handleSubjectChange = (className, selectedSubjects) => {
    setClassSubjects((prev) => ({
      ...prev,
      [className]: selectedSubjects,
    }));
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="header">
        <h2>Manage Classes & Subjects</h2>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* Add / Delete Class */}
      <div className="card blue-card">
        <h3>Add / Delete Class</h3>
        <div className="input-row">
          <input
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            placeholder="e.g., 13th"
          />
          <button className="btn green">Add</button>
        </div>

        {classes.length > 0 && (
          <>
            <div className="input-row">
              <select
                value={deleteClassValue}
                onChange={(e) => setDeleteClassValue(e.target.value)}
              >
                <option value="">-- Select class to delete --</option>
                {classes.map((cls) => (
                  <option key={cls}>{cls}</option>
                ))}
              </select>
              <button
                disabled={!deleteClassValue}
                className={`btn ${deleteClassValue ? "red" : "disabled"}`}
              >
                Delete
              </button>
            </div>

            <div className="input-row">
              <select
                value={updateClassFrom}
                onChange={(e) => {
                  setUpdateClassFrom(e.target.value);
                  setUpdateClassTo(e.target.value);
                }}
              >
                <option value="">-- Select class to rename --</option>
                {classes.map((cls) => (
                  <option key={cls}>{cls}</option>
                ))}
              </select>
              <input
                value={updateClassTo}
                onChange={(e) => setUpdateClassTo(e.target.value)}
                placeholder="New name"
              />
              <button
                disabled={!updateClassFrom || !updateClassTo}
                className={`btn ${updateClassFrom && updateClassTo ? "orange" : "disabled"}`}
              >
                Rename
              </button>
            </div>
          </>
        )}
      </div>

      {/* Add / Delete Subject */}
      <div className="card green-card">
        <h3>Add / Delete Subject</h3>
        <div className="input-row">
          <input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="e.g., AI"
          />
          <button className="btn green">Add</button>
        </div>

        {subjects.length > 0 && (
          <>
            <div className="input-row">
              <select
                value={deleteSubjectValue}
                onChange={(e) => setDeleteSubjectValue(e.target.value)}
              >
                <option value="">-- Select subject to delete --</option>
                {subjects.map((sub) => (
                  <option key={sub}>{sub}</option>
                ))}
              </select>
              <button
                disabled={!deleteSubjectValue}
                className={`btn ${deleteSubjectValue ? "red" : "disabled"}`}
              >
                Delete
              </button>
            </div>

            <div className="input-row">
              <select
                value={updateSubjectFrom}
                onChange={(e) => {
                  setUpdateSubjectFrom(e.target.value);
                  setUpdateSubjectTo(e.target.value);
                }}
              >
                <option value="">-- Select subject to rename --</option>
                {subjects.map((sub) => (
                  <option key={sub}>{sub}</option>
                ))}
              </select>
              <input
                value={updateSubjectTo}
                onChange={(e) => setUpdateSubjectTo(e.target.value)}
                placeholder="New name"
              />
              <button
                disabled={!updateSubjectFrom || !updateSubjectTo}
                className={`btn ${updateSubjectFrom && updateSubjectTo ? "orange" : "disabled"}`}
              >
                Rename
              </button>
            </div>
          </>
        )}
      </div>

      {/* Assign Subjects */}
      <div className="assign-section">
        <h3>Assign Subjects to Classes</h3>
        {classes.map((cls) => (
          <div key={cls} className="class-card">
            <h4>{cls}</h4>
            <select
              multiple
              value={classSubjects[cls] || []}
              onChange={(e) => handleSubjectChange(cls, handleMultiSelectChange(e))}
            >
              {subjects.map((sub) => (
                <option key={`${cls}-${sub}`} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <div className="selected">
              <strong>Selected:</strong>{" "}
              {classSubjects[cls]?.length ? classSubjects[cls].join(", ") : <i>None</i>}
            </div>
            <button className="btn blue">
              {savingClass === cls ? "Saving..." : "Save Subjects"}
            </button>
          </div>
        ))}
      </div>

      {/* Internal CSS */}
      <style>{`
        .page-container {
          padding: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
          font-family: 'Poppins', sans-serif;
        }
        .header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1.5rem;
        }
        .header h2 {
          margin: 0;
          color: #2c3e50;
        }
        .back-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
        }
        .card {
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 2rem;
        }
        .blue-card { background: #f0f9ff; }
        .green-card { background: #f0fff4; }
        .input-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.8rem;
        }
        input, select {
          flex: 1;
          padding: 0.6rem;
          border-radius: 6px;
          border: 1px solid #ccc;
          min-width: 150px;
        }
        .btn {
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 6px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
        }
        .btn.green { background: #2ecc71; }
        .btn.red { background: #e74c3c; }
        .btn.blue { background: #3498db; }
        .btn.orange { background: #f39c12; }
        .btn.disabled { background: #bdc3c7; cursor: not-allowed; }
        .class-card {
          background: white;
          border-radius: 10px;
          padding: 1rem;
          margin: 1rem 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        .class-card select {
          width: 100%;
          min-height: 100px;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #ddd;
        }
        .selected {
          margin-top: 0.6rem;
          color: #34495e;
        }
        .loader {
          text-align: center;
          padding: 2rem;
          font-size: 1.2rem;
        }
        @media (max-width: 768px) {
          .page-container { padding: 1rem; }
          .input-row { flex-direction: column; }
          .btn { width: 100%; }
          .header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
};

export default ClassSubjectManager;
