
// src/pages/admin/IDCardsStudent.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';
import Logo from "../../assets/logo.png";
import BackgroundImage from "../../assets/background.png"; 
import { useStudents } from '../../hooks/useStudents';

const SCHOOL_LOGO_URL = Logo;

const IDCardsStudent = () => {
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [bgBase64, setBgBase64] = useState('');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [backendClasses, setBackendClasses] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const navigate = useNavigate();

  const { students, loading } = useStudents();

  // ✅ Generate class options
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

  // ✅ Filter by class
  useEffect(() => {
    if (!selectedClass) setFilteredStudents(students);
    else setFilteredStudents(students.filter(s => s.class === selectedClass));
  }, [selectedClass, students]);

  // ✅ Fetch classes
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

  // ✅ Convert school logo to base64
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

  // ✅ Convert background to base64
  useEffect(() => {
    const convertBackgroundToBase64 = async () => {
      try {
        const response = await fetch(BackgroundImage);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setBgBase64(reader.result);
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Error loading background image:", err);
      }
    };
    convertBackgroundToBase64();
  }, []);

  // ✅ Print Single Student
  const printIDCard = (student) => generatePrint([student]);

  // ✅ Print Selected Students
  const printSelected = () => {
    const studentsToPrint = filteredStudents.filter(s => selectedStudents.includes(s._id));
    if (studentsToPrint.length === 0) {
      alert("Please select at least one student.");
      return;
    }
    generatePrint(studentsToPrint);
  };

  // ✅ Print All Students
  const printAll = () => {
    if (filteredStudents.length === 0) return alert("No students found!");
    generatePrint(filteredStudents);
  };


  const generatePrint = (studentsList) => {
    if (!logoLoaded || !logoBase64 || !bgBase64) {
      alert("Images are still loading. Please wait...");
      return;
    }

    const printWindow = window.open('', '_blank');

    const cardsHtml = studentsList.map(student => `
    <div class="id-card">
      <div class="header">
        <img src="${logoBase64}" alt="School Logo" />
        <div class="school-name">AMBIKA <br> INTERNATIONAL SCHOOL</div>
        <div class="school-address">SAIDPUR, DIGHWARA (SARAN)</div>
      </div>
      <div class="photo">
        <img src="${student.photo || 'https://via.placeholder.com/100'}" alt="Student Photo" />
      </div>
      <div class="info">
        <div class="info-row"><span class="label">NAME</span> : ${student.name || 'N/A'}</div>
        <div class="info-row"><span class="label">FATHER</span> : ${student.fatherName || 'N/A'}</div>
        <div class="info-row"><span class="label">CLASS</span> : ${student.class || 'N/A'}</div>
        <div class="info-row"><span class="label">MOB</span> : ${student.mobile || 'N/A'}</div>
        <div class="info-row"><span class="label">ADD</span> : ${student.address?.substring(0, 18) || 'N/A'}</div>
      </div>
      <div class="footer">
        <div class="sign"></div>
        <div>PRINCIPAL</div>
      </div>
    </div>
  `).join('');

    printWindow.document.write(`
    <html>
      <head>
        <title>Student ID Cards</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 6mm;
            }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }

          body {
            font-family: Arial, sans-serif;
            background: #fff;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 6mm;
            justify-items: center;
            align-items: center;
            margin: 0;
            padding: 6mm;
            height: 100%;
            box-sizing: border-box;
          }

          .id-card {
            width: 70mm; /* Adjusted for better fit */
            height: 88mm;
            background: url('${bgBase64}') no-repeat center center;
            background-size: cover;
            border: 0.3mm solid #003399;
            border-radius: 2mm;
            padding: 2mm;
            box-sizing: border-box;
            position: relative;
            page-break-inside: avoid;
          }

          .header {
            text-align: center;
            color: #003399;
            font-weight: bold;
            line-height: 1.2;
          }
          .header img {
            width: 15mm;
            margin-bottom: 1mm;
          }
          .school-name { font-size: 4mm; }
          .school-address { font-size: 2.3mm; }

          .photo {
            display: flex;
            justify-content: center;
            margin-top: 2mm;
          }
          .photo img {
            width: 20mm;
            height: 20mm;
            border-radius: 50%;
            border: 0.3mm solid #003399;
            object-fit: cover;
          }

          .info {
            margin-top: 2mm;
            font-size: 3mm;
            padding: 0 5mm;
          }

          .info-row {
            display: flex;
            justify-content: flex-start;
            align-items: baseline;
            margin: 0.8mm 0;
          }

          .label {
            display: inline-block;
            width: 12mm; /* label ke liye fixed width */
            font-weight: bold;
          }

          .footer {
            position: absolute;
            bottom: 3mm;
            left: 30mm;
            right: 0;
            text-align: center;
            font-size: 2.5mm;
          }
          .sign {
            width: 20mm;
            margin: 0 auto 0.5mm;
            border-top: 0.2mm solid #000;
          }
        </style>
      </head>
      <body>${cardsHtml}</body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // ✅ Select checkbox toggle
  const toggleSelect = (id) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // ✅ UI Section
  if (loading || !logoLoaded || !bgBase64) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Student ID Cards (with Background)</h2>

      {/* Filter Section */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <label><b>Filter by Class:</b></label>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">All</option>
          {classOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
        </select>
        <button onClick={printAll} style={btnStyle('#2ecc71')}>🖨️ Print All</button>
        <button onClick={printSelected} style={btnStyle('#3498db')}>🖨️ Print Selected ({selectedStudents.length})</button>
      </div>

      {/* Card Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {filteredStudents.map(student => (
          <div key={student._id} style={{ textAlign: 'center', border: selectedStudents.includes(student._id) ? '2px solid #3498db' : 'none', borderRadius: '6px', padding: '4px' }}>
            <input
              type="checkbox"
              checked={selectedStudents.includes(student._id)}
              onChange={() => toggleSelect(student._id)}
              style={{ marginBottom: '4px' }}
            />
            <div style={{
              backgroundImage: `url(${bgBase64})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1px solid #003399',
              borderRadius: '6px',
              width: '160px',
              height: '250px',
              padding: '4px',
              position: 'relative'
            }}>
              <div style={{ textAlign: 'center', color: '#003399', fontSize: '10px', fontWeight: 'bold' }}>
                <img src={logoBase64} alt="logo" style={{ width: '40px', marginBottom: '4px' }} />
                <div>AMBIKA INTERNATIONAL SCHOOL</div>
                <div style={{ fontSize: '8px', color: '#555' }}>SAIDPUR, DIGHWARA (SARAN)</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                <img src={student.photo || 'https://via.placeholder.com/100'} alt="Student" style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  border: '1px solid #003399',
                  objectFit: 'cover'
                }} />
              </div>
              <div style={{ fontSize: '9px', marginTop: '6px', textAlign: 'left', padding: '0 6px' }}>
                <div><b>NAME</b> : {student.name || 'N/A'}</div>
                <div><b>FATHER</b> : {student.fatherName || 'N/A'}</div>
                <div><b>CLASS</b> : {student.class || 'N/A'}</div>
                <div><b>MOB</b> : {student.mobile || 'N/A'}</div>
                <div><b>ADD</b> : {student.address?.substring(0, 15) || 'N/A'}</div>
              </div>
              <div style={{ position: 'absolute', bottom: '10px', width: '100%', textAlign: 'center', fontSize: '8px' }}>
                <div style={{ borderTop: '1px solid black', width: '60px', margin: '0 auto 2px' }}></div>
                <div>PRINCIPAL</div>
              </div>
            </div>
            <button onClick={() => printIDCard(student)} style={btnStyle('#16a085', '0.5rem')}>Print ID</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const btnStyle = (bg, mt = '0') => ({
  marginTop: mt,
  background: bg,
  color: 'white',
  border: 'none',
  padding: '6px 10px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
});

export default IDCardsStudent;
