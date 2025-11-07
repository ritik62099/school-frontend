// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { endpoints } from "../../config/api";

// const months = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December"
// ];

// const StudentPayment = () => {
//   const [students, setStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [paymentHistory, setPaymentHistory] = useState([]);
//   const [showHistory, setShowHistory] = useState(false);
//   const [classFee, setClassFee] = useState(0);
//   const [transportFee, setTransportFee] = useState(0);
//   const [partialPayment, setPartialPayment] = useState("");
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("");
//   const [selectedPaymentMonth, setSelectedPaymentMonth] = useState(months[new Date().getMonth()]);
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const currentMonth = months[new Date().getMonth()];
//   const currentYear = new Date().getFullYear();

//   useEffect(() => {
//     const loadStudents = async () => {
//       try {
//         const res = await fetch(endpoints.students.list, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (res.ok) setStudents(await res.json());
//       } catch (err) {
//         console.error("Failed to load students:", err);
//       }
//     };
//     loadStudents();
//   }, [token]);

//   const handleSelectStudent = async (studentId) => {
//     const student = students.find((s) => s._id === studentId);
//     setSelectedStudent(student);
//     setPaymentHistory([]);
//     setMessage("");
//     setShowHistory(false);
//     setPartialPayment("");
//     setSelectedPaymentMonth(currentMonth);

//     if (!student) return;

//     try {
//       const [feeRes, historyRes] = await Promise.all([
//         fetch(endpoints.classFees.get(student.class), {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         fetch(endpoints.payments.history(student._id), {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       if (feeRes.ok) {
//         const feeData = await feeRes.json();
//         setClassFee(feeData.monthlyFee || 0);
//       }

//       setTransportFee(student.transport ? Number(student.transportFee || 0) : 0);

//       if (historyRes.ok) {
//         const history = await historyRes.json();
//         setPaymentHistory(history);
//       }
//     } catch (err) {
//       console.error("Error fetching payment data:", err);
//     }
//   };

//   const isMonthPaid = (month) =>
//     paymentHistory.some((p) => p.month === month && p.year === currentYear);

//   const handleMarkPaid = async (month) => {
//     if (!selectedStudent) return;

//     const totalMonthly = classFee + transportFee;

//     // Calculate total dues up to this month
//     let carryForward = 0;
//     for (let i = 0; i < months.indexOf(month); i++) {
//       const m = months[i];
//       if (!isMonthPaid(m)) carryForward += totalMonthly;
//     }

//     const totalPayable = totalMonthly + carryForward;
//     const amountPaid = Number(partialPayment || 0);

//     if (amountPaid <= 0) {
//       alert("Please enter a valid payment amount.");
//       return;
//     }

//     const remaining = totalPayable - amountPaid;
//     const payload = {
//       studentId: selectedStudent._id,
//       className: selectedStudent.class,
//       month,
//       year: currentYear,
//       tuitionFee: classFee,
//       transportFee,
//       total: totalPayable,
//       amountPaid,
//       remainingBalance: remaining > 0 ? remaining : 0,
//       date: new Date().toISOString(),
//     };

//     try {
//       const res = await fetch(endpoints.payments.create, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (res.ok) {
//         setMessage(`✅ Payment for ${month} recorded successfully!`);
//         setMessageType("success");
//         setPaymentHistory((prev) => [...prev, payload]);
//         setPartialPayment("");
//       } else {
//         setMessage("❌ Failed to save payment.");
//         setMessageType("error");
//       }
//     } catch (err) {
//       console.error("Payment error:", err);
//       setMessage("❌ Network or server error.");
//       setMessageType("error");
//     }
//   };

//   const handleGenerateDemandBill = () => {
//     if (!selectedStudent) return;

//     const totalMonthly = classFee + transportFee;
//     let unpaidMonths = [];
//     let totalDues = 0;

//     for (let i = 0; i <= new Date().getMonth(); i++) {
//       const monthName = months[i];
//       const isPaid = paymentHistory.some(
//         (p) => p.month === monthName && p.year === currentYear
//       );
//       if (!isPaid) {
//         unpaidMonths.push(monthName);
//         totalDues += totalMonthly;
//       }
//     }

//     const win = window.open("", "_blank");
//     win.document.write(`
//       <html>
//         <head>
//           <title>Demand Bill - ${selectedStudent.name}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 30px; color: #0f172a; }
//             .header { text-align: center; margin-bottom: 1.5rem; }
//             .header h2 { margin: 0; color: #1e293b; }
//             table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
//             td, th { border: 1px solid #ccc; padding: 10px; text-align: left; }
//             .total { font-weight: bold; background: #e2e8f0; }
//             .dues { color: #b91c1c; font-weight: 600; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <h2>🏫 School Fee Demand Bill</h2>
//             <p><em>Generated on ${new Date().toLocaleDateString()}</em></p>
//           </div>

//           <p><strong>Student Name:</strong> ${selectedStudent.name}</p>
//           <p><strong>Class:</strong> ${selectedStudent.class}</p>
//           <p><strong>Session:</strong> ${currentYear}</p>

//           <table>
//             <thead><tr><th>Particulars</th><th>Amount (₹)</th></tr></thead>
//             <tbody>
//               ${
//                 unpaidMonths.length > 0
//                   ? unpaidMonths.map(m => `<tr><td>${m} Fees</td><td>₹${totalMonthly}</td></tr>`).join('')
//                   : `<tr><td>All dues cleared</td><td>₹0</td></tr>`
//               }
//               <tr class="total"><td>Total Payable</td><td>₹${totalDues}</td></tr>
//             </tbody>
//           </table>

//           ${
//             unpaidMonths.length > 0
//               ? `<p class="dues">⚠️ Note: Includes fees for ${unpaidMonths.join(", ")}.</p>`
//               : `<p style="color:green;">✅ All fees paid.</p>`
//           }

