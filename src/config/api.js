

// src/config/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isProd = import.meta.env.PROD;

if (isProd && !API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is required in production!');
}

const api = (path) => {
  // path should already include /api
  if (isProd) {
    return `${API_BASE_URL}${path}`;
  }
  return path; // Vite dev server will proxy /api/... → backend
};



export const endpoints = {
  auth: {
    login: api('/api/auth/login'),
    signup: api('/api/auth/signup'),
    me: api('/api/auth/me'),
  },
  teachers: {
    list: api('/api/teachers'),
    count: api('/api/teachers/count'),
     approve: (id) => api(`/api/teachers/${id}/approve`),   // ✅ Add this
    delete: (id) => api(`/api/teachers/${id}`),
    assign: (id) => api(`/api/teachers/${id}/assign`),
    attendanceAccess: (id) => api(`/api/teachers/${id}/attendance-access`),
  },
  students: {
  list: api('/api/students'),
  count: api('/api/students/count'),
  byClass: api('/api/students/by-class'),
  myStudents: api('/api/students/my-students'),
  create: api('/api/students'),
},
  attendance: {
    get: (date, className) =>
      api(`/api/attendance?date=${encodeURIComponent(date)}&class=${encodeURIComponent(className)}`),
    submit: api('/api/attendance'),
  },
  marks: {
    list: api('/api/marks'),
    save: (studentId) => api(`/api/marks/${studentId}`),
    getStudent: (studentId) => api(`/api/marks/${studentId}`),
  },
};
