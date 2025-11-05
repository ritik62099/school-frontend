// // src/pages/TeachersList.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { endpoints } from '../../config/api';
// import { useAuth } from '../../context/AuthContext';
// import BottomTabBar from '../../components/ui/BottomTabBar';

// const TeachersList = () => {
//   const [teachers, setTeachers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { currentUser } = useAuth();

//   const isMobile = useMemo(() => window.innerWidth <= 768, []);

//   useEffect(() => {
//     const fetchTeachers = async () => {
//       try {
//         const res = await fetch(endpoints.teachers.list, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//           },
//         });

//         if (!res.ok) throw new Error('Failed to load teachers');

//         const data = await res.json();
//         setTeachers(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTeachers();
//   }, []);

//   const handleApprove = async (id) => {
//     try {
//       const res = await fetch(endpoints.teachers.approve(id), {
//         method: 'PATCH',
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//       });

//       if (res.ok) {
//         setTeachers((prev) =>
//           prev.map((t) => (t._id === id ? { ...t, isApproved: true } : t))
//         );
//       } else {
//         const data = await res.json();
//         alert(data.message || 'Failed to approve teacher');
//       }
//     } catch {
//       alert('Server error');
//     }
//   };

//   const handleDelete = async (id, name) => {
//     if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

//     try {
//       const res = await fetch(endpoints.teachers.delete(id), {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//       });

//       if (res.ok) {
//         setTeachers((prev) => prev.filter((t) => t._id !== id));
//       } else {
//         const data = await res.json();
//         alert(data.message || 'Failed to delete teacher');
//       }
//     } catch {
//       alert('Server error');
//     }
//   };

//   const showBottomTab = isMobile && 
//     ['/dashboard', '/my-students', '/attendance', '/teachers', '/profile'].includes(location.pathname);

//   return (
//     <>
//       <style>{`
//         .teachers-container {
//           padding: 1.5rem;
//           font-family: Arial, sans-serif;
//           background-color: #f8f9fa;
//           min-height: 100vh;
//           box-sizing: border-box;
//           padding-bottom: ${showBottomTab ? '70px' : '0'};
//         }
//         .teachers-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 1.5rem;
//           flex-wrap: wrap;
//           gap: 0.8rem;
//         }
//         .teachers-title {
//           color: #2c3e50;
//           margin: 0;
//           font-size: 1.75rem;
//         }
//         .teachers-back-btn {
//           padding: 0.6rem 1.2rem;
//           background-color: #3498db;
//           color: white;
//           border: none;
//           border-radius: 6px;
//           cursor: pointer;
//           font-size: 1rem;
//           font-weight: 600;
//           transition: background-color 0.2s;
//         }
//         .teachers-back-btn:hover {
//           background-color: #2980b9;
//         }
//         .teachers-loading,
//         .teachers-error,
//         .teachers-empty {
//           text-align: center;
//           padding: 2rem;
//         }
//         .teachers-loading {
//           font-size: 1.2rem;
//           color: #7f8c8d;
//         }
//         .teachers-error {
//           color: #e74c3c;
//           font-size: 1.1rem;
//         }
//         .teachers-empty {
//           color: #7f8c8d;
//           font-style: italic;
//           font-size: 1.1rem;
//         }

//         .desktop-table-container {
//           display: block;
//         }
//         .teachers-table {
//           width: 100%;
//           border-collapse: collapse;
//           min-width: 500px;
//         }
//         .teachers-table-container {
//           overflow-x: auto;
//           background-color: white;
//           border-radius: 10px;
//           box-shadow: 0 4px 12px rgba(0,0,0,0.08);
//         }
//         .teachers-table th {
//           background-color: #3498db;
//           color: white;
//           padding: 1rem 0.8rem;
//           text-align: left;
//           font-weight: 600;
//           font-size: 0.95rem;
//         }
//         .teachers-table tr {
//           border-bottom: 1px solid #ecf0f1;
//         }
//         .teachers-table td {
//           padding: 1rem 0.8rem;
//           color: #2c3e50;
//           font-size: 0.95rem;
//         }

//         .teachers-approve-btn,
//         .teachers-delete-btn {
//           padding: 0.5rem 1rem;
//           border: none;
//           border-radius: 6px;
//           cursor: pointer;
//           font-weight: 600;
//           font-size: 0.9rem;
//           transition: background-color 0.2s;
//         }
//         .teachers-approve-btn {
//           background-color: #2ecc71;
//           color: white;
//         }
//         .teachers-approve-btn:hover {
//           background-color: #27ae60;
//         }
//         .teachers-delete-btn {
//           background-color: #e74c3c;
//           color: white;
//           margin-left: 0.6rem;
//         }
//         .teachers-delete-btn:hover {
//           background-color: #c0392b;
//         }