//           <p style="margin-top:2rem;">Signature: ___________________________</p>
//         </body>
//       </html>
//     `);
//     win.print();
//   };

//   const printPaymentReceipt = (payment) => {
//     const win = window.open("", "_blank");
//     win.document.write(`
//       <html>
//         <head>
//           <title>Receipt - ${payment.month}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             .receipt { max-width: 600px; margin: auto; }
//             h2 { text-align: center; color: #1e293b; }
//             .row { display: flex; justify-content: space-between; margin: 8px 0; }
//           </style>
//         </head>
//         <body>
//           <div class="receipt">
//             <h2>Payment Receipt</h2>
//             <div class="row"><strong>Student:</strong> ${selectedStudent.name}</div>
//             <div class="row"><strong>Class:</strong> ${selectedStudent.class}</div>
//             <div class="row"><strong>Month:</strong> ${payment.month} ${payment.year}</div>
//             <div class="row"><strong>Tuition Fee:</strong> ₹${payment.tuitionFee || 0}</div>
//             <div class="row"><strong>Transport Fee:</strong> ₹${payment.transportFee || 0}</div>
//             <div class="row"><strong>Amount Paid:</strong> ₹${payment.amountPaid}</div>
//             <div class="row"><strong>Remaining:</strong> ₹${payment.remainingBalance || 0}</div>
//             <div class="row"><strong>Date:</strong> ${new Date(payment.date).toLocaleDateString()}</div>
//             <hr style="margin: 20px 0;" />
//             <p style="text-align: center; color: green;">✅ Official Receipt</p>
//           </div>
//         </body>
//       </html>
//     `);
//     win.print();
//   };

//   return (
//     <div style={styles.page}>
//       <div style={styles.card}>
//         <h2 style={styles.title}>🧾 Student Payment Management</h2>

//         <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
//           ← Back
//         </button>

//         {message && (
//           <div
//             style={{
//               ...styles.message,
//               backgroundColor: messageType === "success" ? "#d1fae5" : "#fee2e2",
//               color: messageType === "success" ? "#065f46" : "#b91c1c",
//             }}
//           >
//             {message}
//           </div>
//         )}

//         <div style={styles.inputGroup}>
//           <label style={styles.label}>Select Student</label>
//           <select
//             onChange={(e) => handleSelectStudent(e.target.value)}
//             value={selectedStudent?._id || ""}
//             style={styles.input}
//           >
//             <option value="">-- Select Student --</option>
//             {students.map((s) => (
//               <option key={s._id} value={s._id}>
//                 {s.name} ({s.class})
//               </option>
//             ))}
//           </select>
//         </div>

//         {selectedStudent && (
//           <>
//             <div style={styles.topSection}>
//               <div style={styles.summaryBox}>
//                 <h3>📅 Select Month to Pay (Current Year)</h3>
//                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
//                   {months.slice(0, new Date().getMonth() + 1).map((month) => {
//                     const paid = isMonthPaid(month);
//                     return (
//                       <button
//                         key={month}
//                         onClick={() => setSelectedPaymentMonth(month)}
//                         disabled={paid}
//                         style={{
//                           padding: '6px 12px',
//                           borderRadius: '6px',
//                           backgroundColor: selectedPaymentMonth === month 
//                             ? '#3b82f6' 
//                             : paid 
//                               ? '#dcfce7' 
//                               : '#fee2e2',
//                           color: selectedPaymentMonth === month 
//                             ? 'white' 
//                             : paid 
//                               ? '#166534' 
//                               : '#b91c1c',
//                           border: '1px solid #cbd5e1',
//                           cursor: paid ? 'not-allowed' : 'pointer',
//                           fontWeight: '500',
//                         }}
//                       >
//                         {month.substring(0, 3)} {paid && '✓'}
//                       </button>
//                     );
//                   })}
//                 </div>

//                 <p><strong>Tuition Fee:</strong> ₹{classFee}</p>
//                 <p><strong>Transport Fee:</strong> ₹{transportFee}</p>

//                 {(() => {
//                   const totalMonthly = classFee + transportFee;
//                   let carryForward = 0;
//                   for (let i = 0; i < months.indexOf(selectedPaymentMonth); i++) {
//                     const m = months[i];
//                     if (!isMonthPaid(m)) carryForward += totalMonthly;
//                   }
//                   const totalPayable = totalMonthly + carryForward;

//                   return (
//                     <>
//                       {carryForward > 0 && (
//                         <p style={{ color: "#b91c1c", fontWeight: '600' }}>
//                           <strong>Previous Dues:</strong> ₹{carryForward}
//                         </p>
//                       )}
//                       <p><strong>Total Payable:</strong> ₹{totalPayable}</p>

//                       {!isMonthPaid(selectedPaymentMonth) && (
//                         <>
//                           <div style={{ marginTop: "1rem" }}>
//                             <label><strong>Enter Amount Paid (₹):</strong></label><br />
//                             <input
//                               type="number"
//                               value={partialPayment}
//                               onChange={(e) => setPartialPayment(e.target.value)}
//                               placeholder="e.g. 1000"
//                               style={{
//                                 padding: "0.5rem",
//                                 width: "80%",
//                                 borderRadius: "6px",
//                                 border: "1px solid #ccc",
//                                 marginTop: "0.3rem",
//                               }}
//                             />
//                           </div>
//                           <button
//                             onClick={() => handleMarkPaid(selectedPaymentMonth)}
//                             style={{ ...styles.payBtn, marginTop: '0.8rem' }}
//                           >
//                             💾 Save Payment for {selectedPaymentMonth}
//                           </button>
//                         </>
//                       )}
//                     </>
//                   );
//                 })()}
//               </div>

