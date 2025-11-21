
// src/pages/admin/IDCardsStudent.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';
import Logo from "../../assets/logo.png";
import BackgroundImage from "../../assets/back.png";
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


  // const generatePrint = (studentsList) => {
  //   if (!logoLoaded || !logoBase64 || !bgBase64) {
  //     alert("Images are still loading. Please wait...");
  //     return;
  //   }

  //   const printWindow = window.open('', '_blank');

  //   const cardsHtml = studentsList.map(student => `
  //   <div class="id-card">
  //     <div class="header">
  //       <img src="${logoBase64}" alt="School Logo" />
  //       <div class="school-name">AMBIKA <br> INTERNATIONAL SCHOOL</div>
  //       <div class="school-address">SAIDPUR, DIGHWARA (SARAN)</div>
  //     </div>
  //     <div class="photo">
  //       <img src="${student.photo || 'https://via.placeholder.com/100'}" alt="Student Photo" />
  //     </div>
  //     <div class="info">
  //       <div class="info-row"><span class="label">NAME</span> : ${student.name || 'N/A'}</div>
  //       <div class="info-row"><span class="label">FATHER</span> : ${student.fatherName || 'N/A'}</div>
  //       <div class="info-row-between">
  //       <div><b>CLASS</b> : ${student.class || 'N/A'}</div>
  //       <div><b>ROLL</b> : ${student.rollNo || 'N/A'}</div>
  //     </div>


  //       <div class="info-row"><span class="label">MOB</span> : ${student.mobile || 'N/A'}</div>
  //       <div class="info-row"><span class="label">DOB</span> : ${student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'
  //     }</div>
  //       <div class="info-row"><span class="label">ADD</span> : ${student.address?.substring(0, 18) || 'N/A'}</div>

  //     </div>
  //     <div class="footer">
  //       <div class="sign"></div>
  //       <div>PRINCIPAL</div>
  //     </div>
  //   </div>
  // `).join('');

  //   printWindow.document.write(`
  //   <html>
  //     <head>
  //       <title>Student ID Cards</title>
  //       <style>
  //         * {
  //           margin: 0;
  //           padding: 0;
  //           box-sizing: border-box;
  //         }

  //         @media print {
  //           @page {
  //             size: A4;
  //             margin: 5mm; /* Small margin for printer safety */
  //           }
  //           body {
  //             -webkit-print-color-adjust: exact !important;
  //             print-color-adjust: exact !important;
  //             break-before: auto;
  //           }
  //           .id-card {
  //             page-break-inside: avoid;
  //           }
  //           /* Force new page every 9 cards */
  //           .page-break {
  //             page-break-after: always;
  //           }
  //         }

  //         body {
  //           font-family: Arial, sans-serif;
  //           background: white;
  //           padding: 5mm;
  //           display: flex;
  //           flex-direction: column;
  //           gap: 2mm;
  //         }

  //         .card-page {
  //           display: grid;
  //           grid-template-columns: repeat(3, 62mm);
  //           grid-template-rows: repeat(3, 88mm);
  //           gap: 10mm;
  //           width: 210mm; /* A4 width minus margins */
  //           margin: 0 auto;
  //         }

  //         .id-card {
  //           width: 64mm;
  //           height: 98mm;
  //           background: url('${bgBase64}') no-repeat center center;
  //           background-size: cover;
  //           border: 0.3mm solid #003399;
  //           border-radius: 2mm;
  //           padding: 2.5mm;
  //           position: relative;
  //           font-size: 3.8mm;
  //           display: flex;
  //           flex-direction: column;
            
  //         }

  //         .header {
  //           text-align: center;
  //           color: #003399;
  //           font-weight: bold;
  //           line-height: 1.1;
  //           margin-bottom: 2mm;
  //         }
  //         .header img {
  //           width: 12mm;
  //           height: auto;
  //           margin-bottom: 1mm;
  //         }
  //         .school-name { font-size: 4.2mm; }
  //         .school-address { font-size: 2.5mm; }

  //         .photo {
  //           display: flex;
  //           justify-content: center;
  //           margin: 1mm 0;
  //         }
  //         .photo img {
  //           width: 20mm;
  //           height: 20mm;
  //           // border-radius: 50%;
  //           border: 0.3mm solid #003399;
  //           object-fit: cover;
  //         }

  //         .info {
  //           flex: 1;
  //           display: flex;
  //           flex-direction: column;
  //           justify-content: center;
  //           gap: 0.8mm;
  //         }

  //         .info-row {
  //           display: flex;
  //           align-items: baseline;
  //         }

  //         .info-row-between {
  //           display: flex;
  //           justify-content: space-between;
  //           width: 100%;
  //           marginRight: '15px'
  //         }

  //         .label {
  //           display: inline-block;
  //           width: 12mm;
  //           font-weight: bold;
  //           flex-shrink: 0;
  //         }

  //         .footer {
  //           position: absolute;
  //           bottom: 2.5mm;
  //           left: 0;
  //           right: 0;
  //           text-align: center;
  //           font-size: 2.4mm;
  //         }
  //         .sign {
  //           width: 20mm;
  //           margin: 0 auto 0.5mm;
  //           border-top: 0.2mm solid #000;
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       ${chunkArray(studentsList, 9).map(chunk => `
  //         <div class="card-page">
  //           ${chunk.map(student => `
  //             <div class="id-card">
  //               <div class="header">
  //                 <img src="${logoBase64}" alt="School Logo" />
  //                 <div class="school-name">AMBIKA <br> INTERNATIONAL SCHOOL</div>
  //                 <div class="school-address">SAIDPUR, DIGHWARA (SARAN)</div>
  //               </div>
  //               <div class="photo">
  //                 <img src="${student.photo || 'https://via.placeholder.com/100'}" alt="Student Photo" />
  //               </div>
  //               <div class="info">
  //                 <div class="info-row"><span class="label">NAME</span> : ${student.name || 'N/A'}</div>
  //                 <div class="info-row"><span class="label">FATHER</span> : ${student.fatherName || 'N/A'}</div>
  //                 <div class="info-row"><span class="label">CLASS</span> : ${student.class || 'N/A'}</div>
  //                 <div class="info-row"><span class="label">ROLL</span> : ${student.rollNo || 'N/A'}</div>
  //                 <div class="info-row"><span class="label">MOB</span> : ${student.mobile || 'N/A'}</div>
  //                 <div class="info-row"><span class="label">ADD</span> : ${student.address?.substring(0, 18) || 'N/A'}</div>
  //                 <div class="info-row"><span class="label">DOB</span> : ${student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'
  //                 }</div>

  //               </div>
  //               <div class="footer">
  //                 <div class="sign"></div>
  //                 <div>PRINCIPAL</div>
  //               </div>
  //             </div>
  //           `).join('')}
  //         </div>
  //       `).join('')}
  //     </body>
  //   </html>
  // `);

  //   printWindow.document.close();
  //   printWindow.focus();
  //   printWindow.print();
  //   printWindow.close();
  // };

  const generatePrint = (studentsList) => {
  if (!logoLoaded || !logoBase64 || !bgBase64) {
    alert("Images are still loading. Please wait...");
    return;
  }

  const printWindow = window.open("", "_blank");

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
  row-gap: 4px;   /* TOP-BOTTOM gap reduce */
  column-gap: 10px;
}


          .id-card {
            background-image: url('${bgBase64}');
            background-size: cover;
            background-position: center;
            width: 241px;
            height: 360px;
            border: 1px solid #003399;
            border-radius: 6px;
            padding: 6px;
            position: relative;
          }

          .header {
            text-align: center;
            color: #003399;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .header img {
            width: 40px;
            margin-right: 6px;
          }

          .school-title {
            font-size: 11px;
            line-height: 1.1;
          }

          .photo {
            display: flex;
            justify-content: center;
            margin-top: 8px;
          }

          .photo img {
            width: 120px;
            height: 130px;
            border: 1px solid #003399;
            object-fit: cover;
          }

          .student-name {
            text-align: center;
            background: #fad904ff;
            margin-top: 8px;
            padding: 2px;
            font-weight: bold;
            font-size: 13px;
            border-radius: 4px;
          }

          .info {
            font-size: 12px;
            margin-top: 10px;
            padding: 0 10px;
            color: white;
          }

          .detail-item {
            margin-bottom: 8px;
          }

          .flex-between {
            display: flex;
            justify-content: space-between;
            margin-right: 15px;
            margin-bottom: 8px;
          }

          .footer {
            position: absolute;
            bottom: 10px;
            left: 0;
            width: 93%;
            padding: 0 8px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            font-weight: bold;
          }

          .sign-line {
            border-top: 1px solid black;
            width: 50px;
            margin: auto;
          }
        </style>
      </head>

      <body>
        ${chunkForNine(studentsList).map(page =>
          `
          <div class="page">
            ${page.map(student => `
              <div class="id-card">
                
                <div class="header">
                  <img src="${logoBase64}" />
                  <div class="school-title">
                    <div style="font-size: 10px;">AMBIKA INTERNATIONAL SCHOOL</div>
                    <span style="font-size:9px; color:#555">SAIDPUR, DIGHWARA</span><br>
                    <span style="font-size:9px; color:#555">SARAN, BIHAR - 841207</span>
                  </div>
                </div>

                <div class="photo">
                  <img src="${student.photo || 'https://via.placeholder.com/100'}" />
                </div>

                <div class="student-name">${student.name}</div>

                <div class="info">
                  <div class="detail-item"><b>FATHER</b> : ${student.fatherName || "N/A"}</div>

                  <div class="flex-between">
                    <div><b>CLASS</b> : ${student.class || "N/A"}</div>
                    <div><b>ROLL</b> : ${student.rollNo || "N/A"}</div>
                  </div>

                  <div class="detail-item"><b>MOB</b> : ${student.mobile || "N/A"}</div>

                  <div class="detail-item">
                    <b>DOB</b> : ${student.dob ? new Date(student.dob).toLocaleDateString() : "N/A"}
                  </div>

                  <div class="detail-item"><b>ADD</b> : ${student.address?.substring(0, 15) || "N/A"}</div>
                </div>

                <div class="footer">
                  <div>Mob: 6203080946</div>
                  <div style="text-align:center;">
                    <div class="sign-line"></div>
                    PRINCIPAL
                  </div>
                </div>

              </div>
            `).join('')}
          </div>
          `
        ).join('')}
      </body>
    </html>
  `);

   printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
};


// Helper → Split students into groups of 9
const chunkForNine = (arr) => {
  const pages = [];
  for (let i = 0; i < arr.length; i += 9) {
    pages.push(arr.slice(i, i + 9));
  }
  return pages;
};


  // Helper to split array into chunks of max 9
  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
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
    <>
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
                width: '241px',
                height: '370px',
                padding: '4px',
                position: 'relative'
              }}>
                <div style={{ textAlign: 'center', color: '#003399', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <img src={logoBase64} alt="logo" style={{ width: '40px', marginBottom: '8px', marginTop: '6px' }} />
                  <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
                    <div style={{ fontSize: '11px', marginLeft: '4px' }}>AMBIKA INTERNATIONAL SCHOOL</div>
                    <div style={{ fontSize: '9px', color: '#555' }}>SAIDPUR, DIGHWARA</div>
                    <div style={{ fontSize: '9px', color: '#555' }}>SARAN, BIHAR - 841207</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                  <img
                    src={student.photo || 'https://via.placeholder.com/100'}
                    alt="Student"
                    style={{
                      width: '120px',
                      height: '130px',
                      border: '1px solid #003399',
                      objectFit: 'cover'
                    }}
                  />
                </div>

                {/* Student Name Under Photo */}
                <div
                  style={{
                    textAlign: 'center',
                    backgroundColor: '#fad904ff',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    marginTop: '8px',
                    padding: '2px 0',
                    borderRadius: '4px'
                  }}
                >
                  {student.name || 'N/A'}
                </div>


                <div style={{ fontSize: '12px', marginTop: '10px', textAlign: 'left', padding: '0 10px', color: '#ffffffff' }}>
                  <div className="detail-item"><b>FATHER</b> : {student.fatherName || 'N/A'}</div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    marginRight: '15px'
                  }}>
                    <div><b>CLASS</b> : {student.class || 'N/A'}</div>
                    <div><b>ROLL</b> : {student.rollNo || 'N/A'}</div>
                  </div>

                  <div className="detail-item"><b>MOB</b> : {student.mobile || 'N/A'}</div>
                  <div className="detail-item"><b>DOB</b> : {
                    student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'
                  }</div>
                  <div className="detail-item"><b>ADD</b> : {student.address?.substring(0, 15) || 'N/A'}</div>


                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "0",
                    width: "93%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 8px",
                    fontSize: "10px",
                  }}
                >
                  {/* LEFT SIDE — SCHOOL MOBILE */}
                  <div style={{ fontWeight: "bold" }}>
                    Mob: 6203080946
                  </div>

                  {/* RIGHT SIDE — PRINCIPAL SIGNATURE */}
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
                        // marginBottom: "2px",
                      }}
                    ></div>
                    <div>PRINCIPAL</div>
                  </div>
                </div>


              </div>
              <button onClick={() => printIDCard(student)} style={btnStyle('#16a085', '0.5rem')}>Print ID</button>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
        .detail-item {
          margin-bottom: 8px;
        }
      `}
      </style>

    </>
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
