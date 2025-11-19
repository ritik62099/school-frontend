// src/routes/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AddStudent from '../pages/admin/AddStudent';
import TeachersList from '../pages/admin/TeachersList';
import PendingApproval from '../pages/admin/PendingApproval';
import Attendance from '../pages/admin/Attendance';
import AssignTeacher from '../pages/admin/AssignTeacher';
import AddMarks from '../pages/admin/AddMarks';
import ViewResult from '../pages/admin/ViewResult';
import StudentsList from '../pages/admin/StudentsList';
import MyStudents from '../pages/admin/MyStudents';
import AdmitCards from '../pages/admin/AdmitCards';
import IDCards from '../pages/admin/IDCards';
import EditStudent from '../pages/admin/EditStudent';
import MonthlyAttendanceReport from '../pages/admin/MonthlyAttendanceReport';
import ClassSubjectManager from '../pages/admin/ClassSubjectManager';
import ClassFees from '../pages/admin/ClassFees';
import StudentPayments from '../pages/admin/StudentPayments';
import StudentPaymentForm from '../pages/admin/StudentPaymentForm';
import Periodic from '../pages/admin/Periodicresult';
import ExamControls from '../pages/admin/ExamVisibility';
import AttendanceOverview from '../pages/admin/AttendanceOverview';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/pending" element={<PendingApproval />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute><AdminDashboard /></ProtectedRoute>
      } />
      
      <Route path="/add-student" element={
        <ProtectedRoute><AddStudent /></ProtectedRoute>
      } />
      
      <Route path="/students" element={
        <ProtectedRoute><StudentsList /></ProtectedRoute>
      } />
      
      <Route path="/admin/students/edit/:id" element={
        <ProtectedRoute><EditStudent /></ProtectedRoute>
      } />
      
      <Route path="/my-students" element={
        <ProtectedRoute><MyStudents /></ProtectedRoute>
      } />
      <Route path="/class-subjects" element={
        <ProtectedRoute><ClassSubjectManager /></ProtectedRoute>
      } />
      <Route path="/class-fees" element={
        <ProtectedRoute><ClassFees /></ProtectedRoute>
      } />
      <Route path="/student-payments" element={
        <ProtectedRoute><StudentPayments /></ProtectedRoute>
      } />

      <Route 
  path="/record-payment" 
  element={<ProtectedRoute><StudentPaymentForm /></ProtectedRoute>} 
/>
      
      <Route path="/teachers" element={
        <ProtectedRoute><TeachersList /></ProtectedRoute>
      } />
      
      <Route path="/attendance" element={
        <ProtectedRoute><Attendance /></ProtectedRoute>
      } />

      <Route path="/admin/attendance-overview" element={
        <AdminRoute><AttendanceOverview /></AdminRoute>
      } />
      
      <Route path="/exam-controls" element={
        <AdminRoute><ExamControls /></AdminRoute>
      } />
      
      <Route path="/attendance/monthly-report" element={
        <ProtectedRoute><MonthlyAttendanceReport /></ProtectedRoute>
      } />
      
      <Route path="/assign-teacher" element={
        <AdminRoute><AssignTeacher /></AdminRoute>
      } />
      
      <Route path="/add-marks" element={
        <ProtectedRoute><AddMarks /></ProtectedRoute>
      } />
      
      <Route path="/view-result" element={
        <ProtectedRoute><ViewResult /></ProtectedRoute>
      } />
      <Route path="/periodic-result" element={
        <ProtectedRoute><Periodic /></ProtectedRoute>
      } />
      
      <Route path="/admit-cards" element={
        <ProtectedRoute><AdmitCards /></ProtectedRoute>
      } />
      
      <Route path="/id-cards" element={
        <ProtectedRoute><IDCards /></ProtectedRoute>
      } />

      {/* ✅ ADD THIS LINE */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* ✅ This should be LAST */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;