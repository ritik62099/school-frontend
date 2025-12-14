
// // src/pages/admin/AdminDashboard.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const { currentUser } = useAuth();

//   const [teacherCount] = useState(6);
//   const [studentCount] = useState(286);

//   const isAdmin = currentUser?.role === 'admin';
//   const isTeacher = currentUser?.role === 'teacher';

//   return (
//     <>
//       {/* 🔹 STATS (ADMIN ONLY) */}
//       {isAdmin && (
//         <section style={styles.statsGrid}>
//           <StatCard label="Teachers" value={teacherCount} icon="👨‍🏫" />
//           <StatCard label="Students" value={studentCount} icon="🧑‍🎓" />
//         </section>
//       )}

//       {/* 🔹 ACTIONS */}
//       <h2 style={styles.sectionTitle}>Quick Actions</h2>

//       <section style={styles.actionsGrid}>
//         {/* ✅ ADMIN ACTIONS */}
//         {isAdmin && (
//           <>
//             <Action label="Add Student" color="#3b82f6" onClick={() => navigate('/add-student')} />
//             <Action label="Teachers" color="#22c55e" onClick={() => navigate('/teachers')} />
//             <Action label="Students" color="#38bdf8" onClick={() => navigate('/students')} />
//             <Action label="Assign Teachers" color="#f97316" onClick={() => navigate('/assign-teacher')} />
//             <Action label="Attendance" color="#0ea5e9" onClick={() => navigate('/admin/attendance-overview')} />
//             <Action label="Results" color="#f59e0b" onClick={() => navigate('/view-result')} />
//             <Action label="Exam Controls" color="#ef4444" onClick={() => navigate('/exam-controls')} />
//           </>
//         )}

//         {/* ✅ TEACHER ACTIONS */}
//         {isTeacher && (
//           <>
//             <Action label="My Students" color="#38bdf8" onClick={() => navigate('/my-students')} />
//             <Action label="Add Marks" color="#f97316" onClick={() => navigate('/add-marks')} />
//             <Action label="Attendance" color="#0ea5e9" onClick={() => navigate('/attendance')} />
//             <Action label="Results" color="#22c55e" onClick={() => navigate('/view-result')} />
//           </>
//         )}
//       </section>
//     </>
//   );
// };

// const StatCard = ({ icon, label, value }) => (
//   <div style={styles.statCard}>
//     <span style={styles.statIcon}>{icon}</span>
//     <div>
//       <p>{label}</p>
//       <h2>{value}</h2>
//     </div>
//   </div>
// );

// const Action = ({ label, color, onClick }) => (
//   <button
//     onClick={onClick}
//     style={{
//       ...styles.action,
//       background: `linear-gradient(135deg, ${color}, #00000030)`,
//     }}
//   >
//     {label}
//   </button>
// );

// const styles = {
//   statsGrid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
//     gap: '2rem',
//     marginBottom: '2.5rem',
//   },
//   statCard: {
//     background: '#fff',
//     padding: '1.5rem',
//     borderRadius: 16,
//     display: 'flex',
//     gap: '1rem',
//     alignItems: 'center',
//     boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
//   },
//   statIcon: {
//     fontSize: '2.4rem',
//     background: '#eff6ff',
//     padding: '0.8rem',
//     borderRadius: 14,
//   },
//   sectionTitle: {
//     fontSize: '1.4rem',
//     fontWeight: 700,
//     marginBottom: '1.2rem',
//   },
//   actionsGrid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
//     gap: '1.5rem',
//   },
//   action: {
//     height: 120,
//     borderRadius: 20,
//     border: 'none',
//     color: '#fff',
//     fontSize: '1.05rem',
//     fontWeight: 700,
//     cursor: 'pointer',
//   },
// };

// export default AdminDashboard;


// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { endpoints } from '../../config/api';
import { permissions } from '../../config/permissions';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const role = currentUser?.role;
  const can = permissions[role] || {};

  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  /* 🔹 Dynamic counts (ADMIN ONLY) */
  useEffect(() => {
    if (role !== 'admin') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    Promise.all([
      fetch(endpoints.teachers.count, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(endpoints.students.count, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([tRes, sRes]) => {
        const t = await tRes.json();
        const s = await sRes.json();
        setTeacherCount(t.count || 0);
        setStudentCount(s.count || 0);
      })
      .catch(err => console.error('Dashboard count error:', err));
  }, [role]);

  /* 🔹 Role-based title */
  const title =
    role === 'admin' ? 'Admin Dashboard' : 'Teacher Dashboard';

  const subtitle =
    role === 'admin'
      ? 'Manage school operations'
      : 'Manage your classes & students';

  return (
    <>
      {/* 🔹 TITLE */}
      <h2 style={styles.sectionTitle}>{title}</h2>
      <p style={styles.subtitle}>{subtitle}</p>

      {/* 🔹 STATS (ADMIN ONLY) */}
      {role === 'admin' && (
        <section style={styles.statsGrid}>
          <StatCard label="Teachers" value={teacherCount} icon="👨‍🏫" />
          <StatCard label="Students" value={studentCount} icon="🧑‍🎓" />
        </section>
      )}

      {/* 🔹 ACTIONS */}
      <h3 style={styles.actionsTitle}>Quick Actions</h3>

      <section style={styles.actionsGrid}>
        {/* ADMIN */}
        {can.addStudent && (
          <Action label="Add Student" color="#3b82f6" onClick={() => navigate('/add-student')} />
        )}
        {can.viewTeachers && (
          <Action label="Teachers" color="#22c55e" onClick={() => navigate('/teachers')} />
        )}
        {can.viewStudents && (
          <Action label="Students" color="#38bdf8" onClick={() => navigate('/students')} />
        )}
        {can.assignTeacher && (
          <Action label="Assign Teachers" color="#f97316" onClick={() => navigate('/assign-teacher')} />
        )}
        {can.attendanceOverview && (
          <Action label="Attendance" color="#0ea5e9" onClick={() => navigate('/admin/attendance-overview')} />
        )}
        {can.examControls && (
          <Action label="Exam Controls" color="#ef4444" onClick={() => navigate('/exam-controls')} />
        )}

        {/* TEACHER */}
        {can.myStudents && (
          <Action label="My Students" color="#38bdf8" onClick={() => navigate('/my-students')} />
        )}
        {can.addMarks && (
          <Action label="Add Marks" color="#f97316" onClick={() => navigate('/add-marks')} />
        )}
        {can.markAttendance && (
          <Action label="Attendance" color="#0ea5e9" onClick={() => navigate('/attendance')} />
        )}
        {can.viewResult && (
          <Action label="Results" color="#22c55e" onClick={() => navigate('/view-result')} />
        )}
      </section>
    </>
  );
};

/* 🔹 COMPONENTS */
const StatCard = ({ icon, label, value }) => (
  <div style={styles.statCard}>
    <span style={styles.statIcon}>{icon}</span>
    <div>
      <p>{label}</p>
      <h2>{value}</h2>
    </div>
  </div>
);

const Action = ({ label, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      ...styles.action,
      background: `linear-gradient(135deg, ${color}, #00000030)`,
    }}
  >
    {label}
  </button>
);

/* 🔹 STYLES */
const styles = {
  sectionTitle: {
    fontSize: '1.6rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: '#64748b',
    marginBottom: '2rem',
  },
  actionsTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    marginBottom: '1.2rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
    gap: '2rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    background: '#fff',
    padding: '1.5rem',
    borderRadius: 16,
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
  },
  statIcon: {
    fontSize: '2.4rem',
    background: '#eff6ff',
    padding: '0.8rem',
    borderRadius: 14,
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
    gap: '1.5rem',
  },
  action: {
    height: 120,
    borderRadius: 20,
    border: 'none',
    color: '#fff',
    fontSize: '1.05rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default AdminDashboard;
