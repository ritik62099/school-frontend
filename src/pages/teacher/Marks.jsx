// src/pages/teacher/Marks.jsx
import { useState, useEffect } from 'react';
import TeacherLayout from './TeacherLayout';
import { useAuth } from '../../context/AuthContext';

export default function Marks() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});

  useEffect(() => {
    const allStudents = JSON.parse(localStorage.getItem('school_students') || '[]');
    const myStudents = allStudents.filter(s => user.assignedClasses.includes(s.class));
    setStudents(myStudents);

    const saved = JSON.parse(localStorage.getItem('school_marks') || '[]');
    const myMarks = saved.filter(m => user.assignedClasses.includes(m.class));
    const marksMap = {};
    myMarks.forEach(m => {
      marksMap[m.studentId] = m.subjects;
    });
    setMarksData(marksMap);
  }, [user]);

  const handleMarkChange = (studentId, subject, value) => {
    const numValue = value === '' ? '' : Number(value);
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: numValue
      }
    }));
  };

  const saveMarks = () => {
    const existing = JSON.parse(localStorage.getItem('school_marks') || '[]');
    const filtered = existing.filter(m => !user.assignedClasses.includes(m.class));

    const newRecords = students.map(s => ({
      studentId: s.id,
      class: s.class,
      subjects: marksData[s.id] || {
        hindi: 0,
        english: 0,
        maths: 0,
        science: 0,
        social: 0
      }
    }));

    localStorage.setItem('school_marks', JSON.stringify([...filtered, ...newRecords]));
    alert('Marks saved successfully!');
  };

  const subjects = ['hindi', 'english', 'maths', 'science', 'social'];

  return (
    <TeacherLayout>
      <style>{`
        .save-btn {
          background: #059669;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          margin-bottom: 20px;
          cursor: pointer;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        th, td {
          padding: 12px;
          text-align: center;
          border-bottom: 1px solid #eee;
        }
        th {
          background: #f0fdf4;
          font-weight: 600;
        }
        input {
          width: 60px;
          padding: 6px;
          text-align: center;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      `}</style>

      <h2>Enter Marks</h2>
      <button onClick={saveMarks} className="save-btn">Save All Marks</button>

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Class</th>
            <th>Roll No</th>
            {subjects.map(sub => <th key={sub}>{sub.charAt(0).toUpperCase() + sub.slice(1)}</th>)}
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.class}</td>
              <td>{student.rollNo}</td>
              {subjects.map(sub => (
                <td key={sub}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={marksData[student.id]?.[sub] ?? ''}
                    onChange={(e) => handleMarkChange(student.id, sub, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TeacherLayout>
  );
}