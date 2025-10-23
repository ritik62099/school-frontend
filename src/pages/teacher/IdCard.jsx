// src/pages/teacher/IdCard.jsx
import { useState, useEffect } from 'react';
import TeacherLayout from './TeacherLayout';
import { useAuth } from '../../context/AuthContext';

export default function IdCard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const allStudents = JSON.parse(localStorage.getItem('school_students') || '[]');
    const myStudents = allStudents.filter(s => user.assignedClasses.includes(s.class));
    setStudents(myStudents);
    if (myStudents.length > 0) setSelectedStudent(myStudents[0]);
  }, [user]);

  if (students.length === 0) {
    return (
      <TeacherLayout>
        <p>No students in your classes to generate ID cards.</p>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <style>{`
        .selector {
          margin-bottom: 24px;
        }
        .id-card {
          background: white;
          width: 320px;
          padding: 20px;
          border: 2px solid #065f46;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          margin: 0 auto;
        }
        .school-name {
          font-size: 18px;
          font-weight: bold;
          color: #065f46;
          margin-bottom: 10px;
        }
        .photo {
          width: 100px;
          height: 100px;
          background: #e5e7eb;
          border-radius: 50%;
          margin: 10px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #6b7280;
        }
        .info {
          margin: 12px 0;
          font-size: 14px;
        }
        .label {
          display: block;
          color: #6b7280;
          font-size: 12px;
        }
        .value {
          font-weight: 600;
          color: #1f2937;
        }
        select {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 15px;
        }
      `}</style>

      <h2>Student ID Card</h2>
      <div className="selector">
        <label>Select Student: </label>
        <select
          value={selectedStudent?.id || ''}
          onChange={(e) => {
            const student = students.find(s => s.id === e.target.value);
            setSelectedStudent(student);
          }}
        >
          {students.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.class})
            </option>
          ))}
        </select>
      </div>

      {selectedStudent && (
        <div className="id-card">
          <div className="school-name">Green Valley School</div>
          <div className="photo">
            {selectedStudent.name.charAt(0).toUpperCase()}
          </div>
          <div className="info">
            <span className="label">Name</span>
            <div className="value">{selectedStudent.name}</div>
          </div>
          <div className="info">
            <span className="label">Class / Roll No</span>
            <div className="value">{selectedStudent.class} / {selectedStudent.rollNo}</div>
          </div>
          <div className="info">
            <span className="label">ID</span>
            <div className="value">STU-{selectedStudent.id}</div>
          </div>
          <div className="info">
            <span className="label">Valid Until</span>
            <div className="value">March 2026</div>
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', marginTop: '20px', color: '#065f46' }}>
        💡 Tip: Use browser "Print → Save as PDF" to download.
      </p>
    </TeacherLayout>
  );
}