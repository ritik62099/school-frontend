// src/pages/admin/EditStudent.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { endpoints } from '../../config/api';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    class: '',
    section: '',
    rollNo: '',
    mobile: '',
    address: '',
    aadhar: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch student data on mount
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${endpoints.students.list}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to load student');
        const student = await res.json();
        setFormData({
          name: student.name || '',
          fatherName: student.fatherName || '',
          motherName: student.motherName || '',
          class: student.class || '',
          section: student.section || '',
          rollNo: student.rollNo || '',
          mobile: student.mobile || '',
          address: student.address || '',
          aadhar: student.aadhar || ''
        });
        setPhotoPreview(student.photo || '');
      } catch (err) {
        setError('Failed to load student data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      // Append all fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') formDataToSend.append(key, value);
      });

      // Append photo if changed
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const res = await fetch(`${endpoints.students.list}/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Update failed');
      }

      alert('Student updated successfully!');
      navigate('/students'); // or back to list
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this student? This cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${endpoints.students.list}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Delete failed');
      alert('Student deleted successfully!');
      navigate('/students');
    } catch (err) {
      alert('Failed to delete student: ' + err.message);
      console.error(err);
    }
  };

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (error) return <div style={{ ...styles.center, color: 'red' }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2>Edit Student</h2>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Back to Students
      </button>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Photo Upload */}
        <div style={styles.photoSection}>
          <label>Photo</label>
          <div style={styles.photoPreviewContainer}>
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" style={styles.photoPreview} />
            ) : (
              <div style={styles.noPhoto}>No photo</div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={styles.fileInput}
          />
        </div>

        {/* Form Fields */}
        <div style={styles.grid}>
          <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
          <InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} />
          <InputField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} />
          <InputField label="Class" name="class" value={formData.class} onChange={handleChange} required />
          <InputField label="Section" name="section" value={formData.section} onChange={handleChange} />
          <InputField label="Roll No" name="rollNo" value={formData.rollNo} onChange={handleChange} type="number" />
          <InputField label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} type="tel" />
          <InputField label="Aadhar No" name="aadhar" value={formData.aadhar} onChange={handleChange} />
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={styles.label}>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              style={styles.textarea}
            />
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.buttonGroup}>
          <button type="submit" disabled={submitting} style={styles.saveBtn}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={handleDelete} style={styles.deleteBtn}>
            Delete Student
          </button>
        </div>
      </form>
    </div>
  );
};

// Reusable Input Field
const InputField = ({ label, name, value, onChange, type = 'text', required = false }) => (
  <div>
    <label style={styles.label}>{label}{required && <span style={{ color: 'red' }}>*</span>}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      style={styles.input}
    />
  </div>
);

// ✅ Styles (internal CSS)
const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '900px',
    margin: '0 auto'
  },
  center: {
    textAlign: 'center',
    marginTop: '2rem',
    fontSize: '1.1rem'
  },
  backBtn: {
    marginBottom: '1.5rem',
    padding: '0.6rem 1.2rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  photoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.8rem'
  },
  photoPreviewContainer: {
    width: '120px',
    height: '120px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f9f9f9'
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  noPhoto: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    fontSize: '14px'
  },
  fileInput: {
    fontSize: '0.95rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.2rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.4rem',
    fontWeight: '600',
    fontSize: '0.95rem'
  },
  input: {
    width: '100%',
    padding: '0.6rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  textarea: {
    width: '100%',
    padding: '0.6rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'Arial, sans-serif'
  },
  error: {
    color: 'red',
    fontSize: '0.95rem'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-start',
    marginTop: '1rem'
  },
  saveBtn: {
    padding: '0.7rem 1.5rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '0.7rem 1.5rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default EditStudent;