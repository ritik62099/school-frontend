// // src/hooks/useTeachers.js
// import { useEffect, useState } from 'react';
// import { useAuth } from '../context/AuthContext'; // ✅
// import { endpoints } from '../config/api';

// /**
//  * Fetch approved teachers list
//  */
// export const useTeachers = () => {
//  const { currentUser } = useAuth();
//   const [teachers, setTeachers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (!currentUser || currentUser.role !== 'admin') {
//       setLoading(false);
//       return;
//     }

//     const fetchTeachers = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch(endpoints.teachers.list, {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json'
//           }
//         });

//         if (!res.ok) {
//           const errData = await res.json().catch(() => ({}));
//           throw new Error(errData.message || 'Failed to fetch teachers');
//         }

//         const data = await res.json();
//         const approved = data.filter(t => t.role === 'teacher' && t.isApproved);
//         setTeachers(approved);
//         setError('');
//       } catch (err) {
//         setError(err.message || 'Unable to load teachers');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTeachers();
//   }, [currentUser]);

//   return { teachers, loading, error };
// };
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { endpoints } from '../config/api';

/**
 * Fetch approved teachers list with refetch capability
 */
export const useTeachers = () => {
  const { currentUser } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTeachers = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetch(endpoints.teachers.list, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to fetch teachers');
      }

      const data = await res.json();
      const approved = data.filter(t => t.role === 'teacher' && t.isApproved);
      setTeachers(approved);
    } catch (err) {
      setError(err.message || 'Unable to load teachers');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Initial fetch
  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return { teachers, loading, error, refetch: fetchTeachers }; // ✅ Now refetch is available
};