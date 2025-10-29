

// // src/pages/admin/StudentsList.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { endpoints } from '../../config/api';

// const StudentsList = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchAllStudents = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           throw new Error('No authentication token');
//         }

//         const res = await fetch(endpoints.students.list, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (!res.ok) {
//           const errData = await res.json().catch(() => ({}));
//           throw new Error(errData.message || 'Failed to fetch students');
//         }

//         const data = await res.json();
//         setStudents(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error('Fetch students error:', err);
//         setError('Unable to load students. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllStudents();
//   }, []);

//   if (loading) return <div style={styles.center}>Loading students...</div>;
//   if (error) return <div style={{ ...styles.center, color: 'red' }}>{error}</div>;

//   return (
//     <div style={styles.container}>
//       <h2>All Students</h2>
//       <button onClick={() => navigate(-1)} style={styles.backBtn}>
//         ← Back to Dashboard
//       </button>

//       {students.length === 0 ? (
//         <p style={styles.center}>No students found.</p>
//       ) : (
//         <div style={styles.tableContainer}>
//           <table style={styles.table}>
//             <thead>
//               <tr>
//                 <th>Photo</th>
//                 <th>Name</th>
//                 <th>Class</th>
//                 <th>Section</th>
//                 <th>Roll No</th>
//                 <th>Admission Date</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {students.map((student) => (
//                 <tr key={student._id}>
//                   <td>
//                     {student.photo ? (
//                       <img
//                         src={student.photo}
//                         alt={student.name || 'Student'}
//                         style={styles.photo}
//                         loading="lazy"
//                         onError={(e) => {
//                           e.target.style.display = 'none';
//                           const fallback = document.createElement('div');
//                           fallback.textContent = '—';
//                           fallback.style.cssText = styles.noPhotoFallback;
//                           e.target.parentNode.appendChild(fallback);
//                         }}
//                       />
//                     ) : (
//                       <div style={styles.noPhoto}>—</div>
//                     )}
//                   </td>
//                   <td>{student.name || '—'}</td>
//                   <td><strong>{student.class || '—'}</strong></td>
//                   <td>{student.section || '—'}</td>
//                   <td>{student.rollNo || '—'}</td>
//                   <td>
//                     {student.admissionDate
//                       ? new Date(student.admissionDate).toLocaleDateString()
//                       : '—'}
//                   </td>
//                   <td>
//                     <button
//                       onClick={() => navigate(`/admin/students/edit/${student._id}`)}
//                       style={styles.editBtn}
//                     >
//                       Edit
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// // ✅ Internal CSS (professional, clean)
// const styles = {
//   container: {
//     padding: '2rem',
//     fontFamily: 'Arial, sans-serif',
//     maxWidth: '1200px',
//     margin: '0 auto'
//   },
//   center: {
//     textAlign: 'center',
//     marginTop: '2rem',
//     fontSize: '1.1rem'
//   },
//   backBtn: {
//     marginBottom: '1.5rem',
//     padding: '0.6rem 1.2rem',
//     backgroundColor: '#3498db',
//     color: 'white',
//     border: 'none',
//     borderRadius: '6px',
//     cursor: 'pointer',
//     fontSize: '1rem',
//     fontWeight: '600'
//   },
//   tableContainer: {
//     overflowX: 'auto',
//     borderRadius: '8px',
//     border: '1px solid #e2e8f0',
//     boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
//   },
//   table: {
//     width: '100%',
//     borderCollapse: 'collapse',
//     minWidth: '700px'
//   },
//   photo: {
//     width: '48px',
//     height: '48px',
//     objectFit: 'cover',
//     borderRadius: '6px',
//     border: '1px solid #e2e8f0',
//     backgroundColor: '#f8fafc'
//   },
//   noPhoto: {
//     width: '48px',
//     height: '48px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#f1f1f1',
//     borderRadius: '6px',
//     color: '#94a3b8',
//     fontSize: '18px',
//     border: '1px solid #e2e8f0'
//   },
//   // Inline CSS string for dynamic fallback
//   noPhotoFallback: `
//     width: 48px;
//     height: 48px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     background-color: #f1f1f1;
//     border-radius: 6px;
//     color: #94a3b8;
//     font-size: 18px;
//     border: 1px solid #e2e8f0;
//   `,
//   editBtn: {
//     padding: '0.4rem 0.8rem',
//     backgroundColor: '#2980b9',
//     color: 'white',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     fontSize: '0.9rem',
//     fontWeight: '500',
//     transition: 'background-color 0.2s'
//   }
// };

// export default StudentsList;

