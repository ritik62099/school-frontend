// src/pages/admin/ClassSubjectManager.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';

const ClassSubjectManager = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classSubjects, setClassSubjects] = useState({});
  const [newClass, setNewClass] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingClass, setSavingClass] = useState(null);
  const [deleteClassValue, setDeleteClassValue] = useState('');
  const [deleteSubjectValue, setDeleteSubjectValue] = useState('');
  const [updateClassFrom, setUpdateClassFrom] = useState('');
  const [updateClassTo, setUpdateClassTo] = useState('');
  const [updateSubjectFrom, setUpdateSubjectFrom] = useState('');
  const [updateSubjectTo, setUpdateSubjectTo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [classesRes, subjectsRes, mappingRes] = await Promise.all([
          fetch(endpoints.classes.list, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(endpoints.subjects.list, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(endpoints.classSubjects.getAll, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const classesData = classesRes.ok ? await classesRes.json() : [];
        const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
        const mappingData = mappingRes.ok ? await mappingRes.json() : {};

        const allClassNames = [...new Set([...classesData, ...Object.keys(mappingData)])];
        const normalizedMapping = {};
        allClassNames.forEach(cls => {
          normalizedMapping[cls] = Array.isArray(mappingData[cls]) ? mappingData[cls] : [];
        });

        setClasses(classesData);
        setSubjects(subjectsData);
        setClassSubjects(normalizedMapping);
      } catch (err) {
        console.error('Failed to load data', err);
        alert('Failed to load data. Check console.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddClass = async () => {
    const className = newClass.trim();
    if (!className) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(endpoints.classes.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: className })
      });

      if (res.ok) {
        const addedClass = await res.json();
        setClasses(prev => [...prev, addedClass]);
        setClassSubjects(prev => ({ ...prev, [addedClass]: [] }));
        setNewClass('');
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Failed to add class: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error while adding class');
    }
  };

  const handleAddSubject = async () => {
    const subjectName = newSubject.trim();
    if (!subjectName) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(endpoints.subjects.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: subjectName })
      });

      if (res.ok) {
        const addedSubject = await res.json();
        setSubjects(prev => [...prev, addedSubject]);
        setNewSubject('');
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Failed to add subject: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error while adding subject');
    }
  };

  const handleDeleteClass = async () => {
    if (!deleteClassValue) return;
    if (!window.confirm(`Are you sure you want to delete class "${deleteClassValue}"? This cannot be undone.`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(endpoints.classes.delete(deleteClassValue), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setClasses(prev => prev.filter(cls => cls !== deleteClassValue));
        setClassSubjects(prev => {
          const newMapping = { ...prev };
          delete newMapping[deleteClassValue];
          return newMapping;
        });
        setDeleteClassValue('');
        alert('Class deleted successfully!');
      } else {
        alert('Failed to delete class');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteSubjectValue) return;
    if (!window.confirm(`Are you sure you want to delete subject "${deleteSubjectValue}"? It will be removed from all classes.`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(endpoints.subjects.delete(deleteSubjectValue), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setSubjects(prev => prev.filter(sub => sub !== deleteSubjectValue));
        setClassSubjects(prev => {
          const newMapping = {};
          for (const cls in prev) {
            newMapping[cls] = prev[cls].filter(sub => sub !== deleteSubjectValue);
          }
          return newMapping;
        });
        setDeleteSubjectValue('');
        alert('Subject deleted successfully!');
      } else {
        alert('Failed to delete subject');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleUpdateClass = async () => {
    if (!updateClassFrom || !updateClassTo.trim()) return;
    const newName = updateClassTo.trim();
    if (newName === updateClassFrom) return;

    if (!window.confirm(`Rename class "${updateClassFrom}" to "${newName}"?`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(endpoints.classes.update(updateClassFrom), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newName })
      });

      if (res.ok) {
        const data = await res.json();
        setClasses(prev => prev.map(cls => cls === updateClassFrom ? data.name : cls));
        setClassSubjects(prev => {
          const newMapping = {};
          for (const cls in prev) {
            const key = cls === updateClassFrom ? data.name : cls;
            newMapping[key] = prev[cls];
          }
          return newMapping;
        });
        setUpdateClassFrom('');
        setUpdateClassTo('');
        alert('Class renamed successfully!');
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Update failed: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleUpdateSubject = async () => {
    if (!updateSubjectFrom || !updateSubjectTo.trim()) return;
    const newName = updateSubjectTo.trim();
    if (newName === updateSubjectFrom) return;

    if (!window.confirm(`Rename subject "${updateSubjectFrom}" to "${newName}"?`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(endpoints.subjects.update(updateSubjectFrom), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newName })
      });

      if (res.ok) {
        const data = await res.json();
        setSubjects(prev => prev.map(sub => sub === updateSubjectFrom ? data.name : sub));
        setClassSubjects(prev => {
          const newMapping = {};
          for (const cls in prev) {
            newMapping[cls] = prev[cls].map(sub => sub === updateSubjectFrom ? data.name : sub);
          }
          return newMapping;
        });
        setUpdateSubjectFrom('');
        setUpdateSubjectTo('');
        alert('Subject renamed successfully!');
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Update failed: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleSaveClassSubjects = async (className) => {
    setSavingClass(className);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(endpoints.classSubjects.update(className), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subjects: classSubjects[className] || [] })
      });

      if (res.ok) {
        const current = JSON.parse(localStorage.getItem('tempClassSubjects') || '{}');
        current[className] = classSubjects[className] || [];
        localStorage.setItem('tempClassSubjects', JSON.stringify(current));
        alert('Saved!');
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Save failed: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving');
    } finally {
      setSavingClass(null);
    }
  };

  // ✅ Toggle subject in class
  const toggleSubjectForClass = (className, subject) => {
    setClassSubjects(prev => {
      const current = prev[className] || [];
      const newSubjects = current.includes(subject)
        ? current.filter(s => s !== subject)
        : [...current, subject];
      return { ...prev, [className]: newSubjects };
    });
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.1rem' }}>Loading...</div>;
  }

  return (
    <div style={{ 
      padding: '1rem', 
      fontFamily: 'Poppins, sans-serif', 
      maxWidth: '1000px', 
      margin: '0 auto' 
    }}>
      <style>{`
        .checkbox-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
          padding: 0.5rem 0;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background-color: #fafafa;
        }
        .checkbox-row {
          display: flex;
          align-items: center;
          padding: 0.4rem 0.8rem;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .checkbox-row:hover {
          background-color: #f0f9ff;
        }
        .checkbox-row input[type="checkbox"] {
          margin-right: 0.8rem;
          transform: scale(1.15);
          cursor: pointer;
        }
        .checkbox-row span {
          font-size: 0.95rem;
          color: #333;
          flex: 1;
        }
        .checkbox-list::-webkit-scrollbar {
          width: 6px;
        }
        .checkbox-list::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }
      `}</style>

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem', 
        flexWrap: 'wrap', 
        gap: '0.8rem' 
      }}>
        <h2 style={{ color: '#2c3e50', margin: 0, fontSize: '1.5rem' }}>Manage Classes & Subjects</h2>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '0.5rem 1rem',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Add / Delete / Update Class */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        background: '#f0f9ff', 
        borderRadius: '10px' 
      }}>
        <h3 style={{ margin: '0 0 0.8rem', fontSize: '1.25rem' }}>Add / Delete / Rename Class</h3>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '0.8rem',
          flexWrap: 'wrap'
        }}>
          <input
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            placeholder="e.g., 13th"
            style={{ 
              padding: '0.6rem', 
              flex: '1 1 200px', 
              borderRadius: '6px', 
              border: '1px solid #ccc',
              minWidth: '0'
            }}
          />
          <button 
            onClick={handleAddClass} 
            style={{ 
              padding: '0.6rem 1rem', 
              background: '#2ecc71', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            Add Class
          </button>
        </div>

        {classes.length > 0 && (
          <>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginTop: '0.8rem',
              flexWrap: 'wrap'
            }}>
              <select
                value={deleteClassValue}
                onChange={(e) => setDeleteClassValue(e.target.value)}
                style={{ 
                  padding: '0.6rem', 
                  flex: '1 1 200px', 
                  borderRadius: '6px', 
                  border: '1px solid #ccc',
                  minWidth: '0'
                }}
              >
                <option value="">-- Select class to delete --</option>
                {classes.map(cls => (
                  <option key={`del-cls-${cls}`} value={cls}>{cls}</option>
                ))}
              </select>
              <button
                onClick={handleDeleteClass}
                disabled={!deleteClassValue}
                style={{
                  padding: '0.6rem 1rem',
                  background: deleteClassValue ? '#e74c3c' : '#bdc3c7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
              >
                Delete
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginTop: '0.8rem',
              flexWrap: 'wrap'
            }}>
              <select
                value={updateClassFrom}
                onChange={(e) => {
                  setUpdateClassFrom(e.target.value);
                  setUpdateClassTo(e.target.value);
                }}
                style={{ 
                  padding: '0.6rem', 
                  borderRadius: '6px', 
                  border: '1px solid #ccc', 
                  flex: '1 1 180px',
                  minWidth: '0'
                }}
              >
                <option value="">-- Select class to rename --</option>
                {classes.map(cls => (
                  <option key={`upd-cls-${cls}`} value={cls}>{cls}</option>
                ))}
              </select>
              <input
                value={updateClassTo}
                onChange={(e) => setUpdateClassTo(e.target.value)}
                placeholder="New name"
                style={{ 
                  padding: '0.6rem', 
                  flex: '1 1 180px', 
                  borderRadius: '6px', 
                  border: '1px solid #ccc',
                  minWidth: '0'
                }}
              />
              <button
                onClick={handleUpdateClass}
                disabled={!updateClassFrom || !updateClassTo.trim()}
                style={{
                  padding: '0.6rem 1rem',
                  background: updateClassFrom && updateClassTo.trim() ? '#f39c12' : '#bdc3c7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
              >
                Rename
              </button>
            </div>
          </>
        )}

        <div style={{ 
          marginTop: '0.8rem', 
          fontSize: '0.9rem', 
          color: '#555',
          wordBreak: 'break-word'
        }}>
          Current Classes: {classes.length ? classes.join(', ') : 'None'}
        </div>
      </div>

      {/* Add / Delete / Update Subject */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        background: '#f0fff4', 
        borderRadius: '10px' 
      }}>
        <h3 style={{ margin: '0 0 0.8rem', fontSize: '1.25rem' }}>Add / Delete / Rename Subject</h3>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '0.8rem',
          flexWrap: 'wrap'
        }}>
          <input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="e.g., AI"
            style={{ 
              padding: '0.6rem', 
              flex: '1 1 200px', 
              borderRadius: '6px', 
              border: '1px solid #ccc',
              minWidth: '0'
            }}
          />
          <button 
            onClick={handleAddSubject} 
            style={{ 
              padding: '0.6rem 1rem', 
              background: '#2ecc71', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            Add Subject
          </button>
        </div>

        {subjects.length > 0 && (
          <>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginTop: '0.8rem',
              flexWrap: 'wrap'
            }}>
              <select
                value={deleteSubjectValue}
                onChange={(e) => setDeleteSubjectValue(e.target.value)}
                style={{ 
                  padding: '0.6rem', 
                  flex: '1 1 200px', 
                  borderRadius: '6px', 
                  border: '1px solid #ccc',
                  minWidth: '0'
                }}
              >
                <option value="">-- Select subject to delete --</option>
                {subjects.map(sub => (
                  <option key={`del-sub-${sub}`} value={sub}>{sub}</option>
                ))}
              </select>
              <button
                onClick={handleDeleteSubject}
                disabled={!deleteSubjectValue}
                style={{
                  padding: '0.6rem 1rem',
                  background: deleteSubjectValue ? '#e74c3c' : '#bdc3c7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
              >
                Delete
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginTop: '0.8rem',
              flexWrap: 'wrap'
            }}>
              <select
                value={updateSubjectFrom}
                onChange={(e) => {
                  setUpdateSubjectFrom(e.target.value);
                  setUpdateSubjectTo(e.target.value);
                }}
                style={{ 
                  padding: '0.6rem', 
                  borderRadius: '6px', 
                  border: '1px solid #ccc', 
                  flex: '1 1 180px',
                  minWidth: '0'
                }}
              >
                <option value="">-- Select subject to rename --</option>
                {subjects.map(sub => (
                  <option key={`upd-sub-${sub}`} value={sub}>{sub}</option>
                ))}
              </select>
              <input
                value={updateSubjectTo}
                onChange={(e) => setUpdateSubjectTo(e.target.value)}
                placeholder="New name"
                style={{ 
                  padding: '0.6rem', 
                  flex: '1 1 180px', 
                  borderRadius: '6px', 
                  border: '1px solid #ccc',
                  minWidth: '0'
                }}
              />
              <button
                onClick={handleUpdateSubject}
                disabled={!updateSubjectFrom || !updateSubjectTo.trim()}
                style={{
                  padding: '0.6rem 1rem',
                  background: updateSubjectFrom && updateSubjectTo.trim() ? '#f39c12' : '#bdc3c7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
              >
                Rename
              </button>
            </div>
          </>
        )}

        <div style={{ 
          marginTop: '0.8rem', 
          fontSize: '0.9rem', 
          color: '#555',
          wordBreak: 'break-word'
        }}>
          Available Subjects: {subjects.length ? subjects.join(', ') : 'None'}
        </div>
      </div>

      {/* Assign Subjects to Classes */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#2c3e50', fontSize: '1.25rem' }}>Assign Subjects to Classes</h3>
        {classes.length === 0 ? (
          <p>No classes available.</p>
        ) : (
          classes.map(cls => (
            <div key={cls} style={{ 
              background: '#fff', 
              padding: '1.2rem', 
              margin: '1rem 0', 
              borderRadius: '10px', 
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              wordBreak: 'break-word'
            }}>
              <h4 style={{ margin: '0 0 1rem', color: '#2980b9', fontSize: '1.15rem' }}>{cls}</h4>
              
              {/* ✅ Checkbox List Instead of <select multiple> */}
              <div className="checkbox-list">
                {subjects.length > 0 ? (
                  subjects.map(sub => {
                    const isSelected = (classSubjects[cls] || []).includes(sub);
                    return (
                      <label key={`${cls}-${sub}`} className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSubjectForClass(cls, sub)}
                        />
                        <span>{sub}</span>
                      </label>
                    );
                  })
                ) : (
                  <div style={{ padding: '0.6rem 0.8rem', color: '#777', fontStyle: 'italic' }}>
                    No subjects available
                  </div>
                )}
              </div>

              <div style={{ marginTop: '0.6rem', color: '#34495e', fontSize: '0.95rem' }}>
                <strong>Selected:</strong>{' '}
                {(classSubjects[cls]?.length > 0) ? (
                  <span>{classSubjects[cls].join(', ')}</span>
                ) : (
                  <span style={{ color: '#95a5a6', fontStyle: 'italic' }}>None</span>
                )}
              </div>

              <button
                onClick={() => handleSaveClassSubjects(cls)}
                disabled={savingClass === cls}
                style={{
                  marginTop: '0.8rem',
                  padding: '0.55rem 1.2rem',
                  background: savingClass === cls ? '#bdc3c7' : '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  width: '100%',
                  fontSize: '1rem'
                }}
              >
                {savingClass === cls ? 'Saving...' : 'Save Subjects'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div style={{ paddingTop: '2rem', borderTop: '2px solid #e2e8f0' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '1.2rem', fontSize: '1.25rem' }}>Class-wise Subjects Overview</h3>
        {classes.length === 0 ? (
          <p>No classes to display.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1.2rem', gridTemplateColumns: '1fr' }}>
            {classes.map(cls => (
              <div key={`summary-${cls}`} style={{
                background: '#f8fafc',
                padding: '1.1rem',
                borderRadius: '10px',
                borderLeft: '4px solid #3b82f6',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                wordBreak: 'break-word'
              }}>
                <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{cls}</strong>
                <div style={{ marginTop: '0.6rem', color: '#475569', fontSize: '0.95rem' }}>
                  {classSubjects[cls]?.length > 0 ? (
                    <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.4rem', lineHeight: '1.6' }}>
                      {classSubjects[cls].map(sub => (
                        <li key={`item-${cls}-${sub}`}>{sub}</li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No subjects assigned</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassSubjectManager;