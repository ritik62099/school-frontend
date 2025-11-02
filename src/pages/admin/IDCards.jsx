// src/pages/admin/IDCards.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';
import Logo from "../../assets/logo.png";
import { useStudents } from '../../hooks/useStudents';

const SCHOOL_LOGO_URL = Logo;

const IDCards = () => {
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [backendClasses, setBackendClasses] = useState([]);
  const navigate = useNavigate();

  const { students, loading, error } = useStudents(); 

  const classOptions = useMemo(() => {
    const studentClasses = [...new Set(students.map(s => s.class).filter(Boolean))];
    return backendClasses
      .filter(cls => studentClasses.includes(cls))
      .sort((a, b) => {
        const order = ["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th",
                       "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
        return (order.indexOf(a) - order.indexOf(b)) || a.localeCompare(b);
      });
  }, [students, backendClasses]);

  useEffect(() => {
    if (!selectedClass) {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter(s => s.class === selectedClass));
    }
  }, [selectedClass, students]);

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

  // ✅ Print SINGLE Student ID Card (54mm x 85mm) — NEW DESIGN
  const printIDCard = (student) => {
    if (!logoLoaded || !logoBase64) {
      alert("School logo is still loading. Please wait and try again.");
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ID Card - ${student.name}</title>
          <style>
            @media print {
              @page {
                size: 54mm 85mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                background: white;
              }
            }
            body {
              width: 54mm;
              height: 85mm;
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: #f9f9f9;
              box-sizing: border-box;
            }
            .id-card {
              width: 100%;
              height: 100%;
              position: relative;
              overflow: hidden;
              border: 0.5mm solid #2c3e50;
            }
            .header {
              width: 100%;
              height: 28mm;
              background: #2980b9;
              color: white;
              text-align: center;
              padding-top: 3mm;
              box-sizing: border-box;
            }
            .school-name {
              font-size: 4mm;
              font-weight: bold;
              margin: 0;
              line-height: 1.2;
            }
            .school-address {
              font-size: 2.5mm;
              margin: 0.5mm 0 0 0;
            }
            .photo-circle {
              position: absolute;
              top: 26mm;
              left: 50%;
              transform: translateX(-50%);
              width: 20mm;
              height: 20mm;
              border-radius: 50%;
              background: white;
              overflow: hidden;
              box-shadow: 0 0 1mm rgba(0,0,0,0.3);
            }
            .photo-circle img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .content {
              position: absolute;
              top: 47mm;
              left: 0;
              right: 0;
              padding: 1mm 3mm;
              font-size: 3mm;
              line-height: 1.4;
            }
            .name {
              font-size: 4.5mm;
              font-weight: bold;
              text-align: center;
              margin: 0 0 2mm 0;
              color: #2c3e50;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin: 1mm 0;
            }
            .label {
              font-weight: bold;
              min-width: 18mm;
            }
            .value {
              text-align: left;
              flex-grow: 1;
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="header">
              <div class="school-name">AMBICA</div>
              <div class="school-name">INTERNATIONAL SCHOOL</div>
              <div class="school-address">SAIDPUR, DIGHWARA (SARAN)</div>
            </div>
            <div class="photo-circle">
              <img src="${student.photo || 'https://via.placeholder.com/20'}" alt="Student Photo" />
            </div>
            <div class="content">
              <div class="name">${student.name || 'N/A'}</div>
              <div class="detail-row"><span class="label">FATHER</span><span class="value">:- ${student.fatherName || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">CLASS</span><span class="value">:- ${student.class || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">MOB</span><span class="value">:- ${student.mobile || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">ADD</span><span class="value">:- ${student.address?.substring(0, 15) || 'N/A'}</span></div>
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

  // ✅ Print ALL Student ID Cards (A4 with 54x85mm cards in grid) — NEW DESIGN
  const printAllIDCards = () => {
    if (!logoLoaded || !logoBase64) {
      alert("School logo is still loading. Please wait and try again.");
      return;
    }

    const studentsToPrint = filteredStudents.length > 0 ? filteredStudents : students;
    if (studentsToPrint.length === 0) return;

    const printWindow = window.open('', '_blank');

    const cardsHtml = studentsToPrint.map(student => `
      <div class="card-item">
        <div class="id-card">
          <div class="header">
            <div class="school-name">AMBICA</div>
            <div class="school-name">INTERNATIONAL SCHOOL</div>
            <div class="school-address">SAIDPUR, DIGHWARA (SARAN)</div>
          </div>
          <div class="photo-circle">
            <img src="${student.photo || 'https://via.placeholder.com/20'}" alt="Student Photo" />
          </div>
          <div class="content">
            <div class="name">${student.name || 'N/A'}</div>
            <div class="detail-row"><span class="label">FATHER</span><span class="value">:- ${student.fatherName || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">CLASS</span><span class="value">:- ${student.class || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">MOB</span><span class="value">:- ${student.mobile || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">ADD</span><span class="value">:- ${student.address?.substring(0, 15) || 'N/A'}</span></div>
          </div>
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>All Student ID Cards</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 5mm;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background: white;
              }
              .container {
                display: flex;
                flex-wrap: wrap;
                gap: 10mm;
                width: 200mm;
              }
              .card-item {
                width: 54mm;
                height: 85mm;
              }
              .id-card {
                width: 100%;
                height: 100%;
                position: relative;
                overflow: hidden;
                border: 0.3mm solid #2c3e50;
              }
              .header {
                width: 100%;
                height: 28mm;
                background: #2980b9;
                color: white;
                text-align: center;
                padding-top: 3mm;
                box-sizing: border-box;
              }
              .school-name {
                font-size: 4mm;
                font-weight: bold;
                margin: 0;
                line-height: 1.2;
              }
              .school-address {
                font-size: 2.5mm;
                margin: 0.5mm 0 0 0;
              }
              .photo-circle {
                position: absolute;
                top: 26mm;
                left: 50%;
                transform: translateX(-50%);
                width: 20mm;
                height: 20mm;
                border-radius: 50%;
                background: white;
                overflow: hidden;
                box-shadow: 0 0 1mm rgba(0,0,0,0.3);
              }
              .photo-circle img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              .content {
                position: absolute;
                top: 47mm;
                left: 0;
                right: 0;
                padding: 1mm 3mm;
                font-size: 3mm;
                line-height: 1.4;
              }
              .name {
                font-size: 4.5mm;
                font-weight: bold;
                text-align: center;
                margin: 0 0 2mm 0;
                color: #2c3e50;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 1mm 0;
              }
              .label {
                font-weight: bold;
                min-width: 18mm;
              }
              .value {
                text-align: left;
                flex-grow: 1;
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
      <h2>Student ID Cards (54mm × 85mm)</h2>

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

      <div style={{ ...pageStyles.buttonGroup, marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} style={pageStyles.backBtn}>
          ← Back to Dashboard
        </button>
        <button
          onClick={printAllIDCards}
          disabled={filteredStudents.length === 0 || !logoLoaded}
          style={{
            ...pageStyles.printBtn,
            backgroundColor: (filteredStudents.length === 0 || !logoLoaded) ? '#bdc3c7' : '#27ae60',
            cursor: (filteredStudents.length === 0 || !logoLoaded) ? 'not-allowed' : 'pointer'
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
              {/* Preview with NEW DESIGN (scaled) */}
              <div style={{
                width: '160px',
                height: '250px',
                position: 'relative',
                border: '1px solid #2c3e50',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#f9f9f9',
                transform: 'scale(0.8)',
                transformOrigin: 'top left'
              }}>
                <div style={{
                  width: '100%',
                  height: '28%',
                  background: '#2980b9',
                  color: 'white',
                  textAlign: 'center',
                  paddingTop: '8px'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>AMBICA</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>INTERNATIONAL SCHOOL</div>
                  <div style={{ fontSize: '10px', marginTop: '2px' }}>SAIDPUR, DIGHWARA (SARAN)</div>
                </div>
                <div style={{
                  position: 'absolute',
                  top: '28%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 0 4px rgba(0,0,0,0.3)'
                }}>
                  <img
                    src={student.photo || 'https://via.placeholder.com/60'}
                    alt="Student Photo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0',
                  right: '0',
                  padding: '4px 8px',
                  fontSize: '10px',
                  lineHeight: '1.4'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>
                    {student.name || 'N/A'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 'bold' }}>FATHER</span>
                    <span>:- {student.fatherName || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 'bold' }}>CLASS</span>
                    <span>:- {student.class || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 'bold' }}>MOB</span>
                    <span>:- {student.mobile || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold' }}>ADD</span>
                    <span>:- {student.address?.substring(0, 15) || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => printIDCard(student)}
                disabled={!logoLoaded}
                style={{
                  ...pageStyles.printBtn,
                  backgroundColor: '#16a085',
                  marginTop: '0.5rem',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
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

export default IDCards;