//               <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", minWidth: '200px' }}>
//                 <button onClick={handleGenerateDemandBill} style={styles.billBtn}>
//                   🧾 Generate Demand Bill
//                 </button>
//                 <button
//                   onClick={() => setShowHistory(!showHistory)}
//                   style={styles.historyBtn}
//                 >
//                   {showHistory ? "Hide History" : "📜 View Payment History"}
//                 </button>
//               </div>
//             </div>

//             {showHistory && (
//               <div style={{ marginTop: "2rem" }}>
//                 <h3 style={{ color: "#0f172a" }}>📜 Payment History</h3>
//                 {paymentHistory.length === 0 ? (
//                   <p>No payments recorded yet.</p>
//                 ) : (
//                   <table style={styles.table}>
//                     <thead>
//                       <tr>
//                         <th>Month</th>
//                         <th>Paid (₹)</th>
//                         <th>Remaining (₹)</th>
//                         <th>Date</th>
//                         <th>Receipt</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {paymentHistory.map((p, i) => (
//                         <tr key={i}>
//                           <td>{p.month} {p.year}</td>
//                           <td>₹{p.amountPaid || 0}</td>
//                           <td>₹{p.remainingBalance || 0}</td>
//                           <td>{new Date(p.date).toLocaleDateString()}</td>
//                           <td>
//                             <button
//                               onClick={() => printPaymentReceipt(p)}
//                               style={{
//                                 padding: '4px 8px',
//                                 backgroundColor: '#facc15',
//                                 color: '#000',
//                                 border: 'none',
//                                 borderRadius: '4px',
//                                 cursor: 'pointer',
//                                 fontSize: '0.85rem',
//                                 fontWeight: '600',
//                               }}
//                             >
//                               🖨️ Print
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// // 💅 Styles
// const styles = {
//   page: { display: "flex", justifyContent: "center", padding: "2rem 1rem", backgroundColor: "#f8fafc", minHeight: "100vh" },
//   card: { width: "100%", maxWidth: "950px", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: "2rem" },
//   title: { fontSize: "1.8rem", fontWeight: "700", textAlign: "center", color: "#0f172a", marginBottom: "1.5rem" },
//   backBtn: { padding: "0.6rem 1.2rem", backgroundColor: "#64748b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "1rem" },
//   message: { padding: "0.75rem", borderRadius: "8px", fontWeight: "500", marginBottom: "1rem", textAlign: "center" },
//   inputGroup: { marginBottom: "1.5rem" },
//   label: { fontWeight: "600", marginBottom: "0.5rem", display: "block" },
//   input: { width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc" },
//   topSection: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", marginTop: "1rem" },
//   summaryBox: { flex: "1", minWidth: "300px", backgroundColor: "#f0f9ff", borderRadius: "12px", padding: "1.5rem", borderLeft: "5px solid #3b82f6" },
//   historyBtn: { backgroundColor: "#8b5cf6", color: "white", padding: "0.7rem 1.2rem", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
//   table: { width: "100%", borderCollapse: "collapse", marginTop: "1rem" },
//   payBtn: { backgroundColor: "#3b82f6", color: "white", padding: "0.6rem 1.2rem", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
//   billBtn: { backgroundColor: "#facc15", color: "#000", padding: "0.6rem 1.2rem", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
// };

// export default StudentPayment;


// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { endpoints } from "../../config/api";

// const months = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December"
// ];

// const StudentPayment = () => {
//   const [students, setStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [paymentHistory, setPaymentHistory] = useState([]);
//   const [showHistory, setShowHistory] = useState(false);
//   const [classFee, setClassFee] = useState(0);
//   const [transportFee, setTransportFee] = useState(0);
//   const [partialPayment, setPartialPayment] = useState("");
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("");
//   const [selectedPaymentMonth, setSelectedPaymentMonth] = useState(months[new Date().getMonth()]);
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const currentMonth = months[new Date().getMonth()];
//   const currentYear = new Date().getFullYear();
//   const totalMonthly = classFee + transportFee;

//   // 🔹 Helper: Compute carry-forward balance BEFORE the given month
//   const computeCarryForward = (targetMonth) => {
//     if (!selectedStudent) return 0;

//     let cumulativeDue = 0;
//     let cumulativePaid = 0;

//     for (let i = 0; i < months.indexOf(targetMonth); i++) {
//       const m = months[i];
//       cumulativeDue += totalMonthly;
//       const payment = paymentHistory.find(p => p.month === m && p.year === currentYear);
//       if (payment) {
//         cumulativePaid += payment.amountPaid || 0;
//       }
//     }

//     return Math.max(0, cumulativeDue - cumulativePaid);
//   };

//   // 🔹 Helper: Check if a month is fully paid
//   const isMonthFullyPaid = (month) => {
//     const payment = paymentHistory.find(p => p.month === month && p.year === currentYear);
//     const carryForward = computeCarryForward(month);
//     const totalDue = totalMonthly + carryForward;
//     return payment && (payment.amountPaid >= totalDue);
//   };

//   // 🔹 Load students
//   useEffect(() => {
//     const loadStudents = async () => {
//       try {
//         const res = await fetch(endpoints.students.list, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (res.ok) setStudents(await res.json());
//       } catch (err) {
//         console.error("Failed to load students:", err);
//       }
//     };
//     loadStudents();
//   }, [token]);

//   // 🔹 Load student data & payment history
//   const handleSelectStudent = async (studentId) => {
//     const student = students.find((s) => s._id === studentId);
//     setSelectedStudent(student);
//     setPaymentHistory([]);
//     setMessage("");
//     setShowHistory(false);
//     setPartialPayment("");
//     setSelectedPaymentMonth(currentMonth);

//     if (!student) return;

