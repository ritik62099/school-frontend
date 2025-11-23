
// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { endpoints } from '../../config/api';
import Logo from '../../assets/logo.png';
import BottomTabBar from '../../components/ui/BottomTabBar';

const AdminDashboard = () => {
  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [studentsByClass, setStudentsByClass] = useState({});
  const [loading, setLoading] = useState(true);
  const { currentUser, logout, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = useMemo(() => window.innerWidth <= 768, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Refresh current user (for teachers)
        if (currentUser?.role === 'teacher') {
          const userRes = await fetch(endpoints.auth.me, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            localStorage.setItem('user', JSON.stringify(userData));
            setCurrentUser(userData);
          }
        }

        // Admin stats
        if (currentUser?.role === 'admin') {
          const [teacherRes, studentRes, classRes] = await Promise.all([
            fetch(endpoints.teachers.count, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(endpoints.students.count, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(endpoints.students.byClass, { headers: { Authorization: `Bearer ${token}` } })
          ]);

          const teacherData = await teacherRes.json();
          const studentData = await studentRes.json();
          setTeacherCount(teacherData.count || 0);
          setStudentCount(studentData.count || 0);

          if (classRes.ok) {
            const classData = await classRes.json();
            setStudentsByClass(classData);
          }
        }
      } catch (err) {
        console.error('Dashboard data fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.role, setCurrentUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ✅ Extract classes, subjects, and attendance access from teachingAssignments
  const getTeacherSummary = () => {
    if (!currentUser?.teachingAssignments) return { classes: [], subjects: [], canMarkAnyAttendance: false };

    const classes = [];
    const subjects = new Set();
    let canMarkAnyAttendance = false;

    currentUser.teachingAssignments.forEach(assignment => {
      classes.push(assignment.class);
      (assignment.subjects || []).forEach(sub => subjects.add(sub));
      if (assignment.canMarkAttendance) canMarkAnyAttendance = true;
    });

    return {
      classes: [...new Set(classes)], // unique classes
      subjects: Array.from(subjects),
      canMarkAnyAttendance
    };
  };

  const teacherSummary = currentUser?.role === 'teacher' ? getTeacherSummary() : null;

  // ✅ Updated teacher buttons — now based on teachingAssignments
  const adminButtons = [
    { label: 'Add Student', path: '/add-student', color: '#3498db' },
    { label: 'Manage Teachers', path: '/teachers', color: '#2ecc71' },
    { label: 'Assign Teachers', path: '/assign-teacher', color: '#e67e22' },
    { label: 'View All Students', path: '/students', color: '#1abc9c' },
    { label: 'Admit Cards', path: '/admit-cards', color: '#9b59b6' },
    { label: 'ID Cards', path: '/id-cards', color: '#16a085' },
    { label: 'View Result', path: '/view-result', color: '#f39c12' },
    { label: 'Manage Class Subjects', path: '/class-subjects', color: '#8e44ad' },
    { label: 'Class-wise Fees', path: '/class-fees', color: '#0d9488' },
    { label: 'Student Payments', path: '/student-payments', color: '#7e22ce' },
    { label: 'Periodic Result', path: '/periodic-result', color: '#2563eb' },
    { label: 'Exam Controls', path: '/exam-controls', color: '#b91c1c' },
    { label: 'Attendance Overview', path: '/admin/attendance-overview', color: '#3b82f6' },
  ];

  const teacherButtons = [
    { label: 'View My Students', path: '/my-students', color: '#3498db' },
    { label: 'Add Marks', path: '/add-marks', color: '#e74c3c' },
    ...(teacherSummary?.canMarkAnyAttendance
      ? [
          { label: 'Mark Attendance', path: '/attendance', color: '#9b59b6' },
          // { label: 'Add Student', path: '/add-student', color: '#3498db' },
          // { label: 'View Result', path: '/view-result', color: '#f39c12' },
          { label: 'Attendance Download', path: '/attendance/monthly-report', color: '#f39c12' }
        ]
      : [])
  ];

  const buttons = currentUser?.role === 'admin' ? adminButtons : teacherButtons;

  const showBottomTab = isMobile &&
    ['/dashboard', '/my-students', '/attendance', '/teachers', '/profile'].some(path =>
      location.pathname === path
    );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <img src={Logo} alt="School Logo" style={styles.logo} />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, paddingBottom: showBottomTab ? '70px' : '0' }}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            {currentUser?.role === 'admin' ? 'Admin' : 'Teacher'} Dashboard
          </h1>
          <p style={styles.subtitle}>Welcome back, <strong>{currentUser?.name || 'User'}</strong></p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      {currentUser?.role === 'teacher' && (
        <section style={styles.assignmentCard}>
          <h2 style={styles.sectionTitle}>Your Assignment</h2>
          <p>
            <strong>Classes:</strong>{" "}
            {teacherSummary?.classes.length ? teacherSummary.classes.join(', ') : 'Not assigned'}
          </p>
          <p>
            <strong>Subjects:</strong>{" "}
            {teacherSummary?.subjects.length ? teacherSummary.subjects.join(', ') : 'Not assigned'}
          </p>
          <p>
            <strong>Attendance Access:</strong>{" "}
            {teacherSummary?.canMarkAnyAttendance ? '✅ Enabled for some classes' : '❌ Disabled'}
          </p>
          {!teacherSummary?.classes.length && (
            <p style={styles.warning}>
              ⚠️ Contact admin to get assigned to a class.
            </p>
          )}
        </section>
      )}

      {currentUser?.role === 'admin' && (
        <section style={styles.statsSection}>
          <h2 style={styles.sectionTitle}>Overview</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3>Teachers</h3>
              <p style={styles.statNumber}>{teacherCount}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Students</h3>
              <p style={styles.statNumber}>{studentCount}</p>
            </div>
          </div>
        </section>
      )}

      <section style={styles.actionsSection}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={() => navigate(btn.path)}
              style={{ ...styles.actionButton, backgroundColor: btn.color }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </section>

      {showBottomTab && <BottomTabBar userRole={currentUser?.role} />}
    </div>
  );
};

// ... (styles object remains exactly the same — no change needed below)
const styles = {
  container: {
    padding: '1.5rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    color: '#1e293b',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  logoutBtn: {
    padding: '0.5rem 1.25rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
  assignmentCard: {
    backgroundColor: '#dbeafe',
    padding: '1.25rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    borderLeft: '4px solid #3b82f6',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    color: '#0f172a',
  },
  statsSection: {
    marginBottom: '2.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.25rem',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  statNumber: {
    fontSize: '2.25rem',
    fontWeight: '700',
    color: '#0ea5e9',
    margin: '0.5rem 0 0',
  },
  actionsSection: {
    marginBottom: '2rem',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1.1rem',
  },
  actionButton: {
    padding: '0.9rem 1rem',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
  },
  warning: {
    color: '#dc2626',
    marginTop: '0.75rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f8fafc',
  },
  logo: {
    width: '120px',
    height: 'auto',
    marginBottom: '1rem',
  },
};

export default AdminDashboard;