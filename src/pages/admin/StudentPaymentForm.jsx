// // src/pages/admin/StudentPaymentForm.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { endpoints } from '../../config/api';
// import BottomTabBar from '../../components/ui/BottomTabBar';

// const StudentPaymentForm = () => {
//      const navigate = useNavigate();
//       const location = useLocation();
//   const { studentId } = location.state || {};

//   const [student, setStudent] = useState(null);
//   const [classFees, setClassFees] = useState({});
//   const [transportFees, setTransportFees] = useState({});
//   const [paymentHistory, setPaymentHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMonth, setSelectedMonth] = useState('');
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [amountPaid, setAmountPaid] = useState('');
//   const [message, setMessage] = useState('');

//   const isMobile = useMemo(() => window.innerWidth <= 768, []);

//   const months = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];

//   // ✅ NEW: Utility map for faster month-to-index lookup and sorting
//   const monthIndexMap = useMemo(() => {
//     return months.reduce((map, month, index) => {
//       map[month] = index;
//       return map;
//     }, {});
//   }, [months]);

//   useEffect(() => {
//     if (!studentId) return navigate('/student-payments');

//     const fetchData = async () => {
//       const token = localStorage.getItem('token');
//       try {
//         const studentRes = await fetch(`${endpoints.students.list}/${studentId}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const studentData = await studentRes.json();
//         setStudent(studentData);

//         const [classFeesRes, transportFeesRes, historyRes] = await Promise.all([
//           fetch(endpoints.classFees.list, { headers: { Authorization: `Bearer ${token}` } }),
//           fetch(endpoints.transportFees.list, { headers: { Authorization: `Bearer ${token}` } }),
//           // Using a higher limit for comprehensive history
//           fetch(endpoints.payments.history(studentId, 100), { headers: { Authorization: `Bearer ${token}` } }) 
//         ]);

//         const classFeesData = await classFeesRes.json();
//         const transportFeesData = await transportFeesRes.json();
//         const historyData = await historyRes.json();

//         const classMap = {};
//         classFeesData.forEach(f => classMap[f.className] = f.monthlyFee);
//         setClassFees(classMap);

//         const transportMap = {};
//         transportFeesData.forEach(f => transportMap[f.className] = f.monthlyFee);
//         setTransportFees(transportMap);

//         setPaymentHistory(historyData);
//         setLoading(false);
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setMessage('Failed to load data.');
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [studentId, navigate]);


// // ✅ CORRECTED LOGIC for getBalanceBefore
// const getBalanceBefore = (monthIndex, year) => {
//   console.log('🔍 Calculating carried balance for:', months[monthIndex], year);
//   if (!paymentHistory.length) {
//     console.log('❌ No payment history');
//     return 0;
//   }

//   const targetDate = new Date(year, monthIndex, 1);
//   console.log('🎯 Target date (Start of Month):', targetDate.toISOString());

//   // 1. Sort the history: Newest payment first (descending)
//   const sortedHistory = [...paymentHistory].sort((a, b) => {
//     // Convert month name to index using the map
//     const dateA = new Date(a.year, monthIndexMap[a.month], 1);
//     const dateB = new Date(b.year, monthIndexMap[b.month], 1);
//     return dateB - dateA; // Newest first
//   });

//   // 2. Find the first payment in the sorted list whose date is STRICTLY BEFORE the target date
//   const latestPreviousPayment = sortedHistory.find(p => {
//     const pDate = new Date(p.year, monthIndexMap[p.month], 1);
//     // We need the balance after the latest payment that occurred BEFORE the current month.
//     return pDate < targetDate; 
//   });

//   const lastBalance = latestPreviousPayment?.balanceAfter || 0;

//   console.log('🏁 Final carried balance:', lastBalance);
//   return lastBalance;
// };

// const handleSavePayment = async () => {
//   const token = localStorage.getItem('token');
//   const monthIndex = months.indexOf(selectedMonth);
//   if (monthIndex === -1) return setMessage('Please select a valid month.');

//   const classFee = classFees[student.class] || 0;
//   const transportFee = student.transport ? transportFees[student.class] || 0 : 0;
//   const baseDue = classFee + transportFee;

//   // ✅ Use the corrected function to get carried balance
//   const carriedBalance = getBalanceBefore(monthIndex, selectedYear);

//   // ✅ Total due = base + carried balance (can be negative for advance)
//   const totalDue = baseDue + carriedBalance;

