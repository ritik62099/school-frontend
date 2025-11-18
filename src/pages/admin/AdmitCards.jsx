// src/pages/admin/AdmitCards.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';
import Logo from '../../assets/logo.png';
import { useStudents } from '../../hooks/useStudents';

const AdmitCards = () => {
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [backendClasses, setBackendClasses] = useState([]);
  const navigate = useNavigate();

  const [session, setSession] = useState('2025-2026');
  const [examDates, setExamDates] = useState(' ');
  const [validityNote, setValidityNote] = useState('This admit card is valid for S.A I 2025-26');
  const [customNote, setCustomNote] = useState(
    "Those who will not have their Admit card will not be allowed to sit in the examination."
  );

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
    const convertLogoToBase64 = async () => {
      try {
        const response = await fetch(Logo);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64Logo = reader.result;

          // ✅ ensure image actually loaded before marking ready
          const img = new Image();
          img.onload = () => {
            setLogoBase64(base64Logo);
            setLogoLoaded(true);
          };
          img.onerror = () => {
            console.error("Logo failed to load visually");
            setLogoLoaded(true); // allow UI
          };
          img.src = base64Logo;
        };

        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Error loading logo:", err);
        setLogoLoaded(true);
      }
    };

    convertLogoToBase64();
  }, []);


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

