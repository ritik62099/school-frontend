// src/pages/admin/IDCards.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';
import Logo from "../../assets/logo.png";
import { useStudents } from '../../hooks/useStudents'; // ✅ Only this needed

const SCHOOL_LOGO_URL = Logo;

const IDCards = () => {
  // ✅ Sirf yeh states rakhein
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [backendClasses, setBackendClasses] = useState([]);
  const navigate = useNavigate();

  // ✅ Hook se students le rahe hain
  const { students, loading, error } = useStudents(); // ✅ No manual fetch

  const classOptions = useMemo(() => {
  // Get classes that actually have students
  const studentClasses = [...new Set(students.map(s => s.class).filter(Boolean))];
  
  // Use backend classes, but only those that have students
  return backendClasses
    .filter(cls => studentClasses.includes(cls))
    .sort((a, b) => {
      // Optional: sort in logical order
      const order = ["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th",
                     "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
      return (order.indexOf(a) - order.indexOf(b)) || a.localeCompare(b);
    });
}, [students, backendClasses]);

  // ✅ Filter students
  useEffect(() => {
    if (!selectedClass) {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter(s => s.class === selectedClass));
    }
  }, [selectedClass, students]);


  // ✅ Fetch classes from backend
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
        setBackendClasses(classes);
      }
    } catch (err) {
      console.error('Failed to load classes', err);
    }
  };

  fetchClasses();
}, []);
  // ✅ Logo loading (same as before)
  useEffect(() => {
    const convertLogoToBase64 = async () => {
      try {
        const response = await fetch(SCHOOL_LOGO_URL);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result);
          setLogoLoaded(true);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Error loading logo:", err);
        setLogoLoaded(true);
      }
    };
    convertLogoToBase64();
  }, []);
  // ✅ Print single ID card
  const printIDCard = (student) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ID Card - ${student.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #fff; 
              display: flex;
              justify-content: left;
              align-items: left;
              min-height: 100vh;
            }
            .id-card {
              width: 350px;
              height: 230px;
              border: 2px solid #2c3e50;
              border-radius: 8px;
              position: relative;
              background: white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              padding: 10px;
              box-sizing: border-box;
              font-size: 11px;
            }
            .header {
              position: absolute;
              top: 10px;
              right: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .school-logo {
              width: 36px;
              height: 36px;
              object-fit: contain;
              border-radius: 4px;
            }
            .school-name {
              font-weight: bold;
              font-size: 16px;
              color: #2c3e50;
              margin: 0;
              line-height: 1.2;
            }
            .school-address {
              font-size: 10px;
              color: #7f8c8d;
              margin-top: 4px;
              text-align: center;
            }
            .photo-placeholder {
              position: absolute;
              left: 10px;
              bottom: 60px;
              width: 80px;
              height: 90px;
              border: 1px solid #ddd;
              background: #f5f5f5;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: #999;
            }
            .photo-placeholder img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .details {
              position: absolute;
              left: 120px;
              top: 50px;
              line-height: 1.5;
            }
            .detail-row {
              margin: 4px 0;
              display: flex;
              justify-content: flex-start;
            }
            .label {
              display: inline-block;
              width: 51px;
              font-weight: bold;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="header">
              <img 
                src="${logoBase64}" 
                alt="School Logo" 
                class="school-logo"
              />
              <div>
                <p class="school-name">AMBICA INTERNATIONAL SCHOOL</p>
                <p class="school-address">SAIDPUR, DIGHWARA SARAN</p>
              </div>
            </div>

            <div class="photo-placeholder">
              ${student.photo ? `<img src="${student.photo}" alt="Student Photo" />` : '<div style="font-size:10px;color:#999;text-align:center;height:100%;display:flex;align-items:center;justify-content:center;">PHOTO</div>'}
            </div>

            <div class="details">
              <div class="detail-row"><span class="label">NAME</span> : ${student.name || 'N/A'}</div>
              <div class="detail-row"><span class="label">FATHER</span> : ${student.fatherName || 'N/A'}</div>
              <div class="detail-row"><span class="label">CLASS</span> : ${student.class || 'N/A'}</div>
              <div class="detail-row"><span class="label">ROLL NO</span> : ${student.rollNo || 'N/A'}</div>
              <div class="detail-row"><span class="label">MOB</span> : ${student.mobile || 'N/A'}</div>
              <div class="detail-row"><span class="label">ADD</span> : ${student.address || 'N/A'}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // ✅ Print ALL ID Cards (Grid layout - 3 per row, multiple pages)
  const printAllIDCards = () => {
    const studentsToPrint = filteredStudents.length > 0 ? filteredStudents : students;
    if (studentsToPrint.length === 0) return;

    const printWindow = window.open('', '_blank');

    // Generate HTML for all cards
    const cardsHtml = studentsToPrint.map(student => `
      <div class="id-card-wrapper">
        <div class="id-card">
          <div class="header">
            <img src="${logoBase64}" alt="School Logo" class="school-logo" />
            <div>
              <p class="school-name">AMBICA INTERNATIONAL SCHOOL</p>
              <p class="school-address">SAIDPUR, DIGHWARA SARAN</p>
            </div>
          </div>
          <div class="photo-placeholder">
            ${student.photo ? `<img src="${student.photo}" alt="Student Photo" />` : '<div style="font-size:10px;color:#999;text-align:center;height:100%;display:flex;align-items:center;justify-content:center;">PHOTO</div>'}
          </div>
          <div class="details">
            <div class="detail-row"><span class="label">NAME</span> : ${student.name || 'N/A'}</div>
            <div class="detail-row"><span class="label">FATHER</span> : ${student.fatherName || 'N/A'}</div>
            <div class="detail-row"><span class="label">CLASS</span> : ${student.class || 'N/A'}</div>
            <div class="detail-row"><span class="label">ROLL NO</span> : ${student.rollNo || 'N/A'}</div>
            <div class="detail-row"><span class="label">MOB</span> : ${student.mobile || 'N/A'}</div>
            <div class="detail-row"><span class="label">ADD</span> : ${student.address || 'N/A'}</div>
          </div>
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>All ID Cards</title>
          <style>
            @media print {
              @page { size: A4; margin: 5mm; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background: white;
              }
              .container {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
              }
              .id-card-wrapper {
                width: 350px;
                margin-bottom: 10px;
              }
              .id-card {
                width: 100%;
                height: 230px;
                border: 2px solid #2c3e50;
                border-radius: 8px;
                position: relative;
                background: white;
                box-shadow: none;
                padding: 10px;
                box-sizing: border-box;
                font-size: 11px;
              }
              .header {
                position: absolute;
                top: 10px;
                right: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .school-logo {
                width: 36px;
                height: 36px;
                object-fit: contain;
                border-radius: 4px;
              }
              .school-name {
                font-weight: bold;
                font-size: 16px;
                color: #2c3e50;
                margin: 0;
                line-height: 1.2;
              }
              .school-address {
                font-size: 10px;
                color: #7f8c8d;
                margin-top: 4px;
                text-align: center;
              }
              .photo-placeholder {
                position: absolute;
                left: 10px;
                bottom: 60px;
                width: 80px;
                height: 90px;
                border: 1px solid #ddd;
                background: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #999;
              }
              .photo-placeholder img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              .details {
                position: absolute;
                left: 120px;
                top: 50px;
                line-height: 1.5;
              }
              .detail-row {
                margin: 4px 0;
                display: flex;
                justify-content: flex-start;
              }
              .label {
                display: inline-block;
                width: 51px;
                font-weight: bold;
                text-align: left;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${cardsHtml}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (loading || !logoLoaded) {
    return <div style={pageStyles.center}>Loading...</div>;
  }

  return (
    <div style={pageStyles.container}>
      <h2>ID Cards</h2>

      {/* Class Filter */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 'bold', color: '#2c3e50' }}>Filter by Class:</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            minWidth: '150px'
          }}
        >
          <option value="">All Classes</option>
          {classOptions.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* ✅ Print All Button */}
      <div style={{ ...pageStyles.buttonGroup, marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} style={pageStyles.backBtn}>
          ← Back to Dashboard
        </button>
        <button
          onClick={printAllIDCards}
          disabled={filteredStudents.length === 0}
          style={{
            ...pageStyles.printBtn,
            backgroundColor: filteredStudents.length === 0 ? '#bdc3c7' : '#27ae60',
            cursor: filteredStudents.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          🖨️ Print All ({filteredStudents.length})
        </button>
      </div>

      {filteredStudents.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#e74c3c', marginTop: '1rem' }}>
          No students found for selected class.
        </p>
      ) : (
        <div style={pageStyles.cardGrid}>
          {filteredStudents.map((student) => (
            <div key={student._id} style={pageStyles.cardWrapper}>
              <div style={idCardStyles.idCard}>
                <div style={idCardStyles.header}>
                  <img
                    src={SCHOOL_LOGO_URL}
                    alt="School Logo"
                    style={idCardStyles.schoolLogo}
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                  <div>
                    <p style={idCardStyles.schoolName}>AMBICA INTERNATIONAL SCHOOL</p>
                    <p style={idCardStyles.schoolAddress}>SAIDPUR, DIGHWARA SARAN</p>
                  </div>
                </div>

                <div style={idCardStyles.photoPlaceholder}>
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt="Student Photo"
                      style={idCardStyles.photo}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.textContent = 'PHOTO';
                        fallback.style.cssText = idCardStyles.photoFallback.cssText;
                        e.target.parentNode.appendChild(fallback);
                      }}
                    />
                  ) : (
                    <div style={idCardStyles.photoFallback}>PHOTO</div>
                  )}
                </div>

                <div style={idCardStyles.details}>
                  <div style={idCardStyles.detailRow}><span style={idCardStyles.label}>NAME</span> : {student.name || 'N/A'}</div>
                  <div style={idCardStyles.detailRow}><span style={idCardStyles.label}>FATHER</span> : {student.fatherName || 'N/A'}</div>
                  <div style={idCardStyles.detailRow}><span style={idCardStyles.label}>CLASS</span> : {student.class || 'N/A'}</div>
                  <div style={idCardStyles.detailRow}><span style={idCardStyles.label}>ROLL NO</span> : {student.rollNo || 'N/A'}</div>
                  <div style={idCardStyles.detailRow}><span style={idCardStyles.label}>MOB</span> : {student.mobile || 'N/A'}</div>
                  <div style={idCardStyles.detailRow}><span style={idCardStyles.label}>ADD</span> : {student.address || 'N/A'}</div>
                </div>
              </div>

              <button 
                onClick={() => printIDCard(student)}
                disabled={!logoLoaded}
                style={{
                  ...pageStyles.printBtn,
                  backgroundColor: '#16a085',
                  marginTop: '1rem',
                  opacity: logoLoaded ? 1 : 0.6,
                  cursor: logoLoaded ? 'pointer' : 'not-allowed'
                }}
              >
                Print ID Card
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ Styles
const pageStyles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
  },
  center: {
    textAlign: 'center',
    marginTop: '2rem',
  },
  backBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '2rem',
    marginTop: '1rem',
    justifyContent: 'center',
  },
  cardWrapper: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  printBtn: {
    padding: '0.4rem 0.8rem',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

const idCardStyles = {
  idCard: {
    width: '350px',
    height: '220px',
    border: '2px solid #2c3e50',
    borderRadius: '8px',
    position: 'relative',
    background: 'white',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    padding: '10px',
    boxSizing: 'border-box',
    fontSize: '11px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  schoolLogo: {
    width: '36px',
    height: '36px',
    objectFit: 'contain',
    borderRadius: '4px',
  },
  schoolName: {
    margin: '0',
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#2c3e50',
    lineHeight: '1.2',
  },
  schoolAddress: {
    fontSize: '10px',
    color: '#7f8c8d',
    marginTop: '4px',
    textAlign: 'center',
  },
  photoPlaceholder: {
    position: 'absolute',
    left: '10px',
    bottom: '60px',
    width: '80px',
    height: '90px',
    border: '1px solid #ddd',
    background: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: '#999',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoFallback: {
    fontSize: '10px',
    color: '#999',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  details: {
    position: 'absolute',
    left: '120px',
    top: '50px',
    lineHeight: '1.5',
  },
  detailRow: {
    margin: '4px 0',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  label: {
    display: 'inline-block',
    width: '51px',
    fontWeight: 'bold',
    textAlign: 'left',
  },
};

export default IDCards;