
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    class: '',
    section: 'A',
    rollNo: '',
    mobile: '',
    address: '',
    aadhar: '',
    photo: ''
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const navigate = useNavigate();


 useEffect(() => {
  const fetchClasses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Fetch all classes from backend
      const res = await fetch(endpoints.classes.list, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const classes = await res.json();
        setAllClasses(classes);

        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser?.role === 'teacher') {
          const assigned = currentUser.assignedClasses || [];
          setAssignedClasses(assigned);
          if (assigned.length > 0) {
            setFormData(prev => ({ ...prev, class: assigned[0] }));
          } else if (classes.length > 0) {
            setFormData(prev => ({ ...prev, class: classes[0] }));
          }
        } else if (classes.length > 0) {
          // Admin: select first class by default
          setFormData(prev => ({ ...prev, class: classes[0] }));
        }
      }
    } catch (err) {
      console.error('Failed to load classes', err);
    }
  };

  fetchClasses();
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, photo: file }));
    } else {
      setPhotoPreview(null);
      setFormData(prev => ({ ...prev, photo: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (assignedClasses.length > 0 && !assignedClasses.includes(formData.class)) {
      setMessage(`You can only add students to your assigned classes: ${assignedClasses.join(', ')}`);
      setMessageType('error');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setMessage('Please enter a valid 10-digit Indian mobile number (starting with 6-9).');
      setMessageType('error');
      return;
    }

    if (!/^\d{12}$/.test(formData.aadhar)) {
      setMessage('Aadhaar number must be exactly 12 digits.');
      setMessageType('error');
      return;
    }

    if (!/^\d+$/.test(formData.rollNo)) {
      setMessage('Roll number must be numeric.');
      setMessageType('error');
      return;
    }

    const uploadData = new FormData();
    for (let key in formData) {
      if (formData[key]) {
        uploadData.append(key, formData[key]);
      }
    }

    try {
      const res = await fetch(endpoints.students.create, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: uploadData
      });

      const result = await res.json();

      if (res.ok) {
        setMessage('✅ Student added and photo uploaded successfully!');
        setMessageType('success');
        setFormData({
          name: '',
          fatherName: '',
          motherName: '',
          class: assignedClasses.length > 0 ? assignedClasses[0] : '',
          section: 'A',
          rollNo: '',
          mobile: '',
          address: '',
          aadhar: '',
          photo: ''
        });
        setPhotoPreview(null);
        setTimeout(() => navigate('/dashboard'), 1800);
      } else {
        setMessage(result.message || '❌ Failed to add student.');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setMessage('❌ Network or server error.');
      setMessageType('error');
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>Add New Student</h2>

        {message && (
          <div style={{
            ...styles.message,
            backgroundColor: messageType === 'success' ? '#d1fae5' : '#fee2e2',
            color: messageType === 'success' ? '#065f46' : '#b91c1c',
            border: messageType === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Name */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter student's full name"
            />
          </div>

          {/* Class */}
          {/* Class */}
<div style={styles.inputGroup}>
  <label style={styles.label}>
    {assignedClasses.length > 0 ? 'Select Class (Your Assigned)' : 'Select Class'}
  </label>
  {assignedClasses.length > 0 ? (
    <select
      name="class"
      value={formData.class}
      onChange={handleChange}
      required
      style={styles.input}
    >
      <option value="">-- Choose a class --</option>
      {assignedClasses.map(cls => (
        <option key={cls} value={cls}>{cls}</option>
      ))}
    </select>
  ) : (
    <select
      name="class"
      value={formData.class}
      onChange={handleChange}
      required
      style={styles.input}
    >
      <option value="">-- Select Class --</option>
      {allClasses.map(cls => (
        <option key={cls} value={cls}>{cls}</option>
      ))}
    </select>
  )}
</div>

          {/* Section */}
          <div style={styles.inputGroup}>
            <label htmlFor="section" style={styles.label}>Section</label>
            <select
              id="section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          {/* Roll Number */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Roll Number</label>
            <input
              name="rollNo"
              type="text"
              value={formData.rollNo}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="1, 2, 3..."
              inputMode="numeric"
            />
          </div>

          {/* Father’s Name */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Father's Name</label>
            <input
              name="fatherName"
              type="text"
              value={formData.fatherName}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter father's name"
            />
          </div>

          {/* Mother’s Name */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Mother's Name</label>
            <input
              name="motherName"
              type="text"
              value={formData.motherName}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter mother's name"
            />
          </div>

          {/* Mobile */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Mobile Number</label>
            <input
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="10-digit mobile number"
              maxLength="10"
            />
          </div>

          {/* Address */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              style={{ ...styles.input, minHeight: '60px' }}
              placeholder="Enter address"
            />
          </div>

          {/* Aadhaar */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Aadhaar Number</label>
            <input
              name="aadhar"
              type="text"
              value={formData.aadhar}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="12-digit Aadhaar number"
              maxLength="12"
            />
          </div>

          {/* Photo */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Student Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ ...styles.input, padding: '0.5rem' }}
            />
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Student preview"
                style={styles.photoPreview}
              />
            )}
          </div>

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.submitButton}>
              Add Student
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ✅ Styles (same as before)
const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem 1rem',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    padding: '2rem',
    border: '1px solid #e2e8f0'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '1.5rem',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#334155'
  },
  input: {
    padding: '0.875rem',
    fontSize: '1rem',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    outline: 'none'
  },
  photoPreview: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginTop: '0.5rem',
    border: '1px solid #e2e8f0'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  submitButton: {
    padding: '0.875rem 2rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cancelButton: {
    padding: '0.875rem 2rem',
    backgroundColor: '#94a3b8',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  message: {
    padding: '0.875rem',
    borderRadius: '10px',
    fontWeight: '500',
    marginBottom: '1rem',
    textAlign: 'center'
  }
};

export default AddStudent;