//     try {
//       const [feeRes, historyRes] = await Promise.all([
//         fetch(endpoints.classFees.get(student.class), {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         fetch(endpoints.payments.history(student._id), {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       if (feeRes.ok) {
//         const feeData = await feeRes.json();
//         setClassFee(feeData.monthlyFee || 0);
//       }

//       setTransportFee(student.transport ? Number(student.transportFee || 0) : 0);

//       if (historyRes.ok) {
//         const history = await historyRes.json();
//         setPaymentHistory(history);
//       }
//     } catch (err) {
//       console.error("Error fetching payment data:", err);
//     }
//   };

//   // 🔹 Save payment for selected month
//   const handleMarkPaid = async (month) => {
//     if (!selectedStudent) return;

//     const carryForward = computeCarryForward(month);
//     const totalPayable = totalMonthly + carryForward;
//     const amountPaid = Number(partialPayment) || 0;

//     if (amountPaid <= 0) {
//       alert("Please enter a valid payment amount.");
//       return;
//     }

//     const remainingBalance = Math.max(0, totalPayable - amountPaid);

//     const payload = {
//       studentId: selectedStudent._id,
//       className: selectedStudent.class,
//       month,
//       year: currentYear,
//       tuitionFee: classFee,
//       transportFee,
//       total: totalPayable,
//       amountPaid,
//       remainingBalance,
//       date: new Date().toISOString(),
//     };

//     try {
//       const res = await fetch(endpoints.payments.create, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (res.ok) {
//         setMessage(`✅ Payment for ${month} saved!`);
//         setMessageType("success");
//         setPaymentHistory((prev) => [...prev, payload]);
//         setPartialPayment("");
//       } else {
//         setMessage("❌ Failed to save payment.");
//         setMessageType("error");
//       }
//     } catch (err) {
//       console.error("Payment error:", err);
//       setMessage("❌ Network error.");
//       setMessageType("error");
//     }
//   };

//   // 🔹 Generate detailed demand bill
//   const handleGenerateDemandBill = () => {
//     if (!selectedStudent) return;

//     const cumulativeData = [];
//     let cumulativeDue = 0;
//     let cumulativePaid = 0;

//     for (let i = 0; i <= new Date().getMonth(); i++) {
//       const m = months[i];
//       cumulativeDue += totalMonthly;
//       const payment = paymentHistory.find(p => p.month === m && p.year === currentYear);
//       const paid = payment ? payment.amountPaid || 0 : 0;
//       cumulativePaid += paid;

//       cumulativeData.push({ month: m, paid });
//     }

//     const totalPending = cumulativeDue - cumulativePaid;
//     const win = window.open("", "_blank");

//     win.document.write(`
//       <html>
//         <head>
//           <title>Demand Bill - ${selectedStudent.name}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 30px; color: #0f172a; }
//             .header { text-align: center; margin-bottom: 1.5rem; }
//             table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
//             th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
//             .pending { color: #b91c1c; font-weight: bold; }
//             .total-row { background: #f1f5f9; font-weight: bold; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <h2>🏫 School Fee Demand Bill</h2>
//             <p><em>Generated on ${new Date().toLocaleDateString()}</em></p>
//           </div>
//           <p><strong>Student:</strong> ${selectedStudent.name} | <strong>Class:</strong> ${selectedStudent.class} | <strong>Year:</strong> ${currentYear}</p>

//           <table>
//             <thead>
//               <tr>
//                 <th>Month</th>
//                 <th>Due (₹)</th>
//                 <th>Paid (₹)</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${cumulativeData.map(r => `
//                 <tr>
//                   <td>${r.month}</td>
//                   <td>₹${totalMonthly}</td>
//                   <td>₹${r.paid}</td>
//                   <td>${r.paid >= totalMonthly ? '✅ Paid' : `<span class="pending">❌ Pending</span>`}</td>
//                 </tr>
//               `).join('')}
//               <tr class="total-row">
//                 <td><strong>Total</strong></td>
//                 <td><strong>₹${cumulativeDue}</strong></td>
//                 <td><strong>₹${cumulativePaid}</strong></td>
//                 <td><strong>${totalPending > 0 ? `<span class="pending">₹${totalPending} Pending</span>` : '✅ Settled'}</strong></td>
//               </tr>
//             </tbody>
//           </table>

//           ${totalPending > 0 ? `<p class="pending" style="margin-top:1rem;">⚠️ Please clear all pending dues.</p>` : ''}

//           <p style="margin-top:2rem;">Signature: ___________________________</p>
//         </body>
//       </html>
//     `);
//     win.print();
//   };

//   // 🔹 Print individual receipt
//   const printPaymentReceipt = (payment) => {
//     const win = window.open("", "_blank");
//     win.document.write(`
//       <html>
//         <head>
//           <title>Receipt - ${payment.month}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             .receipt { max-width: 600px; margin: auto; }
//             h2 { text-align: center; color: #1e293b; }
//             .row { display: flex; justify-content: space-between; margin: 8px 0; }
//           </style>
//         </head>
//         <body>
//           <div class="receipt">
//             <h2>Payment Receipt</h2>
//             <div class="row"><strong>Student:</strong> ${selectedStudent.name}</div>
//             <div class="row"><strong>Class:</strong> ${selectedStudent.class}</div>
//             <div class="row"><strong>Month:</strong> ${payment.month} ${payment.year}</div>
//             <div class="row"><strong>Tuition Fee:</strong> ₹${payment.tuitionFee || 0}</div>
//             <div class="row"><strong>Transport Fee:</strong> ₹${payment.transportFee || 0}</div>
//             <div class="row"><strong>Total Due:</strong> ₹${payment.total || 0}</div>
//             <div class="row"><strong>Amount Paid:</strong> ₹${payment.amountPaid}</div>
//             <div class="row"><strong>Remaining Balance:</strong> ₹${payment.remainingBalance || 0}</div>
//             <div class="row"><strong>Date:</strong> ${new Date(payment.date).toLocaleDateString()}</div>
//             <hr style="margin: 20px 0;" />
//             <p style="text-align: center; color: green;">✅ Official Receipt</p>
//           </div>
//         </body>
//       </html>
//     `);
//     win.print();
//   };

