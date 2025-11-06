

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
    photo: '',
    transport: false,
    transportFee: ''
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [allowedClasses, setAllowedClasses] = useState([]);
  const navigate = useNavigate();

   const currentUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(endpoints.classes.list, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const classes = await res.json();
          const currentUser = JSON.parse(localStorage.getItem('user'));

          if (currentUser?.role === 'teacher' && Array.isArray(currentUser.teachingAssignments)) {
            const classSet = new Set();
            currentUser.teachingAssignments.forEach(a => {
              if (a.canMarkAttendance && a.class) classSet.add(a.class);
            });
            const allowed = Array.from(classSet);
            setAllowedClasses(allowed);
            if (allowed.length > 0) setFormData(prev => ({ ...prev, class: allowed[0] }));
          } else if (currentUser?.role === 'admin') {
            setAllowedClasses(classes);
            if (classes.length > 0) setFormData(prev => ({ ...prev, class: classes[0] }));
          }
        }
      } catch (err) {
        console.error('Failed to load classes', err);
      }
    };
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
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

    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser?.role === 'teacher' && !allowedClasses.includes(formData.class)) {
      setMessage(allowedClasses.length === 0
        ? 'You are not permitted to add students. Contact admin for attendance access.'
        : `You can only add students to classes: ${allowedClasses.join(', ')}`
      );
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

    if (formData.transport) {
      const fee = Number(formData.transportFee);
      if (!fee || fee <= 0) {
        setMessage('Please enter a valid transport fee amount.');
        setMessageType('error');
        return;
      }
    }

    const uploadData = new FormData();
    uploadData.append('name', formData.name);
    uploadData.append('fatherName', formData.fatherName || '');
    uploadData.append('motherName', formData.motherName || '');
    uploadData.append('class', formData.class);
    uploadData.append('section', formData.section);
    uploadData.append('rollNo', formData.rollNo);
    uploadData.append('mobile', formData.mobile);
    uploadData.append('address', formData.address);
    uploadData.append('aadhar', formData.aadhar);
    uploadData.append('transport', formData.transport);
    if (formData.transport && formData.transportFee) {
      uploadData.append('transportFee', formData.transportFee);
    }
    if (formData.photo) {
      uploadData.append('photo', formData.photo);
    }

    try {
      const res = await fetch(endpoints.students.create, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: uploadData
      });

      const result = await res.json();
      if (res.ok) {
        setMessage('✅ Student added successfully!');
        setMessageType('success');
        setFormData({
          name: '',
          fatherName: '',
          motherName: '',
          class: allowedClasses.length > 0 ? allowedClasses[0] : '',
          section: 'A',
          rollNo: '',
          mobile: '',
          address: '',
          aadhar: '',
          photo: '',
          transport: false,
          transportFee: ''
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
          {/* Full Name */}
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
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              {allowedClasses.length > 0
                ? (JSON.parse(localStorage.getItem('user'))?.role === 'teacher'
                    ? 'Classes (Attendance Access Only)'
                    : 'Select Class')
                : 'No classes available'}
            </label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={allowedClasses.length === 0}
            >
              <option value="">-- Select Class --</option>
              {allowedClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Section</label>
            <select
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

          {/* Parents */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Father's Name</label>
            <input
              name="fatherName"
              type="text"
              value={formData.fatherName}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter father's name"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Mother's Name</label>
            <input
              name="motherName"
              type="text"
              value={formData.motherName}
              onChange={handleChange}
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
              style={styles.input}
              placeholder="12-digit Aadhaar number"
              maxLength="12"
            />
          </div>

         {/* Transport section — Admin only */}
{isAdmin && (
  <>
    <div style={styles.inputGroup}>
      <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          name="transport"
          checked={formData.transport}
          onChange={handleChange}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        Uses School Transport
      </label>
    </div>

    {formData.transport && (
      <div style={styles.inputGroup}>
        <label style={styles.label}>Transport Fee (₹)</label>
        <input
          name="transportFee"
          type="number"
          value={formData.transportFee}
          onChange={handleChange}
          required
          min="1"
          style={styles.input}
          placeholder="e.g., 500"
        />
      </div>
    )}
  </>
)}

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
            <button 
              type="submit" 
              style={styles.submitButton}
              disabled={allowedClasses.length === 0}
            >
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





// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { endpoints } from '../../config/api';

// const AddStudent = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     fatherName: '',
//     motherName: '',
//     class: '',
//     section: 'A',
//     rollNo: '',
//     mobile: '',
//     address: '',
//     aadhar: '',
//     photo: '',
//     transport: false,
//     transportFee: ''
//   });

//   const [photoPreview, setPhotoPreview] = useState(null);
//   const [message, setMessage] = useState('');
//   const [messageType, setMessageType] = useState('');
//   const [allowedClasses, setAllowedClasses] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchClasses = async () => {
//       const token = localStorage.getItem('token');
//       if (!token) return;

//       try {
//         const res = await fetch(endpoints.classes.list, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (res.ok) {
//           const classes = await res.json();
//           const currentUser = JSON.parse(localStorage.getItem('user'));

//           if (currentUser?.role === 'teacher' && Array.isArray(currentUser.teachingAssignments)) {
//             const classSet = new Set();
//             currentUser.teachingAssignments.forEach(a => {
//               if (a.canMarkAttendance && a.class) classSet.add(a.class);
//             });
//             const allowed = Array.from(classSet);
//             setAllowedClasses(allowed);
//             if (allowed.length > 0) setFormData(prev => ({ ...prev, class: allowed[0] }));
//           } else if (currentUser?.role === 'admin') {
//             setAllowedClasses(classes);
//             if (classes.length > 0) setFormData(prev => ({ ...prev, class: classes[0] }));
//           }
//         }
//       } catch (err) {
//         console.error('Failed to load classes', err);
//       }
//     };
//     fetchClasses();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
//     if (message) setMessage('');
//   };

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPhotoPreview(URL.createObjectURL(file));
//       setFormData(prev => ({ ...prev, photo: file }));
//     } else {
//       setPhotoPreview(null);
//       setFormData(prev => ({ ...prev, photo: '' }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (formData.transport) {
//       const fee = Number(formData.transportFee);
//       if (!fee || fee <= 0) {
//         setMessage('Please enter a valid transport fee.');
//         setMessageType('error');
//         return;
//       }
//     }

//     const uploadData = new FormData();
//     Object.entries(formData).forEach(([key, val]) => uploadData.append(key, val));
//     if (formData.photo) uploadData.append('photo', formData.photo);

//     try {
//       const res = await fetch(endpoints.students.create, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         body: uploadData
//       });
//       const result = await res.json();
//       if (res.ok) {
//         setMessage('✅ Student added successfully!');
//         setMessageType('success');
//         setTimeout(() => navigate('/dashboard'), 1500);
//       } else {
//         setMessage(result.message || '❌ Failed to add student.');
//         setMessageType('error');
//       }
//     } catch (err) {
//       console.error('Submission error:', err);
//       setMessage('❌ Network or server error.');
//       setMessageType('error');
//     }
//   };

//   return (
//     <div style={styles.page}>
//       <div style={styles.card}>
//         <h1 style={styles.title}>🎓 Add New Student</h1>
//         <p style={styles.subtitle}>Fill out the student details carefully</p>

//         {message && (
//           <div
//             style={{
//               ...styles.alert,
//               backgroundColor:
//                 messageType === 'success' ? '#dcfce7' : '#fee2e2',
//               borderColor:
//                 messageType === 'success' ? '#16a34a' : '#b91c1c',
//               color: messageType === 'success' ? '#14532d' : '#7f1d1d'
//             }}
//           >
//             {message}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} style={styles.form}>
//           {/* Basic Info */}
//           <div style={styles.grid}>
//             <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
//             <Input label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} />
//             <Input label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} />
//             <Select label="Class" name="class" options={allowedClasses} value={formData.class} onChange={handleChange} required />
//             <Select label="Section" name="section" options={['A', 'B', 'C']} value={formData.section} onChange={handleChange} required />
//             <Input label="Roll No" name="rollNo" value={formData.rollNo} onChange={handleChange} type="number" required />
//             <Input label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} type="tel" placeholder="10-digit number" required />
//             <Input label="Aadhar No" name="aadhar" value={formData.aadhar} onChange={handleChange} type="text" placeholder="12-digit number" required />
//           </div>

//           {/* Address */}
//           <div>
//             <label style={styles.label}>Address</label>
//             <textarea
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               rows="3"
//               style={styles.textarea}
//               placeholder="Enter address"
//             />
//           </div>

//           {/* Transport */}
//           <div style={styles.checkboxRow}>
//             <input
//               type="checkbox"
//               name="transport"
//               checked={formData.transport}
//               onChange={handleChange}
//               style={styles.checkbox}
//             />
//             <label style={styles.label}>Uses School Transport</label>
//           </div>

//           {formData.transport && (
//             <Input
//               label="Transport Fee (₹)"
//               name="transportFee"
//               type="number"
//               value={formData.transportFee}
//               onChange={handleChange}
//               required
//               placeholder="Enter transport fee"
//             />
//           )}

//           {/* Photo Upload */}
//           <div>
//             <label style={styles.label}>Student Photo</label>
//             <input type="file" accept="image/*" onChange={handlePhotoChange} style={styles.fileInput} />
//             {photoPreview && (
//               <img src={photoPreview} alt="Student" style={styles.photo} />
//             )}
//           </div>

//           {/* Buttons */}
//           <div style={styles.actions}>
//             <button type="submit" style={styles.submit}>
//               ➕ Add Student
//             </button>
//             <button type="button" onClick={() => navigate('/dashboard')} style={styles.cancel}>
//               ✖ Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// /* 🎨 Reusable Components */
// const Input = ({ label, name, value, onChange, type = 'text', required = false, placeholder }) => (
//   <div style={styles.field}>
//     <label style={styles.label}>
//       {label}
//       {required && <span style={{ color: 'red' }}> *</span>}
//     </label>
//     <input
//       name={name}
//       type={type}
//       value={value}
//       onChange={onChange}
//       required={required}
//       placeholder={placeholder}
//       style={styles.input}
//     />
//   </div>
// );

// const Select = ({ label, name, options, value, onChange, required }) => (
//   <div style={styles.field}>
//     <label style={styles.label}>
//       {label}
//       {required && <span style={{ color: 'red' }}> *</span>}
//     </label>
//     <select
//       name={name}
//       value={value}
//       onChange={onChange}
//       required={required}
//       style={styles.input}
//     >
//       <option value="">-- Select --</option>
//       {options.map((opt) => (
//         <option key={opt} value={opt}>
//           {opt}
//         </option>
//       ))}
//     </select>
//   </div>
// );

// /* 🌈 Modern School Styles */
// const styles = {
//   page: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'flex-start',
//     background: 'linear-gradient(to bottom right, #e0f2fe, #ecfdf5)',
//     minHeight: '100vh',
//     padding: '2rem 1rem'
//   },
//   card: {
//     width: '100%',
//     maxWidth: '750px',
//     backgroundColor: 'white',
//     borderRadius: '20px',
//     boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
//     padding: '2.5rem',
//     transition: 'all 0.3s ease'
//   },
//   title: {
//     textAlign: 'center',
//     color: '#1e3a8a',
//     fontSize: '1.9rem',
//     fontWeight: '700',
//     marginBottom: '0.5rem'
//   },
//   subtitle: {
//     textAlign: 'center',
//     color: '#475569',
//     fontSize: '1rem',
//     marginBottom: '1.5rem'
//   },
//   alert: {
//     padding: '1rem',
//     borderRadius: '10px',
//     border: '1px solid',
//     marginBottom: '1rem',
//     textAlign: 'center',
//     fontWeight: '600'
//   },
//   form: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '1.2rem'
//   },
//   grid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
//     gap: '1rem'
//   },
//   field: {
//     display: 'flex',
//     flexDirection: 'column'
//   },
//   label: {
//     fontSize: '0.9rem',
//     color: '#334155',
//     fontWeight: '600',
//     marginBottom: '0.3rem'
//   },
//   input: {
//     padding: '0.7rem 0.9rem',
//     border: '1px solid #cbd5e1',
//     borderRadius: '10px',
//     backgroundColor: '#f8fafc',
//     fontSize: '1rem',
//     outline: 'none',
//     transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
//   },
//   textarea: {
//     width: '100%',
//     padding: '0.7rem',
//     borderRadius: '10px',
//     border: '1px solid #cbd5e1',
//     backgroundColor: '#f8fafc',
//     fontSize: '1rem',
//     outline: 'none'
//   },
//   checkboxRow: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.5rem',
//     marginTop: '0.5rem'
//   },
//   checkbox: {
//     width: '18px',
//     height: '18px',
//     cursor: 'pointer'
//   },
//   fileInput: {
//     padding: '0.4rem',
//     borderRadius: '8px',
//     border: '1px solid #cbd5e1',
//     backgroundColor: '#f8fafc',
//     cursor: 'pointer'
//   },
//   photo: {
//     width: '120px',
//     height: '120px',
//     objectFit: 'cover',
//     borderRadius: '12px',
//     marginTop: '0.7rem',
//     border: '2px solid #3b82f6',
//     boxShadow: '0 0 10px rgba(59,130,246,0.4)'
//   },
//   actions: {
//     display: 'flex',
//     justifyContent: 'center',
//     gap: '1rem',
//     marginTop: '1.5rem',
//     flexWrap: 'wrap'
//   },
//   submit: {
//     backgroundColor: '#2563eb',
//     color: 'white',
//     padding: '0.9rem 2rem',
//     borderRadius: '10px',
//     border: 'none',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'all 0.3s ease',
//   },
//   cancel: {
//     backgroundColor: '#94a3b8',
//     color: 'white',
//     padding: '0.9rem 2rem',
//     borderRadius: '10px',
//     border: 'none',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'all 0.3s ease',
//   }
// };

// export default AddStudent;
