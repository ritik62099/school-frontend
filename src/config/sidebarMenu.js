// // src/config/sidebarMenu.js

// export const adminMenu = [
//   { label: 'Dashboard', path: '/dashboard', icon: '🏠' },

//   { label: 'Add Student', path: '/add-student', icon: '➕' },
//   { label: 'Manage Teachers', path: '/teachers', icon: '👨‍🏫' },
//   { label: 'Assign Teachers', path: '/assign-teacher', icon: '📌' },
//   { label: 'View All Students', path: '/students', icon: '🧑‍🎓' },
//   { label: 'School Attendance Summary', path: '/admin/school-attendance-summary', icon: '🏫' },

//   { label: 'Admit Cards', path: '/admit-cards', icon: '🎫' },
//   { label: 'ID Cards', path: '/id-cards', icon: '🪪' },

//   { label: 'View Result', path: '/view-result', icon: '📄' },
//   { label: 'Periodic Result', path: '/periodic-result', icon: '📊' },

//   { label: 'Manage Class Subjects', path: '/class-subjects', icon: '📚' },
//   { label: 'Exam Controls', path: '/exam-controls', icon: '🛠️' },

//   { label: 'Attendance Overview', path: '/admin/attendance-overview', icon: '🗓️' },
  
//   //  { label: 'Student Payments', path: '/student-payments', color: '#7e22ce' },
  

//   { label: 'Add Marks', path: '/add-marks', icon: '✍️' },
// ];

// export const getTeacherMenu = (teacherSummary) => {
//   const menu = [
//     { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
//     { label: 'My Students', path: '/my-students', icon: '🧑‍🎓' },
//     { label: 'Add Marks', path: '/add-marks', icon: '✍️' },
//   ];

//   if (teacherSummary?.canMarkAnyAttendance) {
//     menu.push(
//       { label: 'Mark Attendance', path: '/attendance', icon: '🗓️' },
//       { label: 'Attendance Download', path: '/attendance/monthly-report', icon: '⬇️' }
//     );
//   }

//   return menu;
// };



// src/config/sidebarMenu.js

export const adminMenu = [
  { label: 'Dashboard', path: '/dashboard', icon: '🏠' },

  { label: 'Add Student', path: '/add-student', icon: '➕' },
  { label: 'Manage Teachers', path: '/teachers', icon: '👨‍🏫' },
  { label: 'Assign Teachers', path: '/assign-teacher', icon: '📌' },
  { label: 'View All Students', path: '/students', icon: '🧑‍🎓' },
  { label: 'School Attendance Summary', path: '/admin/school-attendance-summary', icon: '🏫' },

  { label: 'Admit Cards', path: '/admit-cards', icon: '🎫' },
  { label: 'ID Cards', path: '/id-cards', icon: '🪪' },

  { label: 'View Result', path: '/view-result', icon: '📄' },
  { label: 'Periodic Result', path: '/periodic-result', icon: '📊' },

  { label: 'Manage Class Subjects', path: '/class-subjects', icon: '📚' },
  { label: 'Exam Controls', path: '/exam-controls', icon: '🛠️' },

  { label: 'Attendance Overview', path: '/admin/attendance-overview', icon: '🗓️' },
  
  // 🔥 NEW: Manual Attendance Link Added Here
  { label: 'Manual Attendance', path: '/manual-attendance', icon: '📝' },
  
  // { label: 'Student Payments', path: '/student-payments', color: '#7e22ce' },
  
  { label: 'Add Marks', path: '/add-marks', icon: '✍️' },
];

export const getTeacherMenu = (teacherSummary) => {
  const menu = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'My Students', path: '/my-students', icon: '🧑‍🎓' },
    { label: 'Add Marks', path: '/add-marks', icon: '✍️' },
    // { label: 'View Result', path: '/view-result', icon: '📄' }, // 🔥 Teacher ko bhi result dekhna chahiye
  ];

  if (teacherSummary?.canMarkAnyAttendance) {
    menu.push(
      { label: 'Mark Attendance', path: '/attendance', icon: '🗓️' },
      { label: 'Attendance Download', path: '/attendance/monthly-report', icon: '⬇️' }
    );
  }

  return menu;
};