//   return (
//     <div style={styles.page}>
//       <div style={styles.card}>
//         <h2 style={styles.title}>🧾 Student Payment Management</h2>

//         <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
//           ← Back
//         </button>

//         {message && (
//           <div
//             style={{
//               ...styles.message,
//               backgroundColor: messageType === "success" ? "#d1fae5" : "#fee2e2",
//               color: messageType === "success" ? "#065f46" : "#b91c1c",
//             }}
//           >
//             {message}
//           </div>
//         )}

//         <div style={styles.inputGroup}>
//           <label style={styles.label}>Select Student</label>
//           <select
//             onChange={(e) => handleSelectStudent(e.target.value)}
//             value={selectedStudent?._id || ""}
//             style={styles.input}
//           >
//             <option value="">-- Select Student --</option>
//             {students.map((s) => (
//               <option key={s._id} value={s._id}>
//                 {s.name} ({s.class})
//               </option>
//             ))}
//           </select>
//         </div>

//         {selectedStudent && (
//           <>
//             <div style={styles.topSection}>
//               <div style={styles.summaryBox}>
//                 <h3>📅 Select Month to Pay ({currentYear})</h3>
//                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
//                   {months.slice(0, new Date().getMonth() + 1).map((month) => {
//                     const paid = isMonthFullyPaid(month);
//                     return (
//                       <button
//                         key={month}
//                         onClick={() => setSelectedPaymentMonth(month)}
//                         disabled={paid}
//                         style={{
//                           padding: '6px 12px',
//                           borderRadius: '6px',
//                           backgroundColor: selectedPaymentMonth === month
//                             ? '#3b82f6'
//                             : paid
//                               ? '#dcfce7'
//                               : '#fee2e2',
//                           color: selectedPaymentMonth === month
//                             ? 'white'
//                             : paid
//                               ? '#166534'
//                               : '#b91c1c',
//                           border: '1px solid #cbd5e1',
//                           cursor: paid ? 'not-allowed' : 'pointer',
//                           fontWeight: '500',
//                         }}
//                       >
//                         {month.substring(0, 3)} {paid && '✓'}
//                       </button>
//                     );
//                   })}
//                 </div>

//                 <p><strong>Monthly Tuition Fee:</strong> ₹{classFee}</p>
//                 <p><strong>Monthly Transport Fee:</strong> ₹{transportFee}</p>

//                 {(() => {
//                   const carryForward = computeCarryForward(selectedPaymentMonth);
//                   const totalPayable = totalMonthly + carryForward;

//                   return (
//                     <>
//                       {carryForward > 0 && (
//                         <p style={{ color: "#b91c1c", fontWeight: '600' }}>
//                           <strong>Carry-Forward Balance:</strong> ₹{carryForward}
//                         </p>
//                       )}
//                       <p><strong>Total Payable for {selectedPaymentMonth}:</strong> ₹{totalPayable}</p>

//                       {!isMonthFullyPaid(selectedPaymentMonth) && (
//                         <>
//                           <div style={{ marginTop: "1rem" }}>
//                             <label><strong>Enter Amount Paid (₹):</strong></label><br />
//                             <input
//                               type="number"
//                               value={partialPayment}
//                               onChange={(e) => setPartialPayment(e.target.value)}
//                               placeholder={`e.g. ${totalPayable}`}
//                               style={{
//                                 padding: "0.5rem",
//                                 width: "80%",
//                                 borderRadius: "6px",
//                                 border: "1px solid #ccc",
//                                 marginTop: "0.3rem",
//                               }}
//                             />
//                           </div>
//                           <button
//                             onClick={() => handleMarkPaid(selectedPaymentMonth)}
//                             style={{ ...styles.payBtn, marginTop: '0.8rem' }}
//                           >
//                             💾 Save Payment
//                           </button>
//                         </>
//                       )}
//                     </>
//                   );
//                 })()}
//               </div>

//               <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", minWidth: '200px' }}>
//                 <button onClick={handleGenerateDemandBill} style={styles.billBtn}>
//                   🧾 Generate Demand Bill
//                 </button>
//                 <button
//                   onClick={() => setShowHistory(!showHistory)}
//                   style={styles.historyBtn}
//                 >
//                   {showHistory ? "Hide History" : "📜 View Payment History"}
//                 </button>
//               </div>
//             </div>

