// src/components/ProtectedRoute.jsx
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // Agar user logged in nahi hai → login page
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Agar user teacher hai aur approved nahi hai → pending page
  if (currentUser.role === 'teacher' && !currentUser.isApproved) {
    return <Navigate to="/pending" />;
  }

  return children;
};

export default ProtectedRoute;