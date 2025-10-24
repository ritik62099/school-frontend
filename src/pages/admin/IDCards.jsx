
// src/pages/admin/IDCards.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from "../../assets/logo.png";
import { endpoints } from '../../config/api'; // ✅ Import centralized API config

// ✅ Logo path remains same (local asset)
const SCHOOL_LOGO_URL = Logo;

const IDCards = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // ✅ Use centralized endpoint
        const res = await fetch(endpoints.students.list, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

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
                src="${SCHOOL_LOGO_URL}" 
                alt="School Logo" 
                class="school-logo"
                onerror="this.style.display='none';"
              />
              <div>
                <p class="school-name">AMBICA INTERNATIONAL SCHOOL</p>
                <p class="school-address">SAIDPUR, DIGHWARA SARAN</p>
              </div>
            </div>

            <div class="photo-placeholder">
              ${student.photo ? `<img src="${student.photo}" alt="Student Photo" onerror="this.parentElement.innerHTML='<div style=&quot;font-size:10px;color:#999;text-align:center;height:100%;display:flex;align-items:center;justify-content:center;&quot;>PHOTO</div>';" />` : '<div style="font-size:10px;color:#999;text-align:center;height:100%;display:flex;align-items:center;justify-content:center;">PHOTO</div>'}
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

  if (loading) return <div style={pageStyles.center}>Loading students...</div>;

  return (
    <div style={pageStyles.container}>
      <h2>ID Cards</h2>
      <button onClick={() => navigate(-1)} style={pageStyles.backBtn}>
        ← Back to Dashboard
      </button>

      <div style={pageStyles.cardGrid}>
        {students.map((student) => (
          <div key={student._id} style={pageStyles.cardWrapper}>
            {/* ID Card Preview */}
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
              style={{ ...pageStyles.printBtn, backgroundColor: '#16a085', marginTop: '1rem' }}
            >
              Print ID Card
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ✅ Styles unchanged (as per your preference for internal CSS)
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
    marginBottom: '1.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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