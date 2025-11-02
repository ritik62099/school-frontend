import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';
import BottomTabBar from '../../components/ui/BottomTabBar';
import Logo from "../../assets/logo.png";
// 🖨️ Reusable Receipt Component (Unchanged)
const ReceiptToPrint = ({ student, payment, classFee, transportFee }) => {
    if (!payment) return null;

    // Calculate Back Dues or Advance
    const backDues = payment.duesCarriedIn > 0 ? payment.duesCarriedIn : 0;
    const advanceCarried = payment.duesCarriedIn < 0 ? Math.abs(payment.duesCarriedIn) : 0;

    // Format currency
    const formatCurrency = (amount) => (amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

    // Define all fee types as per physical receipt
    const fees = [
        { name: 'Tution Fee', amount: classFee },
        { name: 'Transport Fee', amount: student.transport ? transportFee : 0 },
        { name: 'Registration Fee', amount: 0 }, // Not in DB, but on paper
        { name: 'Admission Fee', amount: 0 },
        { name: 'Annual Fee', amount: 0 },
        { name: 'Back Dues', amount: backDues },
        { name: 'Late Fine', amount: 0 },
        { name: 'Others', amount: 0 }
    ];

    // Total Calculation
    const totalCharges = fees.reduce((sum, f) => sum + f.amount, 0);
    const paidAmount = payment.amountPaid;
    const dues = totalCharges - paidAmount; // Balance after payment

    return (
        <div style={receiptStyles.page}>
            {/* Header with Logo & School Info */}
            <div style={receiptStyles.header}>
                <div style={receiptStyles.logoRow}>
                    <img src={Logo} alt="School Logo" style={receiptStyles.logo} />
                    <div>
                        <h2 style={receiptStyles.schoolName}>AMBIKA INTERNATIONAL SCHOOL</h2>
                        <p style={receiptStyles.address}>N.H. -19, MAIN ROAD, SAIDPUR, DIGHWARA, SARAN</p>
                    </div>
                </div>
                <div style={receiptStyles.contactRow}>
                    <span>Reg. No. 21912662021926123218</span>
                    <span style={receiptStyles.phone}>📞 7979876289</span>
                </div>
            </div>

            {/* Receipt No. and Date */}
            <div style={receiptStyles.infoRow}>
                <div style={receiptStyles.field}>
                    <strong>Receipt No.</strong>
                    <span style={receiptStyles.value}>{payment._id?.slice(-6).toUpperCase() || 'N/A'}</span>
                </div>
                <div style={receiptStyles.field}>
                    <strong>Date</strong>
                    <span style={receiptStyles.value}>{new Date(payment.updatedAt).toLocaleDateString('en-IN')}</span>
                </div>
            </div>

            {/* Student Info */}
            <div style={receiptStyles.infoRow}>
                <div style={receiptStyles.field}>
                    <strong>Name</strong>
                    <span style={receiptStyles.value}>{student.name}</span>
                </div>
                <div style={receiptStyles.field}>
                    <strong>Father's Name</strong>
                    <span style={receiptStyles.value}>{student.fatherName || 'Not Provided'}</span>
                </div>
            </div>
            <div style={receiptStyles.infoRow}>
                <div style={receiptStyles.field}>
                    <strong>Class</strong>
                    <span style={receiptStyles.value}>{student.class}</span>
                </div>
                <div style={receiptStyles.field}>
                    <strong>Section</strong>
                    <span style={receiptStyles.value}>{student.section}</span>
                </div>
                <div style={receiptStyles.field}>
                    <strong>Month</strong>
                    <span style={receiptStyles.value}>{payment.month} {payment.year}</span>
                </div>
            </div>

            {/* Main Table */}
            <table style={receiptStyles.table}>
                <thead>
                    <tr>
                        <th style={receiptStyles.th}>SL<br/>No.</th>
                        <th style={receiptStyles.th}>Particular's</th>
                        <th style={receiptStyles.th}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {fees.map((fee, index) => (
                        <tr key={index}>
                            <td style={receiptStyles.td}>{index + 1}.</td>
                            <td style={receiptStyles.tdLeft}>{fee.name}</td>
                            <td style={receiptStyles.tdRight}>{formatCurrency(fee.amount)}</td>
                        </tr>
                    ))}
                    {/* Total Row */}
                    <tr>
                        <td colSpan="2" style={{ ...receiptStyles.td, textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                        <td style={receiptStyles.tdRight}>{formatCurrency(totalCharges)}</td>
                    </tr>
                    <tr>
                        <td colSpan="2" style={{ ...receiptStyles.td, textAlign: 'right', fontWeight: 'bold' }}>Paid</td>
                        <td style={receiptStyles.tdRight}>{formatCurrency(paidAmount)}</td>
                    </tr>
                    <tr>
                        <td colSpan="2" style={{ ...receiptStyles.td, textAlign: 'right', fontWeight: 'bold' }}>Dues</td>
                        <td style={receiptStyles.tdRight}>{formatCurrency(dues)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Notes Section */}
            <div style={receiptStyles.notesBox}>
                <div style={receiptStyles.noteHeader}>Note : Fee to be paid latest by 10th of every month.</div>
                <div style={receiptStyles.noteContent}>
                    नोट : 1. प्रत्येक माह का शिक्षण शुल्क दिनांक 10 तक अवश्य जमा करें।<br/>
                    2. दिनांक 10 के बाद जमा होने वाले शुल्क पर 50 रुपया विलम्ब शुल्क ली जाएगी।
                </div>
            </div>
        </div>
    );
};


const StudentPayments = () => {
    const [students, setStudents] = useState([]);
    const [classFees, setClassFees] = useState({});
    const [transportFees, setTransportFees] = useState({});
    const [payments, setPayments] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchClass, setSearchClass] = useState('');
const [searchRoll, setSearchRoll] = useState('');
    
    // States for Printing
    const [receiptToPrint, setReceiptToPrint] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);
    
    const navigate = useNavigate();

    const isMobile = useMemo(() => window.innerWidth <= 768, []);
    
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // --- useEffect for Fetching Data (Unchanged) ---
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const [studentsRes, classFeesRes, transportFeesRes] = await Promise.all([
                    fetch(endpoints.students.list, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(endpoints.classFees.list, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(endpoints.transportFees.list, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                const studentsData = await studentsRes.json();
                const classFeesData = await classFeesRes.json();
                const transportFeesData = await transportFeesRes.json();

                setStudents(studentsData);

                const classFeeMap = {};
                classFeesData.forEach(f => classFeeMap[f.className] = f.monthlyFee);
                setClassFees(classFeeMap);

                const transportFeeMap = {};
                transportFeesData.forEach(f => transportFeeMap[f.className] = f.monthlyFee);
                setTransportFees(transportFeeMap);

                const paymentsMap = {};
                // Fetch history for each student's last payment for list display
                for (const student of studentsData) {
                    // Fetch only the last 1 payment for list view efficiency
                    const histRes = await fetch(endpoints.payments.history(student._id, 1), {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (histRes.ok) {
                        const hist = await histRes.json();
                        paymentsMap[student._id] = hist;
                    }
                }
                setPayments(paymentsMap);
            } catch (err) {
                console.error('Failed to load payment data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 🏆 CORRECTED: useEffect for controlled printing (Runs once when isPrinting is true)
   useEffect(() => {
    if (isPrinting && receiptToPrint) {
        const handleAfterPrint = () => {
            setIsPrinting(false);
            setReceiptToPrint(null);
            window.removeEventListener('afterprint', handleAfterPrint);
        };

        window.addEventListener('afterprint', handleAfterPrint);

        // Allow the print view to render first
        const printTimeout = setTimeout(() => {
            window.print();
        }, 100);

        return () => {
            clearTimeout(printTimeout);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }
}, [isPrinting, receiptToPrint]);

    
    // --- Handlers (Slightly modified to clear receiptToPrint when setting isPrinting) ---
    const handlePrintReceipt = (record) => {
        const student = selectedStudent;
        const classFee = classFees[student.class] || 0;
        const transportFee = student.transport ? transportFees[student.class] || 0 : 0;
        
        setReceiptToPrint({ 
            payment: record,
            student: student,
            baseFeeData: { classFee, transportFee } 
        });
        setIsPrinting(true);
    };


    const handleViewHistory = async (student) => {
        setSelectedStudent(student);
        const token = localStorage.getItem('token');
        // Fetch full history when viewing details
        const histRes = await fetch(endpoints.payments.history(student._id, 100), {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (histRes.ok) {
            const hist = await histRes.json();
            setPaymentHistory(hist);
        }
    };

    const goBack = () => {
        setSelectedStudent(null);
        setPaymentHistory([]);
    };
const filteredStudents = useMemo(() => {
    return students.filter(student => {
        const matchesClass = !searchClass.trim() || 
            student.class.toLowerCase().includes(searchClass.toLowerCase());
        
        const matchesRoll = !searchRoll.trim() || 
            String(student.rollNo).includes(searchRoll.trim());

        return matchesClass && matchesRoll;
    });
}, [students, searchClass, searchRoll]);

    // --- Render functions (Unchanged except for the new Action column) ---
    const renderStudentList = () => (
    <div style={styles.container}>
        <header style={styles.header}>
            <h1 style={styles.title}>Student Payments</h1>
            <button onClick={() => navigate('/')} style={styles.backBtn}>
                ← Back
            </button>
        </header>

        {/* 🔍 Dual Search Inputs: Class & Roll */}
<div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
    <input
        type="text"
        placeholder="Search by Class (e.g., 5, VI)"
        value={searchClass}
        onChange={(e) => setSearchClass(e.target.value)}
        style={{
            flex: 1,
            minWidth: '180px',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '1rem',
            fontFamily: 'inherit'
        }}
    />
    <input
        type="text"
        placeholder="Search by Roll No"
        value={searchRoll}
        onChange={(e) => setSearchRoll(e.target.value)}
        style={{
            flex: 1,
            minWidth: '180px',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '1rem',
            fontFamily: 'inherit'
        }}
    />
</div>

        {loading ? (
            <div style={styles.loading}>Loading students and fee data...</div>
        ) : (
            <div style={styles.studentGrid}>
                {filteredStudents.map((student) => {
                    const classFee = classFees[student.class] || 0;
                    const transportFee = student.transport ? transportFees[student.class] || 0 : 0;
                    const totalDue = classFee + transportFee;

                    const studentPayments = payments[student._id] || [];
                    const lastPayment = studentPayments.length
                        ? studentPayments[studentPayments.length - 1]
                        : null;

                    let balance = 0;
                    if (lastPayment) {
                        balance = lastPayment.balanceAfter || 0;
                    }

                    const isAdvanced = balance <= 0;
                    const statusText = isAdvanced ? 'Paid/Advanced' : 'Has Dues';
                    const statusColor = isAdvanced ? '#27ae60' : '#e74c3c';

                    return (
                        <div key={student._id} style={styles.studentCard}>
                            <h3>{student.name}</h3>
                            
                            {/* 👇 Class & Roll in one clear line */}
                            <p>
                                <strong>Class:</strong> {student.class}-{student.section} | 
                                <strong> Roll:</strong> {student.rollNo}
                            </p>

                            <p><strong>Monthly Due:</strong> ₹{totalDue}</p>
                            <p style={{ color: statusColor }}>
                                <strong>Balance:</strong> ₹{balance.toLocaleString()} <span style={{ fontSize: '0.9em' }}>({statusText})</span>
                            </p>
                            <div style={styles.buttonGroup}>
                                <button
                                    onClick={() => navigate('/record-payment', { state: { studentId: student._id } })}
                                    style={{ ...styles.actionBtn, backgroundColor: '#8b5cf6' }}
                                >
                                    Record Payment
                                </button>
                                <button
                                    onClick={() => handleViewHistory(student)}
                                    style={{ ...styles.actionBtn, backgroundColor: '#10b981' }}
                                >
                                    View History
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {isMobile && <BottomTabBar userRole="admin" />}
    </div>
);

    const renderPaymentHistory = () => {
        const student = selectedStudent;
        if (!student) return null;

        const classFee = classFees[student.class] || 0;
        const transportFee = student.transport ? transportFees[student.class] || 0 : 0;
        const totalDue = classFee + transportFee;

        // Find last month with non-positive balance (fully paid or advanced)
        let advancedTill = null;
        for (let i = paymentHistory.length - 1; i >= 0; i--) {
            const p = paymentHistory[i];
            if (p.balanceAfter <= 0) {
                advancedTill = { month: p.month, year: p.year };
                break;
            }
        }

        return (
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.title}>Payment History</h1>
                    <button onClick={goBack} style={styles.backBtn}>
                        ← Back to List
                    </button>
                </header>

                <div style={styles.historyHeader}>
                    <h2>{student.name}</h2>
                    <p><strong>Class:</strong> {student.class} - {student.section} | Roll: {student.rollNo}</p>
                    <p><strong>Monthly Fee:</strong> ₹{classFee}</p>
                    {student.transport && <p><strong>Transport Fee:</strong> ₹{transportFee}</p>}
                    <p><strong>Total Monthly Due:</strong> ₹{totalDue}</p>
                    
                    {advancedTill && (
                        <div style={styles.advanceBadge}>
                            💰 <strong>Advance covers up to {advancedTill.month} {advancedTill.year}</strong>
                        </div>
                    )}
                </div>

                {paymentHistory.length === 0 ? (
                    <p style={styles.noData}>No payment records found.</p>
                ) : (
                    <div style={styles.historyTable}>
                        <div style={styles.tableHeader}>
                            <div>Month</div>
                            <div>Paid (₹)</div>
                            <div>Carried In (₹)</div>
                            <div>Balance After (₹)</div>
                            <div>Status</div>
                            <div>Action</div>
                        </div>
                        {paymentHistory.map((record, i) => {
                            const isPaid = record.balanceAfter <= 0;
                            return (
                                <div key={i} style={styles.tableRow}>
                                    <div>{record.month} {record.year}</div>
                                    <div>{(record.amountPaid || 0).toLocaleString()}</div>
                                    <div>{(record.duesCarriedIn || 0).toLocaleString()}</div>
                                    <div style={{ color: isPaid ? '#27ae60' : '#e74c3c' }}>
                                        {record.balanceAfter.toLocaleString()}
                                    </div>
                                    <div>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '20px',
                                            backgroundColor: isPaid ? '#dcfce7' : '#fee2e2',
                                            color: isPaid ? '#166534' : '#b91c1c',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            display: 'inline-block'
                                        }}>
                                            {isPaid ? 'Paid' : 'Due'}
                                        </span>
                                    </div>
                                    <div>
                                        <button 
                                            onClick={() => handlePrintReceipt(record)}
                                            style={styles.printActionBtn} 
                                            disabled={isPrinting}
                                        >
                                            Print 🖨️
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {isMobile && <BottomTabBar userRole="admin" />}
            </div>
        );
    };
    
    // 🖨️ Handle Print View Rendering - Only renders the receipt component
   // 🖨️ Print View: Original + Duplicate on Same Page
if (isPrinting && receiptToPrint) {
    const { student, payment, baseFeeData } = receiptToPrint;

    return (
        <div style={{
            padding: '5mm',
            fontFamily: 'Arial, sans-serif',
            lineHeight: 1.3,
            maxWidth: '210mm', // A4 width
            margin: '0 auto',
            boxSizing: 'border-box'
        }}>
            <button 
                onClick={() => { setIsPrinting(false); setReceiptToPrint(null); }} 
                style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '10px'
                }}
            >
                ← Close Receipt View
            </button>

            <div className="print-area" style={{ display: 'flex', flexDirection: 'column', gap: '8mm' }}>
                {/* Original Copy */}
                <div>
                    <div style={{
                        textAlign: 'right',
                        fontSize: '10px',
                        marginBottom: '4px',
                        fontWeight: 'bold',
                        color: '#27ae60'
                    }}>
                        ORIGINAL
                    </div>
                    <ReceiptToPrint 
                        student={student} 
                        payment={payment} 
                        classFee={baseFeeData.classFee}
                        transportFee={baseFeeData.transportFee}
                    />
                </div>

                {/* Duplicate Copy */}
                <div>
                    <div style={{
                        textAlign: 'right',
                        fontSize: '10px',
                        marginBottom: '4px',
                        fontWeight: 'bold',
                        color: '#e74c3c'
                    }}>
                        DUPLICATE
                    </div>
                    <ReceiptToPrint 
                        student={student} 
                        payment={payment} 
                        classFee={baseFeeData.classFee}
                        transportFee={baseFeeData.transportFee}
                    />
                </div>
            </div>
        </div>
    );
}

    return selectedStudent ? renderPaymentHistory() : renderStudentList();
};


const receiptStyles = { /* ... (Unchanged) ... */
    // 💡 MODIFIED: Increased width to 75% for a half-page size, and scaled up padding/font sizes
   page: {
    width: '100%',
    maxWidth: '180mm',
    margin: '0 auto',
    padding: '4px 10px', // Reduced from 10px 15px
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#ffff99', 
    border: '1px solid #000',
    boxSizing: 'border-box',
    fontSize: '9px', // Slightly smaller for compactness
    pageBreakInside: 'avoid',
    '@media print': {
        boxShadow: 'none',
        border: 'none',
    }
},
    header: {
        textAlign: 'center',
        marginBottom: '10px', // Increased margin
        borderBottom: '2px solid #000', // Thicker border
        paddingBottom: '8px',
    },
    logoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        justifyContent: 'center',
    },
    logo: {
        width: '30px', // Increased logo size
        height: '30px', 
        borderRadius: '50%',
    },
    schoolName: {
        fontSize: '16px', // Increased font size
        fontWeight: 'bold',
        margin: '0',
        lineHeight: '1.2',
    },
    address: {
        fontSize: '10px', // Increased font size
        margin: '0',
        lineHeight: '1',
    },
    contactRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '10px', // Increased font size
        marginTop: '4px',
    },
    phone: {
        fontWeight: 'bold',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '10px', // Increased font size
        marginBottom: '6px', // Increased margin
        gap: '8px',
    },
    field: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flex: '1 1 30%',
        minWidth: '30%',
    },
    value: {
        borderBottom: '1px dotted #000',
        paddingLeft: '6px',
        fontSize: '10px', // Increased font size
        fontWeight: 'normal',
        flexGrow: 1, // Allow value to take up remaining space
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '12px', // Increased font size
        marginTop: '10px',
        marginBottom: '10px',
        border: '1px solid #000',
    },
    th: {
        border: '1px solid #000',
        padding: '4px', // Increased padding
        textAlign: 'center',
        fontSize: '10px', // Increased font size
        fontWeight: 'bold',
        backgroundColor: '#ffffcc',
    },
    td: {
        border: '1px solid #000',
        padding: '4px', // Increased padding
        textAlign: 'center',
        fontSize: '10px', // Increased font size
    },
    tdLeft: {
        textAlign: 'left',
        paddingLeft: '8px',
    },
    tdRight: {
        textAlign: 'right',
        paddingRight: '8px',
    },
    notesBox: {
        marginTop: '10px',
        padding: '6px', // Increased padding
        border: '1px solid #000',
        fontSize: '9px', // Increased font size
        backgroundColor: '#ffffcc',
    },
    noteHeader: {
        fontWeight: 'bold',
        marginBottom: '4px',
        textAlign: 'center',
        fontSize: '11px', // Increased font size
    },
    noteContent: {
        lineHeight: '1.3', // Increased line height
        textAlign: 'left',
    },
};
const styles = { /* ... (Unchanged) ... */
    container: {
        padding: '1.5rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        color: '#1e293b',
        paddingBottom: '70px',
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
        color: '#0f172a',
    },
    backBtn: {
        padding: '0.5rem 1rem',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    loading: {
        textAlign: 'center',
        marginTop: '2rem',
        color: '#64748b',
    },
    studentGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.25rem',
    },
    studentCard: {
        backgroundColor: 'white',
        padding: '1.25rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
    },
    buttonGroup: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
    },
    actionBtn: {
        flex: 1,
        padding: '0.5rem 0.75rem',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
    },
    historyHeader: {
        backgroundColor: '#dbeafe',
        padding: '1.25rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        borderLeft: '4px solid #3b82f6',
    },
    advanceBadge: {
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#dcfce7',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        color: '#166534',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    noData: {
        textAlign: 'center',
        color: '#64748b',
        marginTop: '2rem',
    },
    historyTable: {
        width: '100%',
    },
    tableHeader: {
        display: 'grid',
        // Grid updated to fit 6 columns
        gridTemplateColumns: 'repeat(4, 1fr) 0.8fr 1.2fr', 
        fontWeight: 'bold',
        padding: '0.75rem 0',
        borderBottom: '2px solid #cbd5e1',
        textAlign: 'center',
        color: '#1e293b',
    },
    tableRow: {
        display: 'grid',
        // Grid updated to fit 6 columns
        gridTemplateColumns: 'repeat(4, 1fr) 0.8fr 1.2fr', 
        padding: '0.75rem 0',
        borderBottom: '1px solid #e2e8f0',
        textAlign: 'center',
    },
    printActionBtn: {
        padding: '0.3rem 0.6rem',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
};

export default StudentPayments;