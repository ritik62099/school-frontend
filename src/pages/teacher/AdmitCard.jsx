// src/pages/teacher/AdmitCard.jsx
import { useState, useEffect } from 'react';
import TeacherLayout from './TeacherLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdmitCard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [exam, setExam] = useState('Final Examination 2025');

  useEffect(() => {
    const allStudents = JSON.parse(localStorage.getItem('school_students') || '[]');
    const myStudents = allStudents.filter(s => user.assignedClasses.includes(s.class));
    setStudents(myStudents);
    if (myStudents.length > 0) setSelectedStudent(myStudents[0]);
  }, [user]);

  if (students.length === 0) {
    return (
      <TeacherLayout>
        <p>No students in your classes.</p>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <style>{`
        .controls {
          margin-bottom: 24px;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
        }
        input, select {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 15px;
        }
        .admit-card {
          background: white;
          width: 400px;
          padding: 25px;
          border: 2px solid #7c2d12;
          border-radius: 10px;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .school-name {
          font-size: 20px;
          font-weight: bold;
          color: #7c2d12;
        }
        .exam-title {
          font-size: 16px;
          margin-top: 6px;
          color: #92400e;
        }
        .info-row {
          display: flex;
          margin: 12px 0;
        }
        .info-label {
          width: 140px;
          color: #6b7280;
        }
        .info-value {
          font-weight: 600;
          color: #1f2937;
        }
        .photo-placeholder {
          width: 80px;
          height: 80px;
          background: #f3f4f6;
          border: 1px dashed #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
        }
      `}</style>

      <h2>Admit Card</h2>
      <div className="controls">
        <div>
          <label>Exam: </label>
          <input
            type="text"
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            style={{ width: '250px' }}
          />
        </div>
        <div>
          <label>Student: </label>
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
      </div>

      {selectedStudent && (
        <div className="admit-card">
          <div className="header">
            <div className="school-name">GREEN VALLEY SCHOOL</div>
            <div className="exam-title">{exam}</div>
          </div>

          <div className="info-row">
            <div className="info-label">Name:</div>
            <div className="info-value">{selectedStudent.name}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Class:</div>
            <div className="info-value">{selectedStudent.class}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Roll No:</div>
            <div className="info-value">{selectedStudent.rollNo}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Exam Date:</div>
            <div className="info-value">October 20–30, 2025</div>
          </div>
          <div className="info-row">
            <div className="info-label">Center:</div>
            <div className="info-value">Main Campus, Room 101</div>
          </div>

          <div className="photo-placeholder">
            Photo
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', marginTop: '20px', color: '#7c2d12' }}>
        🖨️ Use "Print → Save as PDF" to download admit card.
      </p>
    </TeacherLayout>
  );
}