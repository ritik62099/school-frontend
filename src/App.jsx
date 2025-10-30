// src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        {/* ✅ Global Print Styles */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; }
            .admin-card { page-break-inside: avoid; margin-bottom: 20mm; }
            @page { size: A4; margin: 10mm; }
          }
        `}</style>

        <AppRouter />
      </Router>
    </AuthProvider>
  );
};

export default App;