

import React, { useState, useEffect } from 'react';
import { endpoints } from '../../config/api';
import { useNavigate } from 'react-router-dom';

const FeesManagement = () => {
  const [classFees, setClassFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [newClassFee, setNewClassFee] = useState({ className: '', monthlyFee: '' });
  const [editMode, setEditMode] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      try {
        const [classFeesRes, classRes] = await Promise.all([
          fetch(endpoints.classFees.list, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(endpoints.classes.list, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (classFeesRes.ok && classRes.ok) {
          setClassFees(await classFeesRes.json());
          setClasses(await classRes.json());
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    loadData();
  }, [token]);

  const handleSaveClassFee = async (e) => {
    e.preventDefault();
    const payload = {
      className: newClassFee.className.trim(),
      monthlyFee: Number(newClassFee.monthlyFee),
    };

    if (!payload.className || isNaN(payload.monthlyFee)) {
      alert('Please fill all fields correctly.');
      return;
    }

    try {
      let res;
      if (editMode) {
        const url = endpoints.classFees.update(editMode);
        res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(endpoints.classFees.create, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const updated = await res.json();
        if (editMode) {
          setClassFees(classFees.map(f => f.className === editMode ? updated : f));
        } else {
          setClassFees([...classFees, updated]);
        }
        setNewClassFee({ className: '', monthlyFee: '' });
        setEditMode(null);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save class fee');
      }
    } catch (err) {
      console.error('Class fee save error:', err);
      alert('Network error while saving class fee');
    }
  };

  const handleDelete = async (className) => {
    if (!window.confirm(`Are you sure you want to delete tuition fee for ${className}?`)) return;

    try {
      const res = await fetch(endpoints.classFees.delete(className), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setClassFees(classFees.filter(f => f.className !== className));
      } else {
        alert('Failed to delete fee');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error during deletion');
    }
  };

  const handleEdit = (fee) => {
    setEditMode(fee.className);
    setNewClassFee({ className: fee.className, monthlyFee: fee.monthlyFee });
  };

  const handleCancel = () => {
    setEditMode(null);
    setNewClassFee({ className: '', monthlyFee: '' });
  };

  const availableClassesForClassFee = classes.filter(cls =>
    !classFees.some(f => f.className === cls)
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>💰 Fees Management</h2>
      
      <button
        onClick={() => navigate('/')}
        style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        ← Back
      </button>

      <section style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
        <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>📘 Tuition / Class Fees</h3>
        <form onSubmit={handleSaveClassFee} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
          <select
            value={newClassFee.className}
            onChange={(e) => setNewClassFee({ ...newClassFee, className: e.target.value })}
            required
            disabled={!!editMode}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="">Select Class</option>
            {availableClassesForClassFee.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <input
            type="number"
            value={newClassFee.monthlyFee}
            onChange={(e) => setNewClassFee({ ...newClassFee, monthlyFee: e.target.value })}
            placeholder="Monthly Fee (₹)"
            required
            min="0"
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', width: '150px' }}
          />
          <button
            type="submit"
            style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            {editMode ? 'Update' : 'Add'}
          </button>
          {editMode && (
            <button
              type="button"
              onClick={handleCancel}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          )}
        </form>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={tableHeaderStyle}>Class</th>
              <th style={tableHeaderStyle}>Tuition Fee (₹)</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classFees.length === 0 ? (
              <tr><td colSpan="3" style={tableCellStyle}>No class fees configured</td></tr>
            ) : (
              classFees.map(f => (
                <tr key={f.className} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={tableCellStyle}>{f.className}</td>
                  <td style={tableCellStyle}>₹{f.monthlyFee.toLocaleString()}</td>
                  <td style={tableCellStyle}>
                    <button
                      onClick={() => handleEdit(f)}
                      style={{ ...actionBtnStyle, backgroundColor: '#3b82f6' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(f.className)}
                      style={{ ...actionBtnStyle, backgroundColor: '#ef4444' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <button
        onClick={() => navigate(-1)}
        style={{ marginTop: '2rem', padding: '0.6rem 1.2rem', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        ← Back
      </button>
    </div>
  );
};

const tableHeaderStyle = {
  padding: '0.75rem',
  textAlign: 'left',
  fontWeight: '600',
  color: '#1e293b',
  borderBottom: '2px solid #cbd5e1'
};

const tableCellStyle = {
  padding: '0.75rem',
  textAlign: 'left',
  color: '#334155'
};

const actionBtnStyle = {
  padding: '0.4rem 0.8rem',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  marginRight: '0.5rem',
  fontSize: '0.9rem'
};

export default FeesManagement;