const printCard = (student) => {
  if (!logoLoaded || !logoBase64) {
    alert("School logo is still loading. Please wait a few seconds and try again.");
    return;
  }

  const fallbackPhoto = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="65" height="75" viewBox="0 0 65 75">
      <rect width="65" height="75" fill="#f0f0f0"/>
      <text x="50%" y="45%" font-size="10" fill="#aaa" text-anchor="middle">No</text>
      <text x="50%" y="60%" font-size="10" fill="#aaa" text-anchor="middle">Photo</text>
    </svg>`)}
  `;

  const photoUrl =
    student.photo && student.photo.trim() !== "" ? student.photo : fallbackPhoto;

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
  <html>
    <head>
      <title>Admit Card - ${student.name}</title>

      <style>
        @media print {
          @page { size: A4; margin: 8mm; }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
          }

          .page {
            width: 210mm;
            height: 279mm;
            display: flex;
            flex-wrap: wrap;
            align-content: flex-start;
            justify-content: flex-start;
            padding: 8mm;
          }

          .card {
            width: calc(50% - 2mm);
            height: calc((259mm - 4mm) / 2.9);
            border: 1px solid #000;
            border-radius: 10px;
            padding: 6px;
            margin: 1mm;
            box-sizing: border-box;
            background: white;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1.5px solid #000;
            padding-bottom: 4px;
          }

          .logo {
            width: 55px;
            height: 45px;
            object-fit: contain;
            margin-right: 10px;
          }

          .school-name {
            color: #e74c3c;
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            text-align: center;
          }

          .session {
            font-size: 12px;
            margin: 1px 0;
            text-align: center;
            color: #27ae60;
          }

          .admit-title {
            text-align: center;
            background: #34495e;
            color: white;
            font-weight: bold;
            border-radius: 20px;
            padding: 3px 12px;
            width: fit-content;
            margin: 5px auto;
            font-size: 12px;
          }

          .details-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-top: 6px;
            padding: 2px 0;
            flex: 1;
          }

          .left-details {
            width: 68%;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .right-photo {
            width: 20%;
            display: flex;
            justify-content: flex-end;
            align-items: flex-start;
            // padding-left: 6px;
           
          }

          .student-photo {
            width: 100px;
            height: 90px;
            border: 1px solid #000;
            object-fit: cover;
            border-radius: 5px;
            margin-right: 10px;
          }

          .detail-row {
            display: flex;
            align-items: center;
            font-size: 14px;
            margin-bottom: 5px;
          }

          .detail-row.combined {
            gap: 16px;
            font-size: 14px;
          }

          .label {
            font-weight: 600;
            min-width: 45px;
            font-size: 14px;
          }

          .value {
            font-size: 14px;
            font-weight: 500;
          }

          .detail-rowss {
            margin-bottom: 15px;
          }

          .note {
            background: #ffffff;
            border-top: 1.5px solid #000;
            padding: 4px;
            font-size: 12px;
            margin-top: 4px;
          }

          ul {
            padding-left: 18px;
            margin: 4px 0;
          }

          li {
            line-height: 1.4;
          }
        }
      </style>
    </head>

    <body>
      <div class="page">
        <div class="card">
          <div class="header">
            <img src="${logoBase64}" class="logo" />
            <div>
              <h2 class="school-name">AMBIKA INTERNATIONAL SCHOOL</h2>
              <p class="session">Saidpur, Dighwara (Saran), 841207</p>
              <p class="session">Session: - ${session}</p>
            </div>
          </div>

          <div class="admit-title">Admit Card</div>

          <div class="details-row">
            <div class="left-details">
              <div class="detail-row">
                <span class="label">Name :</span>
                <span class="value">${student.name}</span>
              </div>

              <div class="detail-row">
                <span class="label">Father's Name :</span>
                <span class="value">Mr. ${student.fatherName}</span>
              </div>

              <div class="detail-row combined">
                <span class="value">Class: ${student.class}</span>
                <span class="value">Roll No: ${student.rollNo}</span>
                <span class="value">Sec: ${student.section}</span>
              </div>
            </div>

            <div class="right-photo">
              <img src="${photoUrl}" class="student-photo" />
            </div>
          </div>

          <div class="detail-rowss">
            <span class="label">Date of Examination :</span>
            <span class="value">${examDates}</span>
          </div>

          <div class="note">
            <strong>Note:-</strong>
            <ul>
              <li>${validityNote}</li>
              <li>${customNote}</li>
            </ul>
          </div>
        </div>
      </div>
    </body>
  </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};


  const printAllCards = () => {
    if (!logoLoaded || !logoBase64) {
      alert("School logo is still loading. Please wait a few seconds and try again.");
      return;
    }

    const studentsToPrint = filteredStudents.length > 0 ? filteredStudents : students;
    if (studentsToPrint.length === 0) return;

    const printWindow = window.open("", "_blank");
    let pagesHtml = "";

    // SVG placeholder (always works offline)
    const noPhotoSvg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="65" height="75" viewBox="0 0 65 75">
      <rect width="65" height="75" fill="#f0f0f0"/>
      <text x="50%" y="45%" font-size="10" fill="#aaa" text-anchor="middle">No</text>
      <text x="50%" y="60%" font-size="10" fill="#aaa" text-anchor="middle">Photo</text>
    </svg>`
    );
    const fallbackPhoto = `data:image/svg+xml,${noPhotoSvg}`;

    for (let i = 0; i < studentsToPrint.length; i += 6) {
      const pageStudents = studentsToPrint.slice(i, i + 6);
      const cardElements = pageStudents
        .map((student) => {
          const photoUrl = student.photo && student.photo.trim() !== ""
            ? student.photo
            : fallbackPhoto;

          return `
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

        <div class="details-row">
          <div class="left-details">
            <div class="detail-row">
              <span class="label">Name :</span>
              <span class="value">${student.name || "N/A"}</span>
            </div>
            <div class="detail-row">
              <span class="labels">Father's Name :</span>
              <span class="value">Mr. ${student.fatherName || "N/A"}</span>
            </div>
            <div class="detail-row combined">
              <span class="values">Class: ${student.class || "N/A"}</span>
              <span class="values">Roll No: ${student.rollNo || "N/A"}</span>
              <span class="values">Sec: ${student.section || "N/A"}</span>
            </div>
            </div>
            <div class="right-photo">
            <img src="${photoUrl}" class="student-photo" />
            </div>
            </div>
            <div class="detail-rowss">
              <span class="label">Date of Examination :</span>
              <span class="value">${examDates}</span>
            </div>

        <div class="note">
          <strong>Note:-</strong>
          <ul>
            <li>${validityNote}</li>
            <li>${customNote}</li>
          </ul>
        </div>
      </div>
    `;
        })
        .join("");

      pagesHtml += `<div class="page">${cardElements}</div>`;
    }

    printWindow.document.write(`
    <html>
      <head>
        <title>All Admit Cards</title>
        <style>
          @media print {
            @page { size: A4; margin: 8mm; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
            }
            .page {
              width: 210mm;
              height: 279mm;
              display: flex;
              flex-wrap: wrap;
              page-break-after: always;
            }
            .card {
              width: calc(50% - 2mm);
              height: calc((259mm - 4mm) / 2.9);
              border: 1px solid #000;
              border-radius: 10px;
              padding: 6px;
              margin: 1mm;
              box-sizing: border-box;
              background: white;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: center;
              border-bottom: 1.5px solid #000;
              padding-bottom: 4px;
            }
            .logo {
              width: 55px;
              height: 45px;
              object-fit: contain;
              margin-right: 10px;
            }
            .school-name {
              color: #e74c3c;
              font-size: 18px;
              font-weight: bold;
              margin: 0;
              text-align: center;
            }
            .session {
              font-size: 12px;
              margin: 1px 0;
              text-align: center;
              color: #27ae60;
            }
            .admit-title {
              text-align: center;
              background: #34495e;
              color: white;
              font-weight: bold;
              border-radius: 20px;
              padding: 3px 12px;
              width: fit-content;
              margin: 5px auto;
              font-size: 12px;
            }
            .details-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-top: 8px;
              padding: 2px 0;
              flex: 1;
            }
            .left-details {
              width: 68%;
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            .right-photo {
              width: 20%;
              display: flex;
              justify-content: flex-end;
              align-items: flex-start;
              padding-left: 6px;
            }
            .student-photo {
              width: 100px;
              height: 90px;
              border: 1px solid #000;
              object-fit: cover;
              border-radius: 5px;
             margin-right : 15px;
            }
            .detail-row {
              display: flex;
              align-items: center;
              font-size: 14px;
              margin-bottom: 5px;
            }
   .detail-row.combined {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 30px;
  width: 100%;
}

.values {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

            .label {
              font-weight: 600;
              min-width: 50px;
              font-size: 14px;
              
            }
            .labels {
              font-weight: 600;
              min-width: 100px;
              font-size: 14px;
              
            }
            
            .value {
              font-size: 14px;
              font-weight: 500;
            }

            .detail-rowss{
            margin-bottom: 15px;
            }
            .note {
              background: #ffffffff;
              border-top: 1.5px solid #000;
              padding: 4px;
              font-size: 12px;
              margin-top: 4px;
            }
            ul {
              padding-left: 18px;
              margin: 4px 0;
            }
            li {
              line-height: 1.4;
            }
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

    // Wait a bit for images to load before printing (optional but helpful)
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 800);
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
          <div className="control-group">
            <label>General Note</label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}

            />
          </div>

        </div>
      </div>

      <div className="filter-section">
        <label>Filter by Class:</label>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">All Classes</option>
          {classOptions.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div className="button-group">
        <button onClick={() => navigate(-1)} className="btn btn-back">
          ← Back to Dashboard
        </button>
        <button
          onClick={printAllCards}
          disabled={filteredStudents.length === 0 || !logoLoaded || !logoBase64}
          className="btn btn-print"
        >
          🖨️ Print All ({filteredStudents.length})
        </button>
      </div>

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
                disabled={!logoLoaded || !logoBase64}
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