//         .mobile-cards-container {
//           display: none;
//           flex-direction: column;
//           gap: 1rem;
//         }
//         .teacher-card {
//           background-color: white;
//           padding: 1rem;
//           border-radius: 10px;
//           box-shadow: 0 4px 12px rgba(0,0,0,0.08);
//           display: flex;
//           flex-direction: column;
//           gap: 0.6rem;
//         }
//         .teacher-card-row {
//           display: flex;
//           justify-content: space-between;
//           font-size: 0.95rem;
//         }
//         .teacher-card-row span:first-child {
//           font-weight: 600;
//           color: #555;
//         }
//         .teacher-card-buttons {
//           display: flex;
//           gap: 0.5rem;
//           flex-wrap: wrap;
//           margin-top: 0.5rem;
//         }

//         @media (max-width: 768px) {
//           .desktop-table-container {
//             display: none;
//           }
//           .mobile-cards-container {
//             display: flex;
//           }
//           .teachers-approve-btn,
//           .teachers-delete-btn {
//             flex: 1;
//             text-align: center;
//             margin-left: 0;
//           }
//         }

//         @media (max-width: 480px) {
//           .teachers-title {
//             font-size: 1.35rem;
//           }
//         }
//       `}</style>

//       <div className="teachers-container">
//         <div className="teachers-header">
//           <h2 className="teachers-title">All Teachers</h2>
//           <button onClick={() => navigate('/dashboard')} className="teachers-back-btn">
//             ← Back to Dashboard
//           </button>
//         </div>

//         {error && <p className="teachers-error">{error}</p>}

//         {loading ? (
//           <p className="teachers-loading">Loading teachers...</p>
//         ) : teachers.length === 0 ? (
//           <p className="teachers-empty">No teachers found.</p>
//         ) : (
//           <>
//             {/* Desktop Table */}
//             <div className="teachers-table-container desktop-table-container">
//               <table className="teachers-table">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Email</th>
//                     {teachers.some(t => t.subject) && <th>Subject</th>}
//                     <th>Joining Date</th>
//                     <th>Status</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {teachers.map((teacher) => (
//                     <tr key={teacher._id}>
//                       <td>{teacher.name}</td>
//                       <td>{teacher.email}</td>
//                       {teacher.subject !== undefined && <td>{teacher.subject}</td>}
//                       <td>{new Date(teacher.createdAt).toLocaleDateString()}</td>
//                       <td>
//                         {teacher.isApproved ? (
//                           <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Approved</span>
//                         ) : (
//                           <button onClick={() => handleApprove(teacher._id)} className="teachers-approve-btn">
//                             Approve
//                           </button>
//                         )}
//                       </td>
//                       <td>
//                         <button onClick={() => handleDelete(teacher._id, teacher.name)} className="teachers-delete-btn">
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile Card Layout */}
//             <div className="mobile-cards-container">
//               {teachers.map((teacher) => (
//                 <div key={teacher._id} className="teacher-card">
//                   <div className="teacher-card-row"><span>Name:</span> {teacher.name}</div>
//                   <div className="teacher-card-row"><span>Email:</span> {teacher.email}</div>
//                   {teacher.subject && <div className="teacher-card-row"><span>Subject:</span> {teacher.subject}</div>}
//                   <div className="teacher-card-row"><span>Joining:</span> {new Date(teacher.createdAt).toLocaleDateString()}</div>
//                   <div className="teacher-card-row">
//                     <span>Status:</span> {teacher.isApproved ? '✅ Approved' : 'Pending'}
//                   </div>
//                   <div className="teacher-card-buttons">
//                     {!teacher.isApproved && (
//                       <button onClick={() => handleApprove(teacher._id)} className="teachers-approve-btn">
//                         Approve
//                       </button>
//                     )}
//                     <button onClick={() => handleDelete(teacher._id, teacher.name)} className="teachers-delete-btn">
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       {showBottomTab && <BottomTabBar userRole={currentUser?.role} />}
//     </>
//   );
// };

