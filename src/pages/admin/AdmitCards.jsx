// src/pages/admin/AdmitCards.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo.png';
import { endpoints } from '../../config/api';

const AdmitCards = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Class options (as per your preference)
  const classOptions = [
    "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th",
    "6th", "7th", "8th", "9th", "10th", "11th", "12th"
  ];

  // ✅ Fetch all students once
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(endpoints.students.list, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const studentList = Array.isArray(data) ? data : [];
        setStudents(studentList);
        setFilteredStudents(studentList); // Initially show all
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // ✅ Filter students when class changes
  useEffect(() => {
    if (!selectedClass) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(s => s.class === selectedClass);
      setFilteredStudents(filtered);
    }
  }, [selectedClass, students]);

  const [logoBase64, setLogoBase64] = useState('');

  useEffect(() => {
    const convertLogoToBase64 = async () => {
      try {
        const response = await fetch(Logo);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setLogoBase64(reader.result);
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Error loading logo:", err);
      }
    };
    convertLogoToBase64();
  }, []);

  // ✅ Reusable print logic (single card)
  const printCard = (student) => {
    const examStart = student.examStartDate || new Date().toLocaleDateString();
    const examEnd = student.examEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Admit Card - ${student.name}</title>
          <style>
            @media print {
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 8mm; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: white; }
              .card-container { width: 210mm; height: calc(239mm / 3); border: 1.5px solid #3498db; padding: 10px; border-radius: 6px; background: white; display: flex; flex-direction: column; justify-content: flex-start; overflow: hidden; }
              .header { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; border-bottom: 1.5px solid #ddd; padding-bottom: 4px; }
              .logo { width: 40px; height: 40px; object-fit: contain; }
              .school-name { color: #e74c3c; font-size: 13px; font-weight: bold; margin: 0; }
              .session { color: #27ae60; font-size: 11px; font-weight: 600; margin: 1px 0; }
              .admit-title { background: #34495e; color: white; padding: 3px 7px; border-radius: 3px; font-weight: bold; display: inline-block; margin: 6px 0; font-size: 12px; }
              .details { text-align: left; margin: 8px 0; font-size: 11px; line-height: 1.35; flex-grow: 1; }
              .detail-row { display: flex; margin-bottom: 3px; }
              .label { font-weight: bold; color: #2c3e50; }
              .note { background: #f9f9f9; padding: 6px; border-left: 3px solid #e74c3c; margin-top: auto; font-size: 10px; }
              .footer { margin-top: 5px; font-size: 9px; color: #7f8c8d; font-style: italic; }
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            <div class="header">
              <img src="${logoBase64}" alt="School Logo" class="logo">
              <div>
                <h2 class="school-name">AMBIKA INTERNATIONAL SCHOOL</h2>
                <p class="session">SAIDPUR, DIGHWARA</p>
                <p class="session">Session: - 2025-2026</p>
              </div>
            </div>
            <div class="admit-title">Admit Card</div>
            <div class="details">
              <div class="detail-row"><span class="label">Name : </span> <span>${student.name || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Father's Name : </span> <span>Mr. ${student.fatherName || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Class : </span> <span>${student.class || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Roll No : </span> <span>${student.rollNo || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Sec : </span> <span>${student.section || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Date of Examination : </span> <span>${examStart} to ${examEnd}</span></div>
            </div>
            <div class="note">
              <div><strong>Note:-</strong></div>
              <ul style="padding-left:15px; margin:5px 0;">
                <li>This admit card is valid for S.A I 2025-26.</li>
                <li>Those who will not have their Admit Card, they will not be allowed to sit in the examination.</li>
              </ul>
            </div>
            <div class="footer">This is a computer-generated admit card. No signature required.</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // ✅ Print all filtered students (by class)
  const printAllCards = () => {
    const studentsToPrint = filteredStudents.length > 0 ? filteredStudents : students;

    const printWindow = window.open('', '_blank');

    let pagesHtml = '';
    for (let i = 0; i < studentsToPrint.length; i += 3) {
      const pageStudents = studentsToPrint.slice(i, i + 3);
      const pageCards = pageStudents.map(student => {
        const examStart = student.examStartDate || new Date().toLocaleDateString();
        const examEnd = student.examEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();
        return `
          <div class="card">
            <div class="header">
              <img src="${logoBase64}" alt="School Logo" class="logo">
              <div>
                <h2 class="school-name">AMBIKA INTERNATIONAL SCHOOL</h2>
                <p class="session">SAIDPUR, DIGHWARA</p>
                <p class="session">Session: - 2025-2026</p>
              </div>
            </div>
            <div class="admit-title">Admit Card</div>
            <div class="details">
              <div class="detail-row"><span class="label">Name : </span><span>${student.name || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Father's Name: </span><span>Mr. ${student.fatherName || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Class : </span><span>${student.class || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Roll No : </span><span>${student.rollNo || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Sec : </span><span>${student.section || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Date of Examination : </span><span>${examStart} to ${examEnd}</span></div>
            </div>
            <div class="note">
              <strong>Note:-</strong>
              <ul style="padding-left:15px; margin:5px 0;">
                <li>This admit card is valid for S.A I 2025-26.</li>
                <li>Those who will not have their Admit Card, they will not be allowed to sit in the examination.</li>
              </ul>
            </div>
            <div class="footer">This is a computer-generated admit card. No signature required.</div>
          </div>
        `;
      }).join('');

      pagesHtml += `<div class="page">${pageCards}</div>`;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>All Admit Cards</title>
          <style>
            @media print {
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 8mm; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: white; }
              .page { display: flex; flex-direction: column; height: 279mm; width: 210mm; page-break-after: always; }
              .card { width: 100%; box-sizing: border-box; border: 1.5px solid #3498db; padding: 10px; border-radius: 6px; background: white; flex: 1; display: flex; flex-direction: column; justify-content: flex-start; overflow: hidden; break-inside: avoid; }
              .page > .card:not(:last-child) { margin-bottom: 6mm; }
              .header { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 8px; border-bottom: 1.5px solid #ddd; padding-bottom: 4px; }
              .logo { width: 40px; height: 40px; object-fit: contain; }
              .school-name { color: #e74c3c; font-size: 24px; font-weight: bold; margin: 0; }
              .session { color: #27ae60; font-size: 16px; font-weight: 600; margin: 1px 0; display: flex; justify-content: center; }
              .admit-title { background: #34495e; color: white; padding: 3px 7px; border-radius: 3px; font-weight: bold; display: flex; justify-content: center; margin: 6px 0; font-size: 12px; }
              .details { text-align: left; margin: 8px 0; font-size: 11px; line-height: 1.35; flex-grow: 1; }
              .detail-row { display: flex; margin-bottom: 3px; }
              .label { font-weight: bold; color: #2c3e50; }
              .note { background: #f9f9f9; padding: 6px; border-left: 3px solid #e74c3c; margin-top: auto; font-size: 10px; }
              .footer { margin-top: 5px; font-size: 9px; color: #7f8c8d; font-style: italic; }
            }
          </style>
        </head>
        <body>
          ${pagesHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (loading) return <div style={pageStyles.center}>Loading students...</div>;

  return (
    <div style={pageStyles.container}>
      <h2>Admit Cards</h2>

      {/* ✅ Class Dropdown */}
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

      <div style={pageStyles.buttonGroup}>
        <button onClick={() => navigate(-1)} style={pageStyles.backBtn}>← Back to Dashboard</button>
        <button
          onClick={printAllCards}
          disabled={filteredStudents.length === 0}
          style={{
            ...pageStyles.printBtn,
            backgroundColor: filteredStudents.length === 0 ? '#bdc3c7' : '#e74c3c',
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
            <div key={student._id} style={pageStyles.card}>
              <h3>{student.name}</h3>
              <p><strong>Class:</strong> {student.class}</p>
              <p><strong>Roll No:</strong> {student.rollNo}</p>
              <button onClick={() => printCard(student)} style={pageStyles.printBtn}>
                Print Single Card
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const pageStyles = {
  container: { padding: '2rem', fontFamily: 'Arial, sans-serif' },
  center: { textAlign: 'center', marginTop: '2rem' },
  backBtn: {
    marginBottom: '1.5rem', padding: '0.5rem 1rem',
    backgroundColor: '#3498db', color: 'white',
    border: 'none', borderRadius: '4px', cursor: 'pointer'
  },
  buttonGroup: {
    display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap'
  },
  cardGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem', marginTop: '1rem'
  },
  card: {
    border: '1px solid #ddd', borderRadius: '8px', padding: '1rem',
    textAlign: 'center', backgroundColor: '#f9f9f9'
  },
  printBtn: {
    marginTop: '10px', padding: '0.4rem 0.8rem',
    backgroundColor: '#9b59b6', color: 'white',
    border: 'none', borderRadius: '4px', cursor: 'pointer'
  },
};

export default AdmitCards;