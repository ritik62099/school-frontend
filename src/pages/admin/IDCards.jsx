

// src/pages/admin/IDCardsStudent.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { endpoints } from '../../config/api';
import Logo from "../../assets/logo.png";
import BackgroundImage from "../../assets/back.png";
import { useStudents } from '../../hooks/useStudents';

const SCHOOL_LOGO_URL = Logo;

// Helper → Split students into groups of 9 (for each A4 page)
const chunkForNine = (arr) => {
  const pages = [];
  for (let i = 0; i < arr.length; i += 9) {
    pages.push(arr.slice(i, i + 9));
  }
  return pages;
};

// Button style helper
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

const IDCardsStudent = ({ onBack }) => {
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [bgBase64, setBgBase64] = useState('');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [backendClasses, setBackendClasses] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sessionText, setSessionText] = useState(() => {
    return localStorage.getItem("school_session") || "2024-25";
  });

    const handleBackClick = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      window.history.back();
    }
  };



  const { students, loading } = useStudents();

  // ✅ Generate class options
  const classOptions = useMemo(() => {
    const studentClasses = [...new Set(students.map(s => s.class).filter(Boolean))];
    const order = [
      "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th",
      "6th", "7th", "8th", "9th", "10th", "11th", "12th"
    ];

    return backendClasses
      .filter(cls => studentClasses.includes(cls))
      .sort((a, b) => {
        const diff = order.indexOf(a) - order.indexOf(b);
        return diff || a.localeCompare(b);
      });
  }, [students, backendClasses]);

  // ✅ Filter by class
  useEffect(() => {
    if (!selectedClass) {
      // ❌ No class selected → show nothing
      setFilteredStudents([]);
    } else {
      // ✅ Class selected → show only that class
      setFilteredStudents(students.filter(s => s.class === selectedClass));
    }
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
        // Even on error, allow UI (buttons) to show
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
  const printIDCard = (student) => generatePrint([student], sessionText);


  // ✅ Print Selected Students
  const printSelected = () => {
    const studentsToPrint = filteredStudents.filter(s =>
      selectedStudents.includes(s._id)
    );

    if (studentsToPrint.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    generatePrint(studentsToPrint, sessionText);
  };

  // ✅ Print All Students
  const printAll = () => {
    if (filteredStudents.length === 0) {
      alert("No students found!");
      return;
    }
    generatePrint(filteredStudents, sessionText);
  };

  const saveSession = () => {
    localStorage.setItem("school_session", sessionText);
    alert("✔ Session Saved Successfully!");
  };

  const generatePrint = (studentsList, sessionForPrint) => {
    if (!logoLoaded || !logoBase64 || !bgBase64) {
      alert("Images are still loading. Please wait...");
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to print the ID cards.");
      return;
    }

    printWindow.document.write(`
    <html>
      <head>
        <title>ID Card Print</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          @page {
            size: A4;
            margin: 2mm;
          }

          body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 10px;
          }

          .page {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, auto);
            row-gap: 20px;
            column-gap: 10px;
            page-break-after: always;
          }

          .id-card {
            background-image: url('${bgBase64}');
            background-size: cover;
            background-position: center;
            width: 205px;
            height: 322px;
            border: 1px solid #003399;
            border-radius: 6px;
            padding: 4px;
            position: relative;
          }

          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            color: #ffffff;
            width: 100%;
            margin-bottom: 4px;
            position: relative;
          }

          .header-logo {
            width: 42px;
            height: 42px;
            object-fit: contain;
            position: absolute;
            left: 1px;
            margin-bottom: 6px;
          }

          .school-text {
            text-align: center;
            line-height: 1;
            position: relative;
            right: -14px;
          }

          .school-text .line-1 {
            font-size: 16px;
            font-weight: 800;
            letter-spacing: 1px;
            margin-top: 4px;
          }
            .line-1{
            margin-bottom: 2px;
            }

          .school-text .line-2 {
            font-size: 11px;
            font-weight: 700;
            margin-top: -1px;
            margin-left: 12px;
          }

          .school-text .line-3,
          .school-text .line-4 {
            font-size: 9px;
            margin-top: 2px;
          }

          .photo {
            display: flex;
            justify-content: center;
            margin-top: 4px;
          }

          .photo img {
            width: 90px;
            height: 95px;
            border: 1px solid #003399;
            object-fit: cover;
            border-radius: 10px;
          }

          .session {
            text-align: center;
            font-size: 12px;
            font-weight: 600;
            margin-top: 2px;
            color: #000000;
          }

          .student-name {
            text-align: center;
            background-color: #76c4f7ff;
            font-weight: bold;
            font-size: 13px;
            margin-top: 2px;
            padding: 2px 0;
            border-radius: 4px;
            color: #ffffffcf;
          }

          .info {
  font-size: 12px;
  margin-top: 3px;
  text-align: left;
  padding: 0 10px;
  color: #030303ff;
}

.detail-item {
  margin-bottom: 3px;
}

.mob-row {
  display: flex;
  justify-content: space-between;
  margin-right: 15px;
  margin-bottom: 3px;
}

.transport-badge {
  font-weight: bold;
  font-size: 10px;
}

          .flex-between {
            display: flex;
            justify-content: space-between;
            margin-right: 15px;
            margin-bottom: 4px;
          }

          .footer {
            position: absolute;
            bottom: 4px;
            left: 4px;
            width: 93%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 8px;
            font-size: 10px;
          }

          .footer-left {
            font-weight: bold;
          }

          .footer-sign {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .footer-sign-line {
            border-top: 1px solid black;
            width: 60px;
            margin-bottom:1px;
          }
        </style>
      </head>

      <body>
        ${chunkForNine(studentsList).map(page => `
            <div class="page">
              ${page.map(student => `
                  <div class="id-card">
                    <div class="header">
                      <img class="header-logo" src="${logoBase64}" alt="logo" />
                      <div class="school-text">
                        <div class="line-1">AMBIKA</div>
                        <div class="line-2">INTERNATIONAL SCHOOL</div>
                        <div class="line-3">SAIDPUR, DIGHWARA</div>
                        <div class="line-4">SARAN (841207)</div>
                      </div>
                    </div>

                    <div class="photo">
                      <img src="${student.photo || 'https://via.placeholder.com/100'}" alt="Student" />
                    </div>

  <div class="session">
  ${sessionForPrint || "2024-25"}
</div>


                    <div class="student-name">
                      ${student.name || 'N/A'}
                    </div>

                    <div class="info">
                      <div class="detail-item" style="display:flex;">
    <b style="min-width:60px;">FATHER :</b>
    <span style="flex:1; text-wrap:wrap; line-height:14px;">
      ${student.fatherName || "N/A"}
    </span>
</div>

                      <div class="flex-between">
                        <div><b>CLASS</b> : ${student.class || "N/A"}</div>
                        <div><b>ROLL</b> : ${student.rollNo || "N/A"}</div>
                      </div>


                      <div class="detail-item mob-row">
  <span><b>MOB</b> : ${student.mobile || "N/A"}</span>
  ${student.transport
        ? '<span class="transport-badge">BUS</span>'
        : ''
      }
</div>


                      <div class="detail-item">
                        <b>DOB</b> : ${student.dob
        ? new Date(student.dob).toLocaleDateString()
        : "N/A"
      }
                      </div>

                      <div class="detail-item">
                        <b>ADD</b> : ${student.address?.substring(0, 15) || "N/A"}
                      </div>
                    </div>

                    <div class="footer">
                      <div class="footer-left">
                        Mob: 6203080946
                      </div>
                     <div class="footer-sign">
  <div style=" margin-bottom:1px; font-size: 9px; color:red">SONAL KR</div>
  <div class="footer-sign-line"></div>
  <div>SECRETARY</div>
</div>

                    </div>
                  </div>
                `).join('')
      }
            </div>
          `).join('')
      }
      </body>
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

  // ✅ Loading state
  if (loading || !logoLoaded || !bgBase64) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        Loading...
      </div>
    );
  }

   return (
    <>
      <div style={{ padding: '2rem' }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={handleBackClick}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "1px solid #d1d5db",
              background: "#2563eb",
              cursor: "pointer",
              fontSize: "14px",
              color: "white"
            }}
          >
            ← Back
          </button>

          <h2 style={{ margin: 0 }}>Student ID Cards (with Background)</h2>
        </div>


        {/* Filter Section */}
        <div
          style={{
            marginBottom: '1rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <label><b>Filter by Class:</b></label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class</option>   {/* ⭐ Ab "All" nahi, sirf placeholder */}
            {classOptions.map(cls => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>


          {/* ⭐ Session Input + Save Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label><b>Session:</b></label>
            <input
              type="text"
              value={sessionText}
              onChange={(e) => setSessionText(e.target.value)}
              placeholder="2024-25"
              style={{
                padding: "5px 8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "90px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            />

            <button
              onClick={saveSession}
              style={btnStyle('#f39c12')}
            >
              💾 Save
            </button>
          </div>

          <button onClick={printAll} style={btnStyle('#2ecc71')}>
            🖨️ Print All
          </button>

          <button onClick={printSelected} style={btnStyle('#3498db')}>
            🖨️ Print Selected ({selectedStudents.length})
          </button>
        </div>


        {/* Card Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {filteredStudents.map(student => (
            <div
              key={student._id}
              style={{
                textAlign: 'center',
                border: selectedStudents.includes(student._id)
                  ? '2px solid #3498db'
                  : 'none',
                borderRadius: '6px',
                padding: '4px'
              }}
            >
              <input
                type="checkbox"
                checked={selectedStudents.includes(student._id)}
                onChange={() => toggleSelect(student._id)}
                style={{ marginBottom: '4px' }}
              />

              <div
                style={{
                  backgroundImage: `url(${bgBase64})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid #003399',
                  borderRadius: '6px',
                  width: '205px',
                  height: '322px',
                  padding: '4px',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    color: "#fff",
                    width: "100%",
                    marginBottom: "4px"
                  }}
                >
                  {/* LOGO LEFT */}
                  <img
                    src={logoBase64}
                    alt="logo"
                    style={{
                      width: "42px",
                      height: "42px",
                      objectFit: "contain",
                      marginBottom: "6px",
                      position: "absolute",
                      left: "3px"   // 👈 LOGO shifted left

                    }}
                  />

                  {/* TEXT — NOW CENTERED */}
                  <div style={{ textAlign: "center", lineHeight: "1", right: "-10px", position: "relative" }}>
                    <div style={{
                      fontSize: "16px",
                      fontWeight: "800",
                      letterSpacing: "1px",
                      marginTop: "8px"
                    }}>
                      AMBIKA
                    </div>

                    <div style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      marginTop: "-1px"
                    }}>
                      INTERNATIONAL SCHOOL
                    </div>

                    <div style={{ fontSize: "9px", marginTop: "2px" }}>
                      SAIDPUR, DIGHWARA
                    </div>

                    <div style={{ fontSize: "9px" }}>
                      SARAN, BIHAR - 841207
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '8px'
                  }}
                >
                  <img
                    src={student.photo || 'https://via.placeholder.com/100'}
                    alt="Student"
                    style={{
                      width: '90px',
                      height: '95px',
                      border: '1px solid #003399',
                      objectFit: 'cover',
                      borderRadius: '10px'
                    }}
                  />
                </div>

                {/* SESSION BELOW IMAGE */}
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginTop: '2px',
                    color: '#000000ff'
                  }}
                >
                  {sessionText || "2024-25"}
                </div>


                {/* Student Name Under Photo */}
                < div
                  style={{
                    textAlign: 'center',
                    backgroundColor: '#76c4f7ff',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    marginTop: '4px',
                    padding: '2px 0',
                    borderRadius: '4px',
                    color: '#ffffffcf'

                  }}
                >
                  {student.name || 'N/A'}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    marginTop: '6px',
                    textAlign: 'left',
                    padding: '0 10px',
                    color: '#030303ff'

                  }}
                >
                  <div className="detail-item">
                    <b>FATHER</b> : {student.fatherName || 'N/A'}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                      marginRight: '15px'
                    }}
                  >
                    <div><b>CLASS</b> : {student.class || 'N/A'}</div>
                    <div><b>ROLL</b> : {student.rollNo || 'N/A'}</div>
                  </div>

                  <div
                    className="detail-item"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginRight: '15px',
                    }}
                  >
                    <span>
                      <b>MOB</b> : {student.mobile || 'N/A'}
                    </span>

                    {student.transport && (
                      <span style={{ fontWeight: 'bold', fontSize: '11px' }}>
                        BUS
                      </span>
                    )}
                  </div>


                  <div className="detail-item">
                    <b>DOB</b> : {
                      student.dob
                        ? new Date(student.dob).toLocaleDateString()
                        : 'N/A'
                    }
                  </div>

                  <div className="detail-item">
                    <b>ADD</b> : {student.address?.substring(0, 15) || 'N/A'}
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "0",
                    width: "93%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 8px",
                    fontSize: "10px",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>
                    Mob: 6203080946
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        borderTop: "1px solid black",
                        width: "50px",
                      }}
                    ></div>
                    <div>SECRETARY</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => printIDCard(student)}
                style={btnStyle('#16a085', '0.5rem')}
              >
                Print ID
              </button>
            </div >
          ))}
        </div >
      </div >

      <style>
        {`
          .detail-item {
            margin-bottom: 6px;
          }
        `}
      </style>
    </>
  );
};

export default IDCardsStudent;
