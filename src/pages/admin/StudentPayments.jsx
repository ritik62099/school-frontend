import React from "react";

const StudentFeeManagement = () => {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>💰 Student Fee Management</h1>
        <p style={styles.subtitle}>This feature is coming soon!</p>
        <div style={styles.loader}></div>
        <p style={styles.text}>
          We're working hard to bring you a complete student fee tracking and billing system.
        </p>
      </div>
    </div>
  );
};

// 🎨 Styling
const styles = {
  page: {
    background: "linear-gradient(to bottom right, #e0f2fe, #ecfdf5)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
  },
  card: {
    background: "#fff",
    padding: "3rem 2rem",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    textAlign: "center",
    maxWidth: "500px",
    width: "100%",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "#475569",
    fontSize: "1.2rem",
    marginBottom: "2rem",
  },
  loader: {
    width: "50px",
    height: "50px",
    border: "6px solid #e2e8f0",
    borderTop: "6px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 1.5rem",
  },
  text: {
    color: "#334155",
    fontSize: "1rem",
  },
};

// 🌀 Add CSS keyframes (inline)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`;
document.head.appendChild(styleSheet);

export default StudentFeeManagement;
