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
  const [logoBase64, setLogoBase64] = useState('');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const navigate = useNavigate();

  const [session, setSession] = useState('2025-2026');
  const [examDates, setExamDates] = useState('15 Nov 2025 – 25 Nov 2025');
  const [validityNote, setValidityNote] = useState('This admit card is valid for S.A I 2025-26');

  const classOptions = [
    "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th",
    "6th", "7th", "8th", "9th", "10th", "11th", "12th"
  ];

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(endpoints.students.list, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const studentList = Array.isArray(data) ? data : [];
        setStudents(studentList);
        setFilteredStudents(studentList);
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Filter by class
  useEffect(() => {
    if (!selectedClass) {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter(s => s.class === selectedClass));
    }
  }, [selectedClass, students]);

  // Load logo as Base64
  useEffect(() => {
    const convertLogoToBase64 = async () => {
      try {
        const response = await fetch(Logo);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result);
          setLogoLoaded(true);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Error loading logo:", err);
        setLogoLoaded(true); // Allow UI even if logo fails
      }
    };
    convertLogoToBase64();
  }, []);

  // Print single card
  const printCard = (student) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Admit Card - ${student.name}</title>
          <style>
            @media print {
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 8mm; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: white; width: 100%; }
              .card {
                width: 210mm;
                height: calc((297mm - 16mm) / 3);
                border: 1.5px solid #3498db;
                border-radius: 6px;
                padding: 6px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                font-size: 10px;
                background: white;
              }
              .header { 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                gap: 16px; 
                margin-bottom: 8px; 
                border-bottom: 1.5px solid #ddd; 
                padding-bottom: 4px; 
              }
              .logo { 
                width: 60px; 
                height: 50px; 
                object-fit: contain; 
              }
              .school-name { 
                color: #e74c3c; 
                font-size: 24px; 
                font-weight: bold; 
                margin: 0; 
              }
              .session { 
                color: #27ae60; 
                font-size: 16px; 
                font-weight: 600; 
                margin: 1px 0; 
                display: flex; 
                justify-content: center; 
              }
              .admit-title { 
                background: #34495e; 
                color: white; 
                padding: 3px 7px; 
                border-radius: 3px; 
                font-weight: bold; 
                display: flex; 
                justify-content: center; 
                margin: 6px 0; 
                font-size: 12px; 
              }
              .details { 
                text-align: left; 
                margin: 8px 0; 
                font-size: 11px; 
                line-height: 1.35; 
                flex-grow: 1; 
              }
              .detail-row { 
                display: flex; 
                margin-bottom: 3px; 
              }
              .label { 
                font-weight: bold; 
                color: #2c3e50; 
                min-width: 120px;
              }
              .note { 
                background: #f9f9f9; 
                padding: 6px; 
                border-left: 3px solid #e74c3c; 
                margin-top: auto; 
                font-size: 10px; 
              }
              .footer { 
                margin-top: 5px; 
                font-size: 9px; 
                color: #7f8c8d; 
                font-style: italic; 
              }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <img src="${logoBase64}" alt="School Logo" class="logo">
              <div>
                <h2 class="school-name">AMBIKA INTERNATIONAL SCHOOL</h2>
                <p class="session">Saidpur, Dighwara (Saran), 841207</p>
                <p class="session">Session: - ${session}</p>
              </div>
            </div>
            <div class="admit-title">Admit Card</div>
            <div class="details">
              <div class="detail-row"><span class="label">Name :</span> <span>${student.name || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Father's Name:</span> <span>Mr. ${student.fatherName || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Class :</span> <span>${student.class || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Roll No :</span> <span>${student.rollNo || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Sec :</span> <span>${student.section || 'N/A'}</span></div>
              <div class="detail-row"><span class="label">Date of Examination :</span> <span>${examDates}</span></div>
            </div>
            <div class="note">
              <strong>Note:-</strong>
              <ul style="padding-left:15px; margin:5px 0;">
                <li>${validityNote}</li>
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

  // Print all cards
  const printAllCards = () => {
    const studentsToPrint = filteredStudents.length > 0 ? filteredStudents : students;
    if (studentsToPrint.length === 0) return;

    const printWindow = window.open('', '_blank');
    let pagesHtml = '';

    for (let i = 0; i < studentsToPrint.length; i += 3) {
      const pageStudents = studentsToPrint.slice(i, i + 3);
      const pageCards = pageStudents.map(student => `
        <div class="card">
          <div class="header">
            <img src="${logoBase64}" alt="School Logo" class="logo">
            <div>
              <h2 class="school-name">AMBIKA INTERNATIONAL SCHOOL</h2>
              <p class="session">Saidpur, Dighwara (Saran), 841207</p>
              <p class="session">Session: - ${session}</p>
            </div>
          </div>
          <div class="admit-title">Admit Card</div>
          <div class="details">
            <div class="detail-row"><span class="label">Name :</span> <span>${student.name || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Father's Name:</span> <span>Mr. ${student.fatherName || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Class :</span> <span>${student.class || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Roll No :</span> <span>${student.rollNo || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Sec :</span> <span>${student.section || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Date of Examination :</span> <span>${examDates}</span></div>
          </div>
          <div class="note">
            <strong>Note:-</strong>
            <ul style="padding-left:15px; margin:5px 0;">
              <li>${validityNote}</li>
              <li>Those who will not have their Admit Card, they will not be allowed to sit in the examination.</li>
            </ul>
          </div>
          <div class="footer">This is a computer-generated admit card. No signature required.</div>
        </div>
      `).join('');

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
              .card {
                width: 98%;
                height: calc((297mm - 16mm) / 3);
                border: 1.5px solid #3498db;
                border-radius: 6px;
                padding: 6px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                margin-bottom: 4mm;
                font-size: 10px;
                background: white;
              }
              .page > .card:not(:last-child) { margin-bottom: 6mm; }
              .header { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 8px; border-bottom: 1.5px solid #ddd; padding-bottom: 4px; }
              .logo { width: 60px; height: 50px; object-fit: contain; }
              .school-name { color: #e74c3c; font-size: 24px; font-weight: bold; margin: 0; }
              .session { color: #27ae60; font-size: 16px; font-weight: 600; margin: 1px 0; display: flex; justify-content: center; }
              .admit-title { background: #34495e; color: white; padding: 3px 7px; border-radius: 3px; font-weight: bold; display: flex; justify-content: center; margin: 6px 0; font-size: 12px; }
              .details { text-align: left; margin: 8px 0; font-size: 11px; line-height: 1.35; flex-grow: 1; }
              .detail-row { display: flex; margin-bottom: 3px; }
              .label { font-weight: bold; color: #2c3e50; min-width: 120px; }
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

  if (loading || !logoLoaded) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: '#7f8c8d' }}>
        Loading admit cards...
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Poppins, Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <style>{`
        .page-title {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 1.5rem;
          font-size: 1.8rem;
          font-weight: 700;
        }
        .controls-section {
          background: white;
          padding: 1.2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          margin-bottom: 1.5rem;
        }
        .controls-title {
          margin-top: 0;
          margin-bottom: 1rem;
          color: #2c3e50;
          font-size: 1.2rem;
        }
        .controls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .control-group label {
          display: block;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.4rem;
          color: #2c3e50;
        }
        .control-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.95rem;
        }
        .filter-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .filter-section label {
          font-weight: 600;
          color: #2c3e50;
        }
        .filter-section select {
          padding: 0.5rem 0.8rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          min-width: 160px;
        }
        .button-group {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .btn {
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .btn-back {
          background: #3498db;
          color: white;
        }
        .btn-back:hover {
          background: #2980b9;
        }
        .btn-print {
          background: #e74c3c;
          color: white;
        }
        .btn-print:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .student-card {
          background: white;
          border-radius: 12px;
          padding: 1.2rem;
          box-shadow: 0 3px 10px rgba(0,0,0,0.08);
          text-align: center;
          transition: transform 0.2s;
        }
        .student-card:hover {
          transform: translateY(-3px);
        }
        .student-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 0.5rem 0;
        }
        .student-detail {
          font-size: 0.95rem;
          color: #7f8c8d;
          margin: 0.3rem 0;
        }
        .print-single-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #9b59b6;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
        }
        .print-single-btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
        .empty-state {
          text-align: center;
          color: #e74c3c;
          padding: 2rem;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .controls-grid {
            grid-template-columns: 1fr;
          }
          .filter-section {
            flex-direction: column;
            align-items: stretch;
          }
          .button-group {
            flex-direction: column;
          }
          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <h2 className="page-title">Admit Cards</h2>

      {/* Editable Details */}
      <div className="controls-section">
        <h3 className="controls-title">Admit Card Details</h3>
        <div className="controls-grid">
          <div className="control-group">
            <label>Session</label>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            />
          </div>
          <div className="control-group">
            <label>Exam Dates</label>
            <input
              type="text"
              value={examDates}
              onChange={(e) => setExamDates(e.target.value)}
            />
          </div>
          <div className="control-group">
            <label>Validity Note</label>
            <input
              type="text"
              value={validityNote}
              onChange={(e) => setValidityNote(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Class Filter */}
      <div className="filter-section">
        <label>Filter by Class:</label>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">All Classes</option>
          {classOptions.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="button-group">
        <button onClick={() => navigate(-1)} className="btn btn-back">
          ← Back to Dashboard
        </button>
        <button
          onClick={printAllCards}
          disabled={filteredStudents.length === 0}
          className="btn btn-print"
        >
          🖨️ Print All ({filteredStudents.length})
        </button>
      </div>

      {/* Student Cards */}
      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          No students found for the selected class.
        </div>
      ) : (
        <div className="card-grid">
          {filteredStudents.map((student) => (
            <div key={student._id} className="student-card">
              <div className="student-name">{student.name}</div>
              <div className="student-detail"><strong>Class:</strong> {student.class}</div>
              <div className="student-detail"><strong>Roll No:</strong> {student.rollNo}</div>
              <div className="student-detail"><strong>Section:</strong> {student.section || 'N/A'}</div>
              <button
                onClick={() => printCard(student)}
                disabled={!logoLoaded}
                className="print-single-btn"
              >
                Print Single Card
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdmitCards;