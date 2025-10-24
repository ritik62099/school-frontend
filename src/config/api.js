

// // src/config/api.js
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // In development, default to proxy-friendly relative paths
// // In production, require absolute URL
// const isProd = import.meta.env.PROD;

// if (isProd && !API_BASE_URL) {
//   throw new Error('VITE_API_BASE_URL is required in production!');
// }

// // Helper to build endpoint
// const api = (path) => {
//   if (isProd) {
//     return `${API_BASE_URL}${path}`;
//   }
//   // In dev, use relative path (relies on Vite proxy)
//   return `/api${path}`;
// };

// export const endpoints = {
//   auth: {
//     login: api('/auth/login'),
//     signup: api('/auth/signup'),
//     requestOtp: api('/auth/request-otp'),
//     me: api('/auth/me'),
//   },
//   teachers: {
//     list: api('/teachers'),
//     count: api('/teachers/count'),
//     assign: (id) => api(`/teachers/assign/${id}`),
//     attendanceAccess: (id) => api(`/teachers/attendance-access/${id}`),
//     approve: (id) => api(`/teachers/approve/${id}`),
//   },
//   students: {
//     list: api('/students'),
//     myStudents: api('/students/my-students'),
//     create: api('/students'),
//     count: api('/students/count'),
//     byClass: api('/students/by-class'),
//     byClassParam: (className) => api(`/students?class=${encodeURIComponent(className)}`),
//   },
//   attendance: {
//     get: (date, className) => 
//       api(`/attendance?date=${encodeURIComponent(date)}&class=${encodeURIComponent(className)}`),
//     submit: api('/attendance'),
//   },
//   marks: {
//     list: api('/marks'),
//     save: (studentId) => api(`/marks/${studentId}`),
//     getStudent: (studentId) => api(`/marks/${studentId}`),
//   },
// };

// export default API_BASE_URL;

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

// export const endpoints = {
//   auth: {
//     login: api('/api/auth/login'),       // ✅ include /api here
//     signup: api('/api/auth/signup'),
//     requestOtp: api('/api/auth/request-otp'),
//     me: api('/api/auth/me'),
//   },
//   teachers: {
//     list: api('/api/teachers'),
//     count: api('/api/teachers/count'),
//     // ... etc
//   },
//   students: {
//     list: api('/api/students'),
//     // ...
//   },
//   attendance: {
//     get: (date, className) => 
//       api(`/api/attendance?date=${encodeURIComponent(date)}&class=${encodeURIComponent(className)}`),
//     submit: api('/api/attendance'),
//   },
//   marks: {
//     list: api('/api/marks'),
//     save: (studentId) => api(`/api/marks/${studentId}`),
//     getStudent: (studentId) => api(`/api/marks/${studentId}`),
//   },
// };

export const endpoints = {
  auth: {
    login: api('/api/auth/login'),
    signup: api('/api/auth/signup'),
    requestOtp: api('/api/auth/request-otp'),
    me: api('/api/auth/me'),
  },
  teachers: {
    list: api('/api/teachers'),
    count: api('/api/teachers/count'),
  },
  students: {
  list: api('/api/students'),
  count: api('/api/students/count'),
  byClass: api('/api/students/by-class'),
  myStudents: api('/api/students/my-students'),
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