// src/pages/admin/StudentsList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../config/api";

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  // ✅ Handle responsive screen width
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fetch students
  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const res = await fetch(endpoints.students.list, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to fetch students");
        }

        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch students error:", err);
        setError("Unable to load students. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudents();
  }, []);

  const classes = useMemo(() => {
    const unique = [...new Set(students.map((s) => s.class).filter(Boolean))];
    return unique.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (selectedClass === "all") return students;
    return students.filter((student) => student.class === selectedClass);
  }, [students, selectedClass]);

  if (loading) return <div style={styles.center}>Loading students...</div>;
  if (error)
    return <div style={{ ...styles.center, color: "red" }}>{error}</div>;

  return (
    <div style={styles.container}>
      {/* 🔹 Header */}
      <div
        style={{
          ...styles.headerRow,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
        }}
      >
        <h2
          style={{
            ...styles.heading,
            fontSize: isMobile ? "1.4rem" : "1.8rem",
          }}
        >
          All Students
        </h2>
        <button
          onClick={() => navigate(-1)}
          style={{
            ...styles.backBtn,
            width: isMobile ? "100%" : "auto",
            marginTop: isMobile ? "0.5rem" : 0,
          }}
        >
          ← Back
        </button>
      </div>

      {/* 🔹 Filter Dropdown */}
      <div style={styles.filterContainer}>
        <label htmlFor="class-filter" style={styles.label}>
          Filter by Class:
        </label>
        <select
          id="class-filter"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Classes</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              Class {cls}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Desktop Table */}
      {!isMobile && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Roll No</th>
                <th>Admission</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id} style={styles.row}>
                  <td>
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                        style={styles.photo}
                      />
                    ) : (
                      <div style={styles.noPhoto}>—</div>
                    )}
                  </td>
                  <td>{student.name || "—"}</td>
                  <td>{student.class || "—"}</td>
                  <td>{student.section || "—"}</td>
                  <td>{student.rollNo || "—"}</td>
                  <td>
                    {student.admissionDate
                      ? new Date(student.admissionDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <button
                      style={styles.editBtn}
                      onClick={() =>
                        navigate(`/admin/students/edit/${student._id}`)
                      }
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔹 Mobile Cards */}
      {isMobile && (
        <div style={styles.cardGrid}>
          {filteredStudents.map((student) => (
            <div key={student._id} style={styles.card}>
              <div style={styles.cardHeader}>
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt={student.name}
                    style={styles.cardPhoto}
                  />
                ) : (
                  <div style={styles.noPhoto}>—</div>
                )}
                <div>
                  <h3 style={styles.cardName}>{student.name || "—"}</h3>
                  <p style={styles.cardSub}>
                    Class {student.class || "—"} • {student.section || "—"}
                  </p>
                </div>
              </div>
              <div style={styles.cardBody}>
                <p>
                  <strong>Roll No:</strong> {student.rollNo || "—"}
                </p>
                <p>
                  <strong>Admission:</strong>{" "}
                  {student.admissionDate
                    ? new Date(student.admissionDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <button
                onClick={() =>
                  navigate(`/admin/students/edit/${student._id}`)
                }
                style={styles.cardBtn}
              >
                ✏️ Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* 🔹 Refined modern mobile-webapp styles */
const styles = {
  container: {
    padding: "1.2rem",
    fontFamily: "Inter, system-ui, sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem",
  },
  heading: {
    color: "#1e293b",
    fontWeight: "700",
  },
  backBtn: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0.6rem 1.2rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s",
  },
  filterContainer: {
    marginBottom: "1.2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: { fontWeight: "600", color: "#475569" },
  select: {
    padding: "0.7rem",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    backgroundColor: "#fff",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    backgroundColor: "#f8fafc",
    textAlign: "left",
  },
  row: {
    borderBottom: "1px solid #e2e8f0",
  },
  photo: {
    width: "45px",
    height: "45px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  noPhoto: {
    width: "45px",
    height: "45px",
    borderRadius: "8px",
    backgroundColor: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
  },
  editBtn: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.4rem 0.8rem",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  center: {
    textAlign: "center",
    marginTop: "2rem",
    color: "#64748b",
  },
  // 🔹 Mobile cards
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "1rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "1rem",
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
    transition: "0.2s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  cardPhoto: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #e2e8f0",
  },
  cardName: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1e293b",
  },
  cardSub: { margin: 0, fontSize: "0.9rem", color: "#64748b" },
  cardBody: {
    marginTop: "0.7rem",
    fontSize: "0.9rem",
    color: "#475569",
  },
  cardBtn: {
    marginTop: "0.9rem",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "0.7rem",
    fontSize: "0.95rem",
    cursor: "pointer",
    width: "100%",
    fontWeight: "600",
  },
};

export default StudentsList;