// export default TeachersList;
// src/pages/TeachersList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { endpoints } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import BottomTabBar from '../../components/ui/BottomTabBar';

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const isMobile = useMemo(() => window.innerWidth <= 768, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(endpoints.teachers.list, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to load teachers');
        const data = await res.json();
        setTeachers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(endpoints.teachers.approve(id), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        setTeachers((prev) =>
          prev.map((t) => (t._id === id ? { ...t, isApproved: true } : t))
        );
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to approve teacher');
      }
    } catch {
      alert('Server error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(endpoints.teachers.delete(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        setTeachers((prev) => prev.filter((t) => t._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete teacher');
      }
    } catch {
      alert('Server error');
    }
  };

  const showBottomTab =
    isMobile &&
    ['/dashboard', '/my-students', '/attendance', '/teachers', '/profile'].includes(location.pathname);

  return (
    <>
      <style>{`
        .teachers-page {
          background: linear-gradient(to bottom right, #e0f2fe, #ecfdf5);
          min-height: 100vh;
          padding: 2rem 1rem ${showBottomTab ? '80px' : '2rem'};
          font-family: 'Segoe UI', sans-serif;
          color: #1e293b;
        }

        .teachers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
          gap: 0.8rem;
        }

        .teachers-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1e3a8a;
        }

        .teachers-back-btn {
          background: #2563eb;
          color: white;
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .teachers-back-btn:hover {
          background: #1d4ed8;
        }

        .teachers-table-container {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
          overflow-x: auto;
        }

        table.teachers-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }

        table.teachers-table th {
          background-color: #2563eb;
          color: white;
          padding: 1rem;
          text-align: left;
          font-size: 0.95rem;
          font-weight: 600;
        }

        table.teachers-table td {
          padding: 0.9rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-size: 0.95rem;
        }

        table.teachers-table tr:hover {
          background-color: #f8fafc;
        }

        .teachers-approve-btn,
        .teachers-delete-btn {
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .teachers-approve-btn {
          background-color: #16a34a;
          color: white;
        }
        .teachers-approve-btn:hover {
          background-color: #15803d;
        }

        .teachers-delete-btn {
          background-color: #dc2626;
          color: white;
          margin-left: 0.5rem;
        }
        .teachers-delete-btn:hover {
          background-color: #b91c1c;
        }

        .teachers-status {
          font-weight: 700;
          color: #16a34a;
        }

        .teachers-error, .teachers-empty {
          text-align: center;
          padding: 1.5rem;
          border-radius: 10px;
          background: white;
          max-width: 500px;
          margin: 2rem auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          font-weight: 600;
        }
        .teachers-error { color: #b91c1c; }
        .teachers-empty { color: #64748b; }

        /* Mobile Cards */
        .mobile-cards {
          display: none;
          flex-direction: column;
          gap: 1rem;
        }

        .teacher-card {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.07);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .teacher-card h3 {
          font-size: 1.1rem;
          color: #1e3a8a;
          margin: 0;
        }

        .teacher-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: #475569;
        }

        .teacher-buttons {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .teachers-table-container { display: none; }
          .mobile-cards { display: flex; }
          .teachers-title { font-size: 1.5rem; }
        }
      `}</style>

      <div className="teachers-page">
        <div className="teachers-header">
          <h1 className="teachers-title">👩‍🏫 Teachers List</h1>
          <button onClick={() => navigate('/dashboard')} className="teachers-back-btn">
            ← Back
          </button>
        </div>

        {loading && <p className="teachers-empty">Loading teachers...</p>}
        {error && <p className="teachers-error">❌ {error}</p>}

        {!loading && !error && teachers.length === 0 && (
          <p className="teachers-empty">No teachers found yet.</p>
        )}

        {!loading && teachers.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="teachers-table-container">
              <table className="teachers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    {teachers.some(t => t.subject) && <th>Subject</th>}
                    <th>Joining Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t._id}>
                      <td>{t.name}</td>
                      <td>{t.email}</td>
                      {t.subject && <td>{t.subject}</td>}
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>
                        {t.isApproved ? (
                          <span className="teachers-status">✅ Approved</span>
                        ) : (
                          <button
                            onClick={() => handleApprove(t._id)}
                            className="teachers-approve-btn"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(t._id, t.name)}
                          className="teachers-delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-cards">
              {teachers.map((t) => (
                <div key={t._id} className="teacher-card">
                  <h3>{t.name}</h3>
                  <div className="teacher-info"><span>Email:</span> {t.email}</div>
                  {t.subject && <div className="teacher-info"><span>Subject:</span> {t.subject}</div>}
                  <div className="teacher-info"><span>Joined:</span> {new Date(t.createdAt).toLocaleDateString()}</div>
                  <div className="teacher-info">
                    <span>Status:</span> {t.isApproved ? '✅ Approved' : '⏳ Pending'}
                  </div>
                  <div className="teacher-buttons">
                    {!t.isApproved && (
                      <button onClick={() => handleApprove(t._id)} className="teachers-approve-btn">
                        Approve
                      </button>
                    )}
                    <button onClick={() => handleDelete(t._id, t.name)} className="teachers-delete-btn">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showBottomTab && <BottomTabBar userRole={currentUser?.role} />}
    </>
  );
};

export default TeachersList;
