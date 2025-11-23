


// src/pages/teacher/MyStudents.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { endpoints } from '../../config/api';
import BottomTabBar from '../../components/ui/BottomTabBar';

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const isMobile = useMemo(() => window.innerWidth <= 768, []);

  // Fetch students
  useEffect(() => {
    const fetchMyStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(endpoints.students.myStudents, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to fetch students');
        }

        const data = await res.json();

        const validData = Array.isArray(data) ? data : [];
        setStudents(validData);

        // Extract unique classes
        const classList = [...new Set(validData.map(s => s.class))];
        setClasses(classList);

      } catch (err) {
        console.error("MyStudents fetch error:", err);
        setError(err.message || "Unable to load your students");
      } finally {
        setLoading(false);
      }
    };

    fetchMyStudents();
  }, []);

  // Filter students by selected class
  const filteredStudents = selectedClass
    ? students.filter(s => s.class === selectedClass)
    : students;

  const showBottomTab = isMobile &&
    ['/dashboard', '/my-students', '/attendance', '/teachers', '/profile'].includes(location.pathname);

  const getScrollContainerHeight = () => {
    if (!isMobile) return 'auto';
    const headerHeight = 70;
    const tabBarHeight = showBottomTab ? 70 : 0;
    return `calc(100vh - ${headerHeight + tabBarHeight}px)`;
  };

  if (loading) return <div style={styles.center}>Loading your students...</div>;
  if (error) return <div style={{ ...styles.center, color: 'red' }}>{error}</div>;

  return (
    <>
      <style>{`
        .my-students-table th,
        .my-students-table td {
          padding: 0.8rem 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        .my-students-table thead {
          background-color: #eff6ff;
          color: #1e40af;
        }
        .my-students-table tr:hover {
          background-color: #f1f5f9;
          transition: 0.2s;
        }
        @media (max-width: 768px) {
          .my-students-table thead { display: none; }
          .my-students-table, .my-students-table tbody,
          .my-students-table tr, .my-students-table td {
            display: block; width: 100%;
          }
          .my-students-table tr {
            margin-bottom: 1rem; border-radius: 10px;
            background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            padding: 0.6rem 0.8rem;
          }
          .my-students-table td {
            padding: 0.5rem 1rem !important;
            text-align: right;
            position: relative;
            border: none;
          }
          .my-students-table td::before {
            content: attr(data-label);
            position: absolute;
            left: 1rem;
            top: 0.5rem;
            font-weight: 600;
            color: #334155;
          }
        }
      `}</style>

      <div style={{
        padding: isMobile ? '1rem' : '2rem',
        fontFamily: 'Inter, Arial, sans-serif',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        paddingBottom: showBottomTab ? '70px' : '2rem'
      }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.8rem',
          marginBottom: '1rem'
        }}>
          <h2 style={{ color: '#1e293b', fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: '600' }}>
            🎓 My Students
          </h2>
          <button 
            onClick={() => navigate(-1)} 
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              padding: isMobile ? '0.5rem 1rem' : '0.6rem 1.2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ← Back
          </button>
        </div>

        {/* Class Filter Dropdown */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontWeight: "600", marginBottom: "6px", display: "block" }}>
            Filter by Class
          </label>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{
              padding: "0.6rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              width: "200px",
            }}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Students Table */}
        {filteredStudents.length === 0 ? (
          <p style={{
            textAlign: 'center',
            marginTop: '2rem',
            fontSize: '1.1rem',
            color: '#64748b',
            padding: '1rem'
          }}>
            No students found for this class.
          </p>
        ) : (
          <div style={{
            maxHeight: getScrollContainerHeight(),
            overflowY: 'auto',
            borderRadius: '10px',
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            padding: isMobile ? '0.5rem' : '0',
            marginBottom: showBottomTab ? '1rem' : '0'
          }}>
            <table className="my-students-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Roll No</th>
                  <th>Admission Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td data-label="Name">{student.name}</td>
                    <td data-label="Class">{student.class} {student.section && `- ${student.section}`}</td>
                    <td data-label="Roll No">{student.rollNo}</td>
                    <td data-label="Admission Date">
                      {new Date(student.admissionDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showBottomTab && <BottomTabBar userRole={currentUser?.role} />}
      </div>
    </>
  );
};

const styles = {
  center: {
    textAlign: 'center',
    marginTop: '2rem',
    fontSize: '1.1rem',
    color: '#64748b',
    padding: '0 1.2rem'
  }
};

export default MyStudents;
