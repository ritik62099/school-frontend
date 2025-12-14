

// src/routes/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import PendingApproval from '../pages/admin/PendingApproval';

import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

import AdminLayout from '../components/layout/AdminLayout';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AddStudent from '../pages/admin/AddStudent';
import TeachersList from '../pages/admin/TeachersList';
import StudentsList from '../pages/admin/StudentsList';
import EditStudent from '../pages/admin/EditStudent';
import MyStudents from '../pages/admin/MyStudents';
import Attendance from '../pages/admin/Attendance';
import AssignTeacher from '../pages/admin/AssignTeacher';
import AddMarks from '../pages/admin/AddMarks';
import ViewResult from '../pages/admin/ViewResult';
import AdmitCards from '../pages/admin/AdmitCards';
import IDCards from '../pages/admin/IDCards';
import MonthlyAttendanceReport from '../pages/admin/MonthlyAttendanceReport';
import ClassSubjectManager from '../pages/admin/ClassSubjectManager';
import ClassFees from '../pages/admin/ClassFees';
import StudentPayments from '../pages/admin/StudentPayments';
import StudentPaymentForm from '../pages/admin/StudentPaymentForm';
import Periodic from '../pages/admin/Periodicresult';
import ExamControls from '../pages/admin/ExamVisibility';
import AttendanceOverview from '../pages/admin/AttendanceOverview';
import SchoolAttendanceSummary from '../pages/admin/SchoolAttendanceSummary';

const AppRouter = () => {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/pending" element={<PendingApproval />} />

      {/* ================= ADMIN / AUTHENTICATED AREA ================= */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/dashboard" element={<AdminDashboard />} />

        {/* Students */}
        <Route path="/add-student" element={<AddStudent />} />
        <Route path="/students" element={<StudentsList />} />
        <Route path="/admin/students/edit/:id" element={<EditStudent />} />
        <Route path="/my-students" element={<MyStudents />} />

        {/* Teachers */}
        <Route path="/teachers" element={<TeachersList />} />
        <Route
          path="/assign-teacher"
          element={
            <AdminRoute>
              <AssignTeacher />
            </AdminRoute>
          }
        />

        {/* Attendance */}
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/monthly-report" element={<MonthlyAttendanceReport />} />
        <Route
          path="/admin/attendance-overview"
          element={
            <AdminRoute>
              <AttendanceOverview />
            </AdminRoute>
          }
        />
        <Route path="/admin/school-attendance-summary" element={<SchoolAttendanceSummary />} />

        {/* Exams & Results */}
        <Route path="/add-marks" element={<AddMarks />} />
        <Route path="/view-result" element={<ViewResult />} />
        <Route path="/periodic-result" element={<Periodic />} />
        <Route
          path="/exam-controls"
          element={
            <AdminRoute>
              <ExamControls />
            </AdminRoute>
          }
        />

        {/* Cards */}
        <Route path="/admit-cards" element={<AdmitCards />} />
        <Route path="/id-cards" element={<IDCards />} />

        {/* Class / Fees */}
        <Route path="/class-subjects" element={<ClassSubjectManager />} />
        <Route path="/class-fees" element={<ClassFees />} />
        <Route path="/student-payments" element={<StudentPayments />} />
        <Route path="/record-payment" element={<StudentPaymentForm />} />
      </Route>

      {/* ================= DEFAULT / FALLBACK ================= */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
