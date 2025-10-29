// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ProtectedRoute from './components/ui/ProtectedRoute';
import AdminRoute from './components/ui/AdminRoute'; // ✅ Import new component
import Dashboard from './pages/admin/AdminDashboard';
import AddStudent from './pages/admin/AddStudent';
import TeachersList from './pages/admin/TeachersList';
import PendingApproval from './pages/admin/PendingApproval';
import Attendance from './pages/admin/Attendance';
import AssignTeacher from './pages/admin/AssignTeacher';
import Mark from './pages/admin/AddMarks';
import ViewResult from './pages/admin/ViewResult';
import StudentsList from './pages/admin/StudentsList';
import MyStudents from './pages/admin/MyStudents';
import AdmitCards from './pages/admin/AdmitCards';
import IDCards from './pages/admin/IDCards';
import EditStudent from './pages/admin/EditStudent';
import MonthlyAttendanceReport from './pages/admin/MonthlyAttendanceReport';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/pending" element={<PendingApproval />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/add-student" 
              element={
                <ProtectedRoute>
                  <AddStudent />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/students" 
              element={
                <ProtectedRoute>
                  <StudentsList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/students/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditStudent />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/my-students" 
              element={
                <ProtectedRoute>
                  <MyStudents />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/teachers" 
              element={
                <ProtectedRoute>
                  <TeachersList />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/attendance" 
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              } 
            />
            
            <Route 
  path="/attendance/monthly-report" 
  element={
    <ProtectedRoute>
      <MonthlyAttendanceReport />
    </ProtectedRoute>
  } 
/>
            {/* ✅ Use AdminRoute instead of inline check */}
            <Route 
              path="/assign-teacher" 
              element={
                <AdminRoute>
                  <AssignTeacher />
                </AdminRoute>
              } 
            />
            <Route
              path="/add-marks"
              element={
                <ProtectedRoute>
                  <Mark />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-result"
              element={
                <ProtectedRoute>
                  <ViewResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admit-cards"
              element={
                <ProtectedRoute>
                  <AdmitCards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/id-cards"
              element={
                <ProtectedRoute>
                  <IDCards />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;