//   const paid = parseFloat(amountPaid) || 0;
//   const balanceAfter = totalDue - paid;

//   const payload = {
//     studentId,
//     month: selectedMonth,
//     year: selectedYear,
//     classFee,
//     transportFee: student.transport ? transportFee : 0,
//     duesCarriedIn: carriedBalance, // For reference only
//     amountPaid: paid,
//     balanceAfter
//   };

//   try {
//     const res = await fetch(endpoints.payments.create, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`
//       },
//       body: JSON.stringify(payload)
//     });

//     if (res.ok) {
//       setMessage('Payment saved successfully!');
//       setAmountPaid('');
//       const histRes = await fetch(endpoints.payments.history(studentId, 100), {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const newHistory = await histRes.json();
//       setPaymentHistory(newHistory);
//     } else {
//       const err = await res.json();
//       setMessage(err.message || 'Failed to save payment.');
//     }
//   } catch (err) {
//     console.error('Save error:', err);
//     setMessage('Network error.');
//   }
// };
// // ... (rest of the component's rendering logic remains the same)
//   if (loading) return <div style={styles.center}>Loading...</div>;
//   if (!student) return <div style={styles.center}>Student not found.</div>;

//   const classFee = classFees[student.class] || 0;
//   const transportFee = student.transport ? transportFees[student.class] || 0 : 0;
//   const baseDue = classFee + transportFee;

//   return (
//     <div style={{ ...styles.container, paddingBottom: isMobile ? '70px' : '0' }}>
//       <header style={styles.header}>
//         <h1 style={styles.title}>Record Payment</h1>
//         <button onClick={() => navigate('/student-payments')} style={styles.backBtn}>
//           ← Back
//         </button>
//       </header>

//       <div style={styles.studentInfo}>
//         <h2>{student.name}</h2>
//         <p><strong>Class:</strong> {student.class} - {student.section} | Roll: {student.rollNo}</p>
//         <p><strong>Class Fee:</strong> ₹{classFee.toLocaleString()}</p>
//         {student.transport && <p><strong>Transport Fee:</strong> ₹{transportFee.toLocaleString()}</p>}
//       </div>

//       <div style={styles.formGroup}>
//         <label>Month</label>
//         <select
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           style={styles.select}
//         >
//           <option value="">Select Month</option>
//           {months.map(m => (
//             <option key={m} value={m}>{m}</option>
//           ))}
//         </select>
//       </div>

//       <div style={styles.formGroup}>
//         <label>Year</label>
//         <input
//           type="number"
//           value={selectedYear}
//           onChange={(e) => setSelectedYear(Number(e.target.value))}
//           min="2020"
//           max="2030"
//           style={styles.input}
//         />
//       </div>

//     {selectedMonth && (
//   <>
//     <div style={styles.dueCard}>
//       <p><strong>Base Due:</strong> ₹{baseDue.toLocaleString()}</p>
      
//       {/* ✅ Always show carried balance — even if 0 */}
//       <p><strong>Carried Balance:</strong> ₹{getBalanceBefore(months.indexOf(selectedMonth), selectedYear).toFixed(2)}</p>
      
//       <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e74c3c' }}>
//         Total Due: ₹{(baseDue + getBalanceBefore(months.indexOf(selectedMonth), selectedYear)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//       </p>
//     </div>

//     <div style={styles.formGroup}>
//       <label>Amount Paid (₹)</label>
//       <input
//         type="number"
//         value={amountPaid}
//         onChange={(e) => setAmountPaid(e.target.value)}
//         placeholder="0"
//         min="0"
//         step="any"
//         style={styles.input}
//       />
//     </div>

//     <button onClick={handleSavePayment} style={styles.saveBtn}>
//       Save Payment
//     </button>
//   </>
// )}

//       {message && <p style={{ ...styles.message, color: message.includes('success') ? '#27ae60' : '#e74c3c' }}>{message}</p>}

//       {/* Payment History Preview */}
// <div style={{ marginTop: '2rem' }}>
//   <h3>Recent History</h3>
//   {paymentHistory.length === 0 ? (
//     <p style={styles.noHistory}>No payment history</p>
//   ) : (
//     paymentHistory.slice(-3).reverse().map((p, i) => (
//       <div key={i} style={styles.historyItem}>
//         <span>{p.month} {p.year}</span>
//         <span>Paid: ₹{(p.amountPaid || 0).toLocaleString()}</span>
//         <span style={{ color: (p.balanceAfter || 0) <= 0 ? '#27ae60' : '#e74c3c' }}>
//           Balance: ₹{(p.balanceAfter || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//         </span>
//       </div>
//     ))
//   )}
// </div>

