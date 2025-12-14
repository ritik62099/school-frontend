export const permissions = {
  admin: {
    addStudent: true,
    viewTeachers: true,
    assignTeacher: true,
    attendanceOverview: true,
    examControls: true,
  },
  teacher: {
    addStudent: false,
    viewTeachers: false,
    assignTeacher: false,
    attendanceOverview: false,
    examControls: false,
    markAttendance: true,
    addMarks: true,
  },
};