//             {showHistory && (
//               <div style={{ marginTop: "2rem" }}>
//                 <h3 style={{ color: "#0f172a" }}>📜 Payment History</h3>
//                 {paymentHistory.length === 0 ? (
//                   <p>No payments recorded yet.</p>
//                 ) : (
//                   <table style={styles.table}>
//                     <thead>
//                       <tr>
//                         <th>Month</th>
//                         <th>Due (₹)</th>
//                         <th>Paid (₹)</th>
//                         <th>Remaining (₹)</th>
//                         <th>Date</th>
//                         <th>Receipt</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {paymentHistory.map((p, i) => (
//                         <tr key={i}>
//                           <td>{p.month} {p.year}</td>
//                           <td>₹{p.total || 0}</td>
//                           <td>₹{p.amountPaid || 0}</td>
//                           <td>₹{p.remainingBalance || 0}</td>
//                           <td>{new Date(p.date).toLocaleDateString()}</td>
//                           <td>
//                             <button
//                               onClick={() => printPaymentReceipt(p)}
//                               style={{
//                                 padding: '4px 8px',
//                                 backgroundColor: '#facc15',
//                                 color: '#000',
//                                 border: 'none',
//                                 borderRadius: '4px',
//                                 cursor: 'pointer',
//                                 fontSize: '0.85rem',
//                                 fontWeight: '600',
//                               }}
//                             >
//                               🖨️ Print
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// // 💅 Styles (Internal CSS — as requested)
// const styles = {
//   page: { display: "flex", justifyContent: "center", padding: "2rem 1rem", backgroundColor: "#f8fafc", minHeight: "100vh" },
//   card: { width: "100%", maxWidth: "950px", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: "2rem" },
//   title: { fontSize: "1.8rem", fontWeight: "700", textAlign: "center", color: "#0f172a", marginBottom: "1.5rem" },
//   backBtn: { padding: "0.6rem 1.2rem", backgroundColor: "#64748b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "1rem" },
//   message: { padding: "0.75rem", borderRadius: "8px", fontWeight: "500", marginBottom: "1rem", textAlign: "center" },
//   inputGroup: { marginBottom: "1.5rem" },
//   label: { fontWeight: "600", marginBottom: "0.5rem", display: "block" },
//   input: { width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc" },
//   topSection: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", marginTop: "1rem" },
//   summaryBox: { flex: "1", minWidth: "300px", backgroundColor: "#f0f9ff", borderRadius: "12px", padding: "1.5rem", borderLeft: "5px solid #3b82f6" },
//   historyBtn: { backgroundColor: "#8b5cf6", color: "white", padding: "0.7rem 1.2rem", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
//   table: { width: "100%", borderCollapse: "collapse", marginTop: "1rem" },
//   payBtn: { backgroundColor: "#3b82f6", color: "white", padding: "0.6rem 1.2rem", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
//   billBtn: { backgroundColor: "#facc15", color: "#000", padding: "0.6rem 1.2rem", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
// };

// export default StudentPayment;