//       {isMobile && <BottomTabBar userRole="admin" />}
//     </div>
//   );
// };

// const styles = {
//   container: {
//     padding: '1.5rem',
//     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//     maxWidth: '800px',
//     margin: '0 auto',
//     backgroundColor: '#f8fafc',
//     minHeight: '100vh',
//     color: '#1e293b',
//   },
//   center: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: '100vh',
//     fontSize: '1.2rem',
//   },
//   header: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: '1.5rem',
//   },
//   title: {
//     fontSize: '1.8rem',
//     fontWeight: '700',
//   },
//   backBtn: {
//     padding: '0.5rem 1rem',
//     backgroundColor: '#3b82f6',
//     color: 'white',
//     border: 'none',
//     borderRadius: '8px',
//     cursor: 'pointer',
//   },
//   studentInfo: {
//     backgroundColor: '#dbeafe',
//     padding: '1rem',
//     borderRadius: '10px',
//     marginBottom: '1.5rem',
//     borderLeft: '4px solid #3b82f6',
//   },
//   formGroup: {
//     marginBottom: '1.25rem',
//   },
//   label: {
//     display: 'block',
//     marginBottom: '0.5rem',
//     fontWeight: '600',
//   },
//   select: {
//     width: '100%',
//     padding: '0.75rem',
//     borderRadius: '8px',
//     border: '1px solid #cbd5e1',
//     fontSize: '1rem',
//   },
//   input: {
//     width: '100%',
//     padding: '0.75rem',
//     borderRadius: '8px',
//     border: '1px solid #cbd5e1',
//     fontSize: '1rem',
//   },
//   dueCard: {
//     backgroundColor: '#fff9db',
//     padding: '1rem',
//     borderRadius: '10px',
//     marginBottom: '1.5rem',
//     border: '1px solid #fcd34d',
//   },
//   saveBtn: {
//     width: '100%',
//     padding: '0.85rem',
//     backgroundColor: '#10b981',
//     color: 'white',
//     border: 'none',
//     borderRadius: '10px',
//     fontSize: '1.1rem',
//     fontWeight: '600',
//     cursor: 'pointer',
//   },
//   message: {
//     marginTop: '1rem',
//     padding: '0.75rem',
//     borderRadius: '8px',
//     textAlign: 'center',
//     fontWeight: '600',
//   },
//   noHistory: {
//     textAlign: 'center',
//     color: '#64748b',
//     fontStyle: 'italic'
//   },
//   historyItem: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     padding: '0.75rem 0',
//     borderBottom: '1px solid #e2e8f0',
//     fontSize: '0.95rem',
//   },
// };

// export default StudentPaymentForm;

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { endpoints } from '../../config/api';
import BottomTabBar from '../../components/ui/BottomTabBar';

