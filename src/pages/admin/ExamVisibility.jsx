import React, { useState, useEffect } from "react";
import { endpoints } from "../../config/api";

const ExamVisibility = () => {
  const [exams, setExams] = useState({
    pa1: true,
    pa2: true,
    pa3: true,
    pa4: true,
    halfYear: true,
    final: true,
  });

  const examLabels = {
    pa1: "PA1",
    pa2: "PA2",
    pa3: "PA3",
    pa4: "PA4",
    halfYear: "SA1 (Half Year)",
    final: "SA2 (Final)",
  };

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      const res = await fetch(endpoints.settings.getExamVisibility, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.visibleExams) {
          const updated = {};
          Object.keys(examLabels).forEach((exam) => {
            updated[exam] = data.visibleExams.includes(exam);
          });
          setExams(updated);
        }
      }
    };

    loadSettings();
  }, []);

  const handleToggle = (key) => {
    setExams((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = async () => {
    const visibleExams = Object.keys(exams).filter((ex) => exams[ex]);

    const res = await fetch(endpoints.settings.setExamVisibility, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ visibleExams }),
    });

    const data = await res.json();
    alert(res.ok ? "Exam visibility updated!" : "Error: " + data.message);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Manage Exam Visibility</h2>

        {Object.keys(examLabels).map((key) => (
          <div key={key} style={styles.row}>
            <span style={styles.label}>{examLabels[key]}</span>

            <div
              style={{
                ...styles.toggle,
                background: exams[key] ? "#4ade80" : "#e5e7eb",
                justifyContent: exams[key] ? "flex-end" : "flex-start",
              }}
              onClick={() => handleToggle(key)}
            >
              <div style={styles.circle}></div>
            </div>
          </div>
        ))}

        <button style={styles.saveBtn} onClick={saveSettings}>
          Save Settings
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    background: "#f4f6f9",
    minHeight: "100vh",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    padding: "22px",
    borderRadius: "14px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "20px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 0",
    alignItems: "center",
    borderBottom: "1px solid #ececec",
  },
  label: {
    fontSize: "16px",
    fontWeight: "600",
  },

  // ⭐ Perfect toggle switch (no pseudo-elements)
  toggle: {
    width: "55px",
    height: "28px",
    borderRadius: "50px",
    display: "flex",
    alignItems: "center",
    padding: "3px",
    cursor: "pointer",
    transition: "0.3s ease",
  },
  circle: {
    width: "22px",
    height: "22px",
    background: "#fff",
    borderRadius: "50%",
    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
    transition: "0.3s ease",
  },

  saveBtn: {
    marginTop: "22px",
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default ExamVisibility;