import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../config/api";
import logoUrl from "../../assets/logo.png";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const StudentPayment = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [classFee, setClassFee] = useState(0);
  const [transportFee, setTransportFee] = useState(0);
  const [partialPayment, setPartialPayment] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedPaymentMonth, setSelectedPaymentMonth] = useState(months[new Date().getMonth()]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const currentMonth = months[new Date().getMonth()];
  const currentYear = new Date().getFullYear();
  const totalMonthly = classFee + transportFee;

  // 🔹 Helper: Compute carry-forward balance BEFORE the given month
  const computeCarryForward = (targetMonth) => {
    if (!selectedStudent) return 0;

    let cumulativeDue = 0;
    let cumulativePaid = 0;

    for (let i = 0; i < months.indexOf(targetMonth); i++) {
      const m = months[i];
      cumulativeDue += totalMonthly;
      const payment = paymentHistory.find(p => p.month === m && p.year === currentYear);
      if (payment) {
        cumulativePaid += payment.amountPaid || 0;
      }
    }

    return Math.max(0, cumulativeDue - cumulativePaid);
  };

  // 🔹 Helper: Check if a month is fully paid
  const isMonthFullyPaid = (month) => {
    const payment = paymentHistory.find(p => p.month === month && p.year === currentYear);
    const carryForward = computeCarryForward(month);
    const totalDue = totalMonthly + carryForward;
    return payment && (payment.amountPaid >= totalDue);
  };

  // 🔹 Load students
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await fetch(endpoints.students.list, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setStudents(await res.json());
      } catch (err) {
        console.error("Failed to load students:", err);
      }
    };
    loadStudents();
  }, [token]);

  // 🔹 Load student data & payment history
  const handleSelectStudent = async (studentId) => {
    const student = students.find((s) => s._id === studentId);
    setSelectedStudent(student);
    setPaymentHistory([]);
    setMessage("");
    setShowHistory(false);
    setPartialPayment("");
    setSelectedPaymentMonth(currentMonth);

    if (!student) return;

    try {
      const [feeRes, historyRes] = await Promise.all([
        fetch(endpoints.classFees.get(student.class), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(endpoints.payments.history(student._id), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (feeRes.ok) {
        const feeData = await feeRes.json();
        setClassFee(feeData.monthlyFee || 0);
      }

      setTransportFee(student.transport ? Number(student.transportFee || 0) : 0);

      if (historyRes.ok) {
        const history = await historyRes.json();
        setPaymentHistory(history);
      }
    } catch (err) {
      console.error("Error fetching payment data:", err);
    }
  };

  // 🔹 Save payment for selected month
  const handleMarkPaid = async (month) => {
    if (!selectedStudent) return;

    const carryForward = computeCarryForward(month);
    const totalPayable = totalMonthly + carryForward;
    const amountPaid = Number(partialPayment) || 0;

    if (amountPaid <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const remainingBalance = Math.max(0, totalPayable - amountPaid);

    const payload = {
      studentId: selectedStudent._id,
      className: selectedStudent.class,
      month,
      year: currentYear,
      tuitionFee: classFee,
      transportFee,
      total: totalPayable,
      amountPaid,
      remainingBalance,
      date: new Date().toISOString(),
    };

    try {
      const res = await fetch(endpoints.payments.create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage(`✅ Payment for ${month} saved!`);
        setMessageType("success");
        setPaymentHistory((prev) => [...prev, payload]);
        setPartialPayment("");
      } else {
        setMessage("❌ Failed to save payment.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setMessage("❌ Network error.");
      setMessageType("error");
    }
  };

  
const handleGenerateDemandBill = () => {
  if (!selectedStudent) return;

  const totalMonthly = classFee + transportFee;
  let totalPendingDues = 0;

  // Calculate total pending dues from Jan to current month
  for (let i = 0; i <= new Date().getMonth(); i++) {
    const monthName = months[i];
    const carry = computeCarryForward(monthName);
    const totalDue = totalMonthly + carry;
    const payment = paymentHistory.find(p => p.month === monthName && p.year === currentYear);
    const paid = payment ? payment.amountPaid || 0 : 0;
    if (paid < totalDue) {
      totalPendingDues += (totalDue - paid);
    }
  }

  const currentMonthName = months[new Date().getMonth()];
  const grandTotal = totalMonthly + totalPendingDues;

  const win = window.open("", "_blank");

  win.document.write(`
    <html>
      <head>
        <title>Demand Bill - ${selectedStudent.name}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 30px; 
            color: #222; 
            max-width: 700px; 
            margin: auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #0056b3;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
            .logo {
            height: 60px;
            margin-right: 15px;
            // border: 1px solid #ddd;
            padding: 5px;
            background: white;
          }
          .school-name {
            font-size: 24px;
            font-weight: bold;
            color: #0056b3;
            margin: 0;
          }
          .address {
            font-size: 14px;
            color: #555;
            margin: 5px 0;
          }
          .bill-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
            color: #0f172a;
          }
          .student-info {
            margin-bottom: 20px;
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f1f5f9;
            font-weight: bold;
          }
          .total-row {
            background-color: #eff6ff;
            font-weight: bold;
          }
          .pending {
            color: #b91c1c;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: right;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
        <img src="/logo.png" alt="Ambica International School Logo" class="logo" />
          <h1 class="school-name">AMBICA INTERNATIONAL SCHOOL</h1>
          <p class="address">N.H -19, Main Road, Saidpur Dighwara, Saran</p>
        </div>

        <h2 class="bill-title">FEE DEMAND BILL</h2>

        <div class="student-info">
          <p><strong>Student:</strong> ${selectedStudent.name}</p>
          <p><strong>Class:</strong> ${selectedStudent.class}</p>
          <p><strong>Month:</strong> ${currentMonthName} ${currentYear}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <table>
          <tbody>
            <tr>
              <td>Tuition Fee (${currentMonthName})</td>
              <td>₹${classFee}</td>
            </tr>
            <tr>
              <td>Transport Fee (${currentMonthName})</td>
              <td>₹${transportFee}</td>
            </tr>
            <tr>
              <td>Previous Dues</td>
              <td>₹${totalPendingDues}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Total Payable</strong></td>
              <td><strong>₹${grandTotal}</strong></td>
            </tr>
          </tbody>
        </table>

        ${totalPendingDues > 0 
          ? `<p class="pending" style="text-align:center; margin-top:15px;">⚠️ Please clear all pending dues.</p>` 
          : `<p style="text-align:center; color:green; margin-top:15px;">✅ All dues cleared.</p>`
        }

        <div class="footer">
          Signature: ___________________
        </div>
      </body>
    </html>
  `);
  win.print();
};

  const printPaymentReceipt = (payment) => {
  const win = window.open("", "_blank");
  const student = selectedStudent;

  win.document.write(`
    <html>
      <head>
        <title>Payment Receipt - ${student.name}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 30px; 
            color: #222; 
            max-width: 800px; 
            margin: auto;
          }
          .header {
            display: flex;
            align-items: center;
            border-bottom: 2px solid #0056b3;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .logo {
            height: 60px;
            margin-right: 15px;
            // border: 1px solid #ddd;
            padding: 5px;
            background: white;
          }
          .school-info {
            text-align: left;
          }
          .school-name {
            font-size: 24px;
            font-weight: bold;
            color: #0056b3;
            margin: 0;
          }
          .address {
            font-size: 14px;
            color: #555;
            margin: 5px 0;
          }
          .receipt-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin: 20px 0;
          }
          .info-label {
            font-weight: bold;
            color: #333;
          }
          .info-value {
            color: #222;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .items-table th, .items-table td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          .items-table th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .payment-mode {
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            padding: 10px;
            background: #e9f7fe;
            border: 1px dashed #0056b3;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #aaa;
            font-size: 14px;
          }
          .stamp-box {
            border: 2px dashed #888;
            width: 120px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #888;
          }
          @media print {
            body { padding: 10px; }
            .stamp-box { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <!-- ✅ LOGO: Use absolute path from /public -->
          <img src="/logo.png" alt="Ambica International School Logo" class="logo" />
          <div class="school-info">
            <h1 class="school-name">AMBICA INTERNATIONAL SCHOOL</h1>
            <p class="address">N.H -19, Main Road, Saidpur Dighwara, Saran</p>
          </div>
        </div>

        <h2 class="receipt-title">SCHOOL FEES RECEIPT</h2>

        <div class="info-grid">
          <div><span class="info-label">Pupil's Name:</span> <span class="info-value">${student.name}</span></div>
          <div><span class="info-label">Grade:</span> <span class="info-value">${student.class}</span></div>
          <div><span class="info-label">Admission No:</span> <span class="info-value">${student.admissionNo || "N/A"}</span></div>
          <div><span class="info-label">Date:</span> <span class="info-value">${new Date(payment.date).toLocaleDateString()}</span></div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Tuition Fee</td><td>₹${payment.tuitionFee || 0}</td></tr>
            <tr><td>Transport Fee</td><td>₹${payment.transportFee || 0}</td></tr>
            <tr><td>Total Due</td><td>₹${payment.total || 0}</td></tr>
            <tr><td>Amount Paid</td><td>₹${payment.amountPaid || 0}</td></tr>
            <tr><td>Remaining Balance</td><td>₹${payment.remainingBalance || 0}</td></tr>
          </tbody>
        </table>

        <div class="payment-mode">
          Payment Mode: Cash | Cheque | Direct Deposit
        </div>

        <div class="footer">
          <div>
            <strong>Balance:</strong> ₹${payment.remainingBalance || 0}
          </div>
          <div class="stamp-box">
            SCHOOL STAMP
          </div>
        </div>
      </body>
    </html>
  `);
  win.print();
};

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🧾 Student Payment Management</h2>

        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Back
        </button>

        {message && (
          <div
            style={{
              ...styles.message,
              backgroundColor: messageType === "success" ? "#d1fae5" : "#fee2e2",
              color: messageType === "success" ? "#065f46" : "#b91c1c",
            }}
          >
            {message}
          </div>
        )}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Select Student</label>
          <select
            onChange={(e) => handleSelectStudent(e.target.value)}
            value={selectedStudent?._id || ""}
            style={styles.input}
          >
            <option value="">-- Select Student --</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.class})
              </option>
            ))}
          </select>
        </div>

        {selectedStudent && (
          <>
            <div style={styles.topSection}>
              <div style={styles.summaryBox}>
                <h3>📅 Select Month to Pay ({currentYear})</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
                  {months.slice(0, new Date().getMonth() + 1).map((month) => {
                    const paid = isMonthFullyPaid(month);
                    return (
                      <button
                        key={month}
                        onClick={() => setSelectedPaymentMonth(month)}
                        disabled={paid}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: selectedPaymentMonth === month
                            ? '#3b82f6'
                            : paid
                              ? '#dcfce7'
                              : '#fee2e2',
                          color: selectedPaymentMonth === month
                            ? 'white'
                            : paid
                              ? '#166534'
                              : '#b91c1c',
                          border: '1px solid #cbd5e1',
                          cursor: paid ? 'not-allowed' : 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        {month.substring(0, 3)} {paid && '✓'}
                      </button>
                    );
                  })}
                </div>

                <p><strong>Monthly Tuition Fee:</strong> ₹{classFee}</p>
                <p><strong>Monthly Transport Fee:</strong> ₹{transportFee}</p>

                {(() => {
                  const carryForward = computeCarryForward(selectedPaymentMonth);
                  const totalPayable = totalMonthly + carryForward;

                  return (
                    <>
                      {carryForward > 0 && (
                        <p style={{ color: "#b91c1c", fontWeight: '600' }}>
                          <strong>Carry-Forward Balance:</strong> ₹{carryForward}
                        </p>
                      )}
                      <p><strong>Total Payable for {selectedPaymentMonth}:</strong> ₹{totalPayable}</p>

                      {!isMonthFullyPaid(selectedPaymentMonth) && (
                        <>
                          <div style={{ marginTop: "1rem" }}>
                            <label><strong>Enter Amount Paid (₹):</strong></label><br />
                            <input
                              type="number"
                              value={partialPayment}
                              onChange={(e) => setPartialPayment(e.target.value)}
                              placeholder={`e.g. ${totalPayable}`}
                              style={{
                                padding: "0.5rem",
                                width: "80%",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                marginTop: "0.3rem",
                              }}
                            />
                          </div>
                          <button
                            onClick={() => handleMarkPaid(selectedPaymentMonth)}
                            style={{ ...styles.payBtn, marginTop: '0.8rem' }}
                          >
                            💾 Save Payment
                          </button>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", minWidth: '200px' }}>
                <button onClick={handleGenerateDemandBill} style={styles.billBtn}>
                  🧾 Generate Demand Bill
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  style={styles.historyBtn}
                >
                  {showHistory ? "Hide History" : "📜 View Payment History"}
                </button>
              </div>
            </div>

            {showHistory && (
              <div style={{ marginTop: "2rem" }}>
                <h3 style={{ color: "#0f172a" }}>📜 Payment History</h3>
                {paymentHistory.length === 0 ? (
                  <p>No payments recorded yet.</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Due (₹)</th>
                        <th>Paid (₹)</th>
                        <th>Remaining (₹)</th>
                        <th>Date</th>
                        <th>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((p, i) => (
                        <tr key={i}>
                          <td>{p.month} {p.year}</td>
                          <td>₹{p.total || 0}</td>
                          <td>₹{p.amountPaid || 0}</td>
                          <td>₹{p.remainingBalance || 0}</td>
                          <td>{new Date(p.date).toLocaleDateString()}</td>
                          <td>
                            <button
                              onClick={() => printPaymentReceipt(p)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#facc15',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                              }}
                            >
                              🖨️ Print
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// 💅 Styles (Internal CSS — as requested)
const styles = {
  page: { display: "flex", justifyContent: "center", padding: "2rem 1rem", backgroundColor: "#f8fafc", minHeight: "100vh" },
  card: { width: "100%", maxWidth: "950px", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: "2rem" },
  title: { fontSize: "1.8rem", fontWeight: "700", textAlign: "center", color: "#0f172a", marginBottom: "1.5rem" },
  backBtn: { padding: "0.6rem 1.2rem", backgroundColor: "#64748b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "1rem" },
  message: { padding: "0.75rem", borderRadius: "8px", fontWeight: "500", marginBottom: "1rem", textAlign: "center" },
  inputGroup: { marginBottom: "1.5rem" },
  label: { fontWeight: "600", marginBottom: "0.5rem", display: "block" },
  input: { width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc" },
  topSection: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", marginTop: "1rem" },
  summaryBox: { flex: "1", minWidth: "300px", backgroundColor: "#f0f9ff", borderRadius: "12px", padding: "1.5rem", borderLeft: "5px solid #3b82f6" },
  historyBtn: { backgroundColor: "#8b5cf6", color: "white", padding: "0.7rem 1.2rem", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "1rem" },
  payBtn: { backgroundColor: "#3b82f6", color: "white", padding: "0.6rem 1.2rem", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
  billBtn: { backgroundColor: "#facc15", color: "#000", padding: "0.6rem 1.2rem", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
};

export default StudentPayment;