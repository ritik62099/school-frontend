// src/hooks/useStudents.js
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // ✅// ✅ Aapka existing hook
import { endpoints } from '../config/api';

/**
 * Fetch students with auth token & optional class filter
 */
export const useStudents = (filterClass = null) => {
  const { currentUser } = useAuth(); 
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        let url = endpoints.students.list;
        if (filterClass) {
          url += `?class=${encodeURIComponent(filterClass)}`;
        }

        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to fetch students');
        }

        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        setError(err.message || 'Unable to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentUser, filterClass]);

  return { students, loading, error };
};