const StudentPaymentForm = () => {
     const navigate = useNavigate();
      const location = useLocation();
  const { studentId } = location.state || {};

  const [student, setStudent] = useState(null);
  const [classFees, setClassFees] = useState({});
  const [transportFees, setTransportFees] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [amountPaid, setAmountPaid] = useState('');
  const [message, setMessage] = useState('');
  // ✅ NEW STATES for printing
  const [lastSavedPayment, setLastSavedPayment] = useState(null); 
  const [showReceipt, setShowReceipt] = useState(false);

  const isMobile = useMemo(() => window.innerWidth <= 768, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // ✅ Utility map for faster month-to-index lookup and sorting
  const monthIndexMap = useMemo(() => {
    return months.reduce((map, month, index) => {
      map[month] = index;
      return map;
    }, {});
  }, [months]);

  useEffect(() => {
    if (!studentId) return navigate('/student-payments');

    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const studentRes = await fetch(`${endpoints.students.list}/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const studentData = await studentRes.json();
        setStudent(studentData);

        const [classFeesRes, transportFeesRes, historyRes] = await Promise.all([
          fetch(endpoints.classFees.list, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(endpoints.transportFees.list, { headers: { Authorization: `Bearer ${token}` } }),
          // Using a higher limit for comprehensive history
          fetch(endpoints.payments.history(studentId, 100), { headers: { Authorization: `Bearer ${token}` } }) 
        ]);

        const classFeesData = await classFeesRes.json();
        const transportFeesData = await transportFeesRes.json();
        const historyData = await historyRes.json();

        const classMap = {};
        classFeesData.forEach(f => classMap[f.className] = f.monthlyFee);
        setClassFees(classMap);

        const transportMap = {};
        transportFeesData.forEach(f => transportMap[f.className] = f.monthlyFee);
        setTransportFees(transportMap);

        setPaymentHistory(historyData);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setMessage('Failed to load data.');
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, navigate]);

// ✅ CORRECTED LOGIC for getBalanceBefore
const getBalanceBefore = (monthIndex, year) => {
  // console.log('🔍 Calculating carried balance for:', months[monthIndex], year);
  if (!paymentHistory.length) {
    // console.log('❌ No payment history');
    return 0;
  }

  const targetDate = new Date(year, monthIndex, 1);
  // console.log('🎯 Target date (Start of Month):', targetDate.toISOString());

  // 1. Sort the history: Newest payment first (descending)
  const sortedHistory = [...paymentHistory].sort((a, b) => {
    // Convert month name to index using the map
    const dateA = new Date(a.year, monthIndexMap[a.month], 1);
    const dateB = new Date(b.year, monthIndexMap[b.month], 1);
    return dateB - dateA; // Newest first
  });

  // 2. Find the first payment in the sorted list whose date is STRICTLY BEFORE the target date
  const latestPreviousPayment = sortedHistory.find(p => {
    const pDate = new Date(p.year, monthIndexMap[p.month], 1);
    // We need the balance after the latest payment that occurred BEFORE the current month.
    return pDate < targetDate; 
  });

  const lastBalance = latestPreviousPayment?.balanceAfter || 0;

  // console.log('🏁 Final carried balance:', lastBalance);
  return lastBalance;
};

const handleSavePayment = async () => {
  const token = localStorage.getItem('token');
  const monthIndex = months.indexOf(selectedMonth);
  if (monthIndex === -1) return setMessage('Please select a valid month.');

  const classFee = classFees[student.class] || 0;
  const transportFee = student.transport ? transportFees[student.class] || 0 : 0;
  const baseDue = classFee + transportFee;

  // ✅ Use the corrected function to get carried balance
  const carriedBalance = getBalanceBefore(monthIndex, selectedYear);

  // ✅ Total due = base + carried balance (can be negative for advance)
  const totalDue = baseDue + carriedBalance;

  const paid = parseFloat(amountPaid) || 0;
  const balanceAfter = totalDue - paid;

  const payload = {
    studentId,
    month: selectedMonth,
    year: selectedYear,
    classFee,
    transportFee: student.transport ? transportFee : 0,
    duesCarriedIn: carriedBalance, // For reference only
    amountPaid: paid,
    balanceAfter
  };

  try {
    const res = await fetch(endpoints.payments.create, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const savedPayment = await res.json(); 
      
      // ✅ SUCCESS LOGIC MODIFIED for printing
      setMessage('Payment saved successfully! Printing receipt...');
      setAmountPaid('');
      setLastSavedPayment(savedPayment.payment); // Assuming your backend returns { payment: {...} }
      
      // Fetch new history
      const histRes = await fetch(endpoints.payments.history(studentId, 100), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newHistory = await histRes.json();
      setPaymentHistory(newHistory);
      
      // Show receipt for printing
      setShowReceipt(true);
    } else {
      const err = await res.json();
      setMessage(err.message || 'Failed to save payment.');
    }
  } catch (err) {
    console.error('Save error:', err);
    setMessage('Network error.');
  }
};

// 🖨️ NEW: Print Receipt Component
const ReceiptToPrint = ({ student, payment, baseDue, classFee, transportFee }) => {
    if (!payment) return null;

    // Split baseDue into components for clean display
    const tuition = classFee;
    const transport = student.transport ? transportFee : 0;
    
    // Calculate Back Dues (Positive carry-in) or Advance (Negative carry-in)
    const backDues = payment.duesCarriedIn > 0 ? payment.duesCarriedIn : 0;
    const advanceCarried = payment.duesCarriedIn < 0 ? Math.abs(payment.duesCarriedIn) : 0;
    
    // Total charges for this month (Base Fees + Back Dues - Advance Carried)
    const totalCharges = baseDue + payment.duesCarriedIn; 

    // Helper to format currency
    const formatCurrency = (amount) => amount.toLocaleString(undefined, { minimumFractionDigits: 2 });

    return (
        <div style={receiptStyles.page}>
            <div style={receiptStyles.header}>
                <h2 style={receiptStyles.schoolName}>AMBIKA INTERNATIONAL SCHOOL</h2>
                <p style={receiptStyles.address}>N.H. -19, MAIN ROAD, SAIDPUR, DIGHWARA, SARAN</p>
                <h3 style={receiptStyles.receiptTitle}>FEE RECEIPT</h3>
            </div>
            
            <div style={receiptStyles.infoRow}>
                <p><strong>Receipt No.:</strong> {payment._id ? payment._id.slice(-6).toUpperCase() : 'N/A'}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
            </div>

            <div style={receiptStyles.infoRow}>
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Father's Name:</strong> {student.fatherName || 'Not Provided'}</p>
            </div>
            <div style={receiptStyles.infoRow}>
                <p><strong>Class:</strong> {student.class} | <strong>Section:</strong> {student.section}</p>
                <p><strong>Month:</strong> {payment.month} {payment.year}</p>
            </div>

            <table style={receiptStyles.table}>
                <thead>
                    <tr>
                        <th style={{ width: '10%' }}>SL No.</th>
                        <th style={{ width: '60%', textAlign: 'left' }}>Particular's</th>
                        <th style={{ width: '30%' }}>Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>1.</td><td style={{ textAlign: 'left' }}>Tution Fee (Monthly)</td><td>{formatCurrency(tuition)}</td></tr>
                    {transport > 0 && <tr><td>2.</td><td style={{ textAlign: 'left' }}>Transport Fee (Monthly)</td><td>{formatCurrency(transport)}</td></tr>}
                    {backDues > 0 && <tr><td>3.</td><td style={{ textAlign: 'left' }}>Back Dues / Carried In (+)</td><td>{formatCurrency(backDues)}</td></tr>}
                    {advanceCarried > 0 && <tr><td>{3 + (backDues > 0 ? 1 : 0)}.</td><td style={{ textAlign: 'left' }}>Advance Carried In (-)</td><td>- {formatCurrency(advanceCarried)}</td></tr>}
                    {/* Add other potential fixed fees here if needed */}
                </tbody>
            </table>
            
            <div style={receiptStyles.summary}>
                <p><strong>TOTAL DUE:</strong> ₹{formatCurrency(totalCharges)}</p>
                <p><strong>PAID:</strong> ₹{formatCurrency(payment.amountPaid || 0)}</p>
                <p style={receiptStyles.finalDues}>
                    **DUES (Balance After Payment):** ₹{formatCurrency(payment.balanceAfter || 0)}
                </p>
            </div>
        </div>
    );
};

// ... (rest of the component's rendering logic)

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (!student) return <div style={styles.center}>Student not found.</div>;

  const classFee = classFees[student.class] || 0;
  const transportFee = student.transport ? transportFees[student.class] || 0 : 0;
  const baseDue = classFee + transportFee;

  // ✅ If showReceipt is TRUE, display the printable component and trigger print
  if (showReceipt) {
        // Trigger print right away
        setTimeout(() => {
            window.print();
            // After printing attempt, close the receipt view
            // setTimeout(() => setShowReceipt(false), 500); // Wait for print dialog to initialize
        }, 500); 

        return (
            <div style={styles.container}>
                <button 
                    onClick={() => { setShowReceipt(false); setMessage(''); }} 
                    style={{ ...styles.backBtn, marginBottom: '20px' }}
                >
                    ← Done Printing / Close Receipt View
                </button>
                <div className="print-area">
                    <ReceiptToPrint 
                        student={student} 
                        payment={lastSavedPayment} 
                        baseDue={baseDue} 
                        classFee={classFee}
                        transportFee={transportFee}
                    />
                </div>
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b' }}>
                    **Note:** This is the receipt view. If the print dialog did not open, click the button above and try again.
                </p>
            </div>
        );
    }
    
  return (
    <div style={{ ...styles.container, paddingBottom: isMobile ? '70px' : '0' }}>
      <header style={styles.header}>
        <h1 style={styles.title}>Record Payment</h1>
        <button onClick={() => navigate('/student-payments')} style={styles.backBtn}>
          ← Back
        </button>
      </header>

      <div style={styles.studentInfo}>
        <h2>{student.name}</h2>
        <p><strong>Class:</strong> {student.class} - {student.section} | Roll: {student.rollNo}</p>
        <p><strong>Class Fee:</strong> ₹{classFee.toLocaleString()}</p>
        {student.transport && <p><strong>Transport Fee:</strong> ₹{transportFee.toLocaleString()}</p>}
      </div>

      <div style={styles.formGroup}>
        <label>Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={styles.select}
        >
          <option value="">Select Month</option>
          {months.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label>Year</label>
        <input
          type="number"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          min="2020"
          max="2030"
          style={styles.input}
        />
      </div>

    {selectedMonth && (
  <>
    <div style={styles.dueCard}>
      <p><strong>Base Due:</strong> ₹{baseDue.toLocaleString()}</p>
      
      {/* ✅ Always show carried balance — even if 0 */}
      <p><strong>Carried Balance:</strong> ₹{getBalanceBefore(months.indexOf(selectedMonth), selectedYear).toFixed(2)}</p>
      
      <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e74c3c' }}>
        Total Due: ₹{(baseDue + getBalanceBefore(months.indexOf(selectedMonth), selectedYear)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>

    <div style={styles.formGroup}>
      <label>Amount Paid (₹)</label>
      <input
        type="number"
        value={amountPaid}
        onChange={(e) => setAmountPaid(e.target.value)}
        placeholder="0"
        min="0"
        step="any"
        style={styles.input}
      />
    </div>

    <button onClick={handleSavePayment} style={styles.saveBtn}>
      Save Payment
    </button>
  </>
)}

      {message && <p style={{ ...styles.message, color: message.includes('success') ? '#27ae60' : '#e74c3c' }}>{message}</p>}

      {/* Payment History Preview */}
<div style={{ marginTop: '2rem' }}>
  <h3>Recent History</h3>
  {paymentHistory.length === 0 ? (
    <p style={styles.noHistory}>No payment history</p>
  ) : (
    paymentHistory.slice(-3).reverse().map((p, i) => (
      <div key={i} style={styles.historyItem}>
        <span>{p.month} {p.year}</span>
        <span>Paid: ₹{(p.amountPaid || 0).toLocaleString()}</span>
        <span style={{ color: (p.balanceAfter || 0) <= 0 ? '#27ae60' : '#e74c3c' }}>
          Balance: ₹{(p.balanceAfter || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    ))
  )}
</div>

      {isMobile && <BottomTabBar userRole="admin" />}
    </div>
  );
};

// 🖨️ NEW: Receipt Styles for printing
const receiptStyles = {
    page: {
        width: '80mm',
        margin: '0 auto',
        padding: '10px',
        border: '1px solid #000',
        fontFamily: 'sans-serif',
        display: 'block', 
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        '@media print': {
            boxShadow: 'none',
            border: 'none',
        }
    },
    header: {
        textAlign: 'center',
        borderBottom: '1px dashed #000',
        marginBottom: '10px',
    },
    schoolName: {
        fontSize: '14px',
        margin: '0',
    },
    address: {
        fontSize: '10px',
        margin: '2px 0',
    },
    receiptTitle: {
        fontSize: '12px',
        margin: '5px 0',
        fontWeight: 'bold',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        marginBottom: '4px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '11px',
        marginTop: '10px',
        marginBottom: '15px',
        textAlign: 'center',
    },
    summary: {
        textAlign: 'right',
        fontSize: '12px',
        borderTop: '1px dashed #000',
        paddingTop: '5px',
    },
    finalDues: {
        fontWeight: 'bold',
        fontSize: '13px',
    }
};

const styles = {
// ... (Your existing styles here)
// Note: You can reuse existing styles object keys or merge them.
// For brevity, keeping your existing styles as is, and adding print styles separately.
  container: {
    padding: '1.5rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    color: '#1e293b',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
  },
  backBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  studentInfo: {
    backgroundColor: '#dbeafe',
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    borderLeft: '4px solid #3b82f6',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
  },
  dueCard: {
    backgroundColor: '#fff9db',
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    border: '1px solid #fcd34d',
  },
  saveBtn: {
    width: '100%',
    padding: '0.85rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  message: {
    marginTop: '1rem',
    padding: '0.75rem',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '600',
  },
  noHistory: {
    textAlign: 'center',
    color: '#64748b',
    fontStyle: 'italic'
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.95rem',
  },
};

export default StudentPaymentForm;