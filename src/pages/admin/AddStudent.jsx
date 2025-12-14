
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';

const AddStudent = () => {
  const navigate = useNavigate();

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
    photo: '',
    transport: false,
    transportFee: '',
    dob: '',
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [allowedClasses, setAllowedClasses] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = currentUser?.role === 'admin';

  /* ---------------- FETCH CLASSES ---------------- */
  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(endpoints.classes.list, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;
        const classes = await res.json();

        if (currentUser?.role === 'teacher') {
          const set = new Set();
          currentUser.teachingAssignments?.forEach(a => {
            if (a.canMarkAttendance && a.class) set.add(a.class);
          });
          const arr = [...set];
          setAllowedClasses(arr);
          if (arr[0]) setFormData(p => ({ ...p, class: arr[0] }));
        } else {
          setAllowedClasses(classes);
          if (classes[0]) setFormData(p => ({ ...p, class: classes[0] }));
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchClasses();
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    setMessage('');
  };

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setFormData(p => ({ ...p, photo: file }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setMessageType('error');
      setMessage('Invalid mobile number');
      return;
    }

    if (!/^\d+$/.test(formData.rollNo)) {
      setMessageType('error');
      setMessage('Roll number must be numeric');
      return;
    }

    if (formData.transport && (!formData.transportFee || formData.transportFee <= 0)) {
      setMessageType('error');
      setMessage('Enter valid transport fee');
      return;
    }

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== '' && v !== null) fd.append(k, v);
    });

    try {
      const res = await fetch(endpoints.students.create, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      });

      const result = await res.json();
      if (res.ok) {
        setMessageType('success');
        setMessage('✅ Student added successfully');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setMessageType('error');
        setMessage(result.message || 'Failed to add student');
      }
    } catch {
      setMessageType('error');
      setMessage('Server error');
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Add New Student</h2>
            <p style={styles.subtitle}>Personal & academic information</p>
          </div>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            ...styles.message,
            background: messageType === 'success' ? '#dcfce7' : '#fee2e2',
            color: messageType === 'success' ? '#166534' : '#991b1b',
          }}>
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="Full Name">
            <input name="name" value={formData.name} onChange={handleChange} required style={styles.input} />
          </Field>

          <Field label="Class">
            <select name="class" value={formData.class} onChange={handleChange} style={styles.input}>
              {allowedClasses.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Section">
            <select name="section" value={formData.section} onChange={handleChange} style={styles.input}>
              <option>A</option><option>B</option><option>C</option>
            </select>
          </Field>

          <Field label="Roll Number">
            <input name="rollNo" value={formData.rollNo} onChange={handleChange} style={styles.input} />
          </Field>

          <Field label="Father's Name">
            <input name="fatherName" value={formData.fatherName} onChange={handleChange} style={styles.input} />
          </Field>

          <Field label="Mother's Name">
            <input name="motherName" value={formData.motherName} onChange={handleChange} style={styles.input} />
          </Field>

          <Field label="Mobile">
            <input name="mobile" value={formData.mobile} onChange={handleChange} style={styles.input} />
          </Field>

          <Field label="Date of Birth">
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} style={styles.input} />
          </Field>

          <Field label="Address">
            <textarea name="address" value={formData.address} onChange={handleChange} style={styles.textarea} />
          </Field>

          {isAdmin && (
            <>
              <label style={styles.checkbox}>
                <input type="checkbox" name="transport" checked={formData.transport} onChange={handleChange} />
                Uses School Transport
              </label>

              {formData.transport && (
                <Field label="Transport Fee">
                  <input name="transportFee" value={formData.transportFee} onChange={handleChange} style={styles.input} />
                </Field>
              )}
            </>
          )}

          <Field label="Photo">
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            {photoPreview && <img src={photoPreview} alt="" style={styles.photo} />}
          </Field>

          <div style={styles.actions}>
            <button type="submit" style={styles.submit}>Add Student</button>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.cancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- SMALL COMPONENT ---------------- */
const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
    <label style={{ fontWeight: 600 }}>{label}</label>
    {children}
  </div>
);

/* ---------------- STYLES ---------------- */
const styles = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem',
    background: 'linear-gradient(180deg,#f8fafc,#eef2ff)',
  },
  card: {
    width: '100%',
    maxWidth: 700,
    background: '#fff',
    borderRadius: 20,
    padding: '2rem',
    boxShadow: '0 20px 40px rgba(0,0,0,.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  title: { margin: 0, fontSize: '1.8rem' },
  subtitle: { margin: 0, color: '#64748b' },
  backBtn: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    padding: '.4rem 1rem',
    cursor: 'pointer',
  },
  message: {
    padding: '.75rem',
    borderRadius: 10,
    marginBottom: '1rem',
    fontWeight: 600,
    textAlign: 'center',
  },
  form: { display: 'grid', gap: '1rem' },
  input: {
    padding: '.75rem',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
  },
  textarea: {
    padding: '.75rem',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    minHeight: 70,
  },
  checkbox: {
    display: 'flex',
    gap: '.5rem',
    fontWeight: 600,
  },
  photo: {
    width: 110,
    height: 110,
    borderRadius: 12,
    marginTop: '.5rem',
    objectFit: 'cover',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '1.5rem',
  },
  submit: {
    background: 'linear-gradient(135deg,#2563eb,#1e40af)',
    color: '#fff',
    border: 'none',
    padding: '.8rem 2rem',
    borderRadius: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  cancel: {
    background: '#94a3b8',
    color: '#fff',
    border: 'none',
    padding: '.8rem 2rem',
    borderRadius: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default AddStudent;
