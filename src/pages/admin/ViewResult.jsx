
// src/pages/teacher/ViewResult.jsx
import React, { useEffect, useState, useMemo } from "react";
import html2pdf from "html2pdf.js";
import Logo from "../../assets/logo.png";
import { endpoints } from "../../config/api";
import PrincipalSign from "../../assets/sign.png";

const ViewResult = ({ onBack }) => {

  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedExamType, setSelectedExamType] = useState("halfYearly");
  const [attendanceData, setAttendanceData] = useState({});
  const [classSubjectMap, setClassSubjectMap] = useState({});
  const [searchRoll, setSearchRoll] = useState("");
  const [searchMobile, setSearchMobile] = useState("");
  const [session, setSession] = useState("");

  // helper: detect drawing subject
  const isDrawing = (sub) => String(sub || "").trim().toLowerCase() === "drawing";

  const handleBackClick = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      window.history.back();
    }
  };


  const saveSession = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized");
      return;
    }

    if (!session.trim()) {
      alert("Please enter session (e.g. 2025-26)");
      return;
    }

    try {
      const res = await fetch(endpoints.settings.saveSession, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ session }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to save session");
        return;
      }

      alert("Session saved successfully");
    } catch (err) {
      console.error("Error saving session:", err);
      alert("Server error while saving session");
    }
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setError("Unauthorized");

    fetch(endpoints.auth.me, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setAssignedClasses(data.assignedClasses || []))
      .catch((err) => console.error("Error fetching teacher info:", err));

    fetch(endpoints.marks.list, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load results");
        return res.json();
      })
      .then((data) => {
        setResults(Array.isArray(data) ? data : []);
        setFilteredResults(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching results:", err);
        setError("Failed to load results.");
        setLoading(false);
      });

    fetch(endpoints.classSubjects.getAll, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load class-subject mapping");
      })
      .then((mapping) => setClassSubjectMap(mapping))
      .catch((err) => console.error("Error fetching class-subject mapping:", err));


    fetch(endpoints.settings.getSession, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("Failed to fetch session, status:", res.status);
          return;
        }
        const data = await res.json();
        setSession(data.session || "");
      })
      .catch((err) => console.error("Error fetching session:", err));

  }, []);

 useEffect(() => {
  if (!filteredResults.length) return;

  const token = localStorage.getItem("token");

  const ids = filteredResults
    .map(r => r.studentId?._id || r.studentId)
    .filter(Boolean);

  fetch(endpoints.attendance.studentBulk(ids.join(",")), {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => setAttendanceData(data))
    .catch(err => console.error("Attendance bulk error", err));

}, [filteredResults]);


  useEffect(() => {
    let filtered = results;

    if (assignedClasses.length > 0) {
      filtered = filtered.filter((r) => assignedClasses.includes(r.class));
    }

    if (searchTerm) {
      filtered = filtered.filter((r) =>
        r.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (searchRoll) {
      filtered = filtered.filter((r) =>
        String(r.studentId?.rollNo || "").includes(searchRoll)
      );
    }

    if (searchMobile) {
      filtered = filtered.filter((r) =>
        String(r.studentId?.mobile || "").includes(searchMobile)
      );
    }

    if (selectedClass) {
      filtered = filtered.filter((r) => r.class === selectedClass);
    }

    setFilteredResults(filtered);
  }, [searchTerm, searchRoll, searchMobile, selectedClass, results, assignedClasses]);

  const isPrimaryClass = (className) => {
    const lower = String(className || "").toLowerCase().trim();
    return ["nursery", "lkg", "ukg", "play"].includes(lower);
  };

  const getGradePointAndGrade = (marks) => {
    if (marks >= 91) return { grade: "A1", point: "10.0" };
    if (marks >= 81) return { grade: "A2", point: "09.0" };
    if (marks >= 71) return { grade: "B1", point: "08.0" };
    if (marks >= 61) return { grade: "B2", point: "07.0" };
    if (marks >= 51) return { grade: "C1", point: "06.0" };
    if (marks >= 41) return { grade: "C2", point: "05.0" };
    if (marks >= 33) return { grade: "D", point: "04.0" };
    if (marks >= 21) return { grade: "E1", point: "" };
    return { grade: "E2", point: "" };
  };

  const downloadReportCard = (studentId, name, examType) => {
    const element = document.getElementById(`report-card-${studentId}-${examType}`);
    if (!element) return;

    const logo = element.querySelector("img");
    if (logo) {
      logo.style.width = "60px";
      logo.style.height = "auto";
    }

    const opt = {
      margin: 0.4,
      filename: `${name.replace(/\s+/g, "_")}_${examType === "halfYearly" ? "HalfYearly" : "Annual"
        }_ReportCard.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(element).set(opt).save();
  };

  const printReportCard = (studentId, examType) => {
    const element = document.getElementById(`report-card-${studentId}-${examType}`);
    if (!element) return;

    const clone = element.cloneNode(true);
    const logo = clone.querySelector("img");
    if (logo) {
      logo.style.width = "100px";
      logo.style.height = "auto";
    }

    const printWin = window.open("", "_blank");

    printWin.document.write(`
  <html>
    <head>
      <title>Report Card</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 0;
        }

        body, table {
  font-size: 14px !important; /* default 11–12 hota hai, ye bada karega */
}

/* subject row spacing */
.marks-table th, .marks-table td {
  padding: 6px 5px;          /* space bhi badha diya */
  font-size: 14px !important;
}

/* headings bigger */
h3,h4 {
  font-size: 26px !important;
}

.school-name {
  font-family: Algerian, "Times New Roman", serif !important;
  font-size: 30px !important;
  letter-spacing: 2.5px !important;
  font-weight: 550 !important;
  text-transform: uppercase;
  text-align: center;

  margin: 0 !important;          /* 🔥 GAP REMOVE */
  padding: 0 !important;         /* 🔥 GAP REMOVE */
  line-height: 1.1 !important;   /* 🔥 TIGHT LOOK */
}



/* Final marks & name section visibly larger */
strong {
  font-size: 15px !important;
}

        table th:first-child,
table td:first-child {
  width: 75px;
  font-weight: bold;
}
        html, body {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
        }

        .print-page {
  height: 297mm;
  width: 210mm;
  padding: 3mm 3mm 5mm 5mm; /* ⬅ Top padding kam kar diya */
  box-sizing: border-box;
  overflow: hidden;
}

.grade-scale-table th,
.grade-scale-table td {
  padding: 1px 2px;   /* pehle 3px 2px tha, ab height kam ho jayegi */
  line-height: 1.1;   /* text tight ho jayega */
  text-align: center !important;
  vertical-align: middle !important;
}


        .report-border-wrapper {
          border: 5px double #000 !important;
          padding: 12px !important;
          border-radius: 6px !important;
        }

        table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;           /* print ke liye chhota font */
  table-layout: fixed;
}
th, td {
  border: 1px solid #000000ff;
  padding: 0px 0px;
  line-height: 1.1;
  font-size: 13px;
}

/* 🔥 ADD THIS BELOW */
.marks-table th,
.marks-table td {
  text-align: center !important;
  vertical-align: middle !important;
}

.marks-table th:first-child,
.marks-table td:first-child {
  text-align: left !important;
  padding-left: 6px;
}



.vertical-header {
  display: inline-block;
  transform: rotate(-90deg);
  transform-origin: center center;
  white-space: nowrap;

  padding: 6px 3px;        /* 🔥 zyada space */
  min-width: 26px;         /* 🔥 column wide */
  text-align: center;

  font-weight: bold;
  font-size: 11px;         /* 🔥 SIZE INCREASE (print) */
}

.marks-table thead tr:nth-child(2) th {
  height: 30px;        /* 🔥 rotated text ke liye jagah */
  vertical-align: middle;
}



      </style>
    </head>
    <body>
      <div class="print-page">
        ${clone.outerHTML}
      </div>
      <script>
        window.onload = function () {
          window.focus();
          window.print();
        };
      </script>
    </body>
  </html>
`);

    printWin.document.close();
  };

  const getStudentFromRecord = (record) => {
    if (!record.studentId) return null;
    if (typeof record.studentId === "object" && record.studentId !== null) {
      return record.studentId;
    }
    return null;
  };

  // ---------- AVERAGE CALC + POSITION (TOP 3) – HOOKS SE PEHLE NAHI, BUT USEMEMO PEHLE  ----------

  const computeAverageForRecord = (r, examType) => {
    const subjectsArray = classSubjectMap[r.class] || [];
    if (!subjectsArray.length) return 0;

    const isPrimary = isPrimaryClass(r.class);
    const examData = r.exams || {};

    let sumT1 = 0,
      sumT2 = 0,
      sumF = 0,
      n = 0;

    subjectsArray.forEach((sub) => {
      const lowerSub = String(sub || "").toLowerCase();
      if (isDrawing(sub)) {
        // skip drawing entirely for numeric averages
        return;
      }

      // parse numeric values safely (fallback to 0)
      const pa1 = Number(examData.pa1?.[sub] || 0);
      const pa2 = Number(examData.pa2?.[sub] || 0);
      const sa1 = Number(examData.halfYear?.[sub] || 0);
      const pa3 = Number(examData.pa3?.[sub] || 0);
      const pa4 = Number(examData.pa4?.[sub] || 0);
      const sa2 = Number(examData.final?.[sub] || 0);

      if (isPrimary) {
        const total = pa1 + pa2 + sa1;
        sumF += total;
        n++;
      } else if (examType === "halfYearly") {
        const term1 = pa1 / 2 + pa2 / 2 + sa1;
        sumT1 += term1;
        sumF += term1;
        n++;
      } else {
        const term1 = pa1 / 2 + pa2 / 2 + sa1;
        const term2 = pa3 / 2 + pa4 / 2 + sa2;
        const finalTotal = (term1 + term2) / 2;
        sumT1 += term1;
        sumT2 += term2;
        sumF += finalTotal;
        n++;
      }
    });

    if (!n) return 0;
    const avgF = sumF / n;
    return avgF;
  };

  const positionMap = useMemo(() => {
    const map = {};
    if (!filteredResults.length) return map;

    const byClass = {};

    filteredResults.forEach((r) => {
      if (!r.class) return;
      const avg = computeAverageForRecord(r, selectedExamType);
      if (!byClass[r.class]) byClass[r.class] = [];
      byClass[r.class].push({ recordId: r._id, avg });
    });

    Object.keys(byClass).forEach((cls) => {
      const arr = byClass[cls]
        .filter((x) => x.avg > 0)
        .sort((a, b) => b.avg - a.avg);

      arr.slice(0, 3).forEach((item, index) => {
        map[item.recordId] = index + 1; // 1,2,3
      });
    });

    return map;
  }, [filteredResults, selectedExamType, classSubjectMap]);

  // ---------- AB HOOKS KE BAAD LOADING/ERROR RETURN KAR SAKTE HAIN ----------

  if (loading)
    return <h3 style={{ textAlign: "center", padding: "2rem" }}>Loading results...</h3>;
  if (error)
    return (
      <h3 style={{ textAlign: "center", color: "red", padding: "2rem" }}>{error}</h3>
    );

const classOptions = [...new Set(results.map(r => r.class))].sort();


  const renderReportCard = (
    r,
    student,
    examData,
    subjectsArray,
    attendanceDisplay,
    examType,
    position
  ) => {
    const isPrimary = isPrimaryClass(r.class);
    const isHalfYearly = examType === "halfYearly";


    const subjectRows = subjectsArray.map((sub) => {
      const pa1Raw = examData.pa1?.[sub];
      const pa2Raw = examData.pa2?.[sub];
      const sa1Raw = examData.halfYear?.[sub];
      const pa3Raw = examData.pa3?.[sub];
      const pa4Raw = examData.pa4?.[sub];
      const sa2Raw = examData.final?.[sub];

      const drawing = isDrawing(sub);

      // For drawing keep raw grade string (if any)
      if (drawing) {
        return {
          sub,
          pa1: pa1Raw ?? "",
          pa2: pa2Raw ?? "",
          sa1: sa1Raw ?? "",
          pa3: pa3Raw ?? "",
          pa4: pa4Raw ?? "",
          sa2: sa2Raw ?? "",
          term1: "",
          term2: "",
          finalTotal: "",
          grade: pa1Raw || pa2Raw || sa1Raw || pa3Raw || pa4Raw || sa2Raw || "",
          point: "",
          isDrawing: true,
        };
      }


      // Numeric subject: coerce to numbers (safe fallback to 0)
      const pa1 = Number(pa1Raw || 0);
      const pa2 = Number(pa2Raw || 0);
      const sa1 = Number(sa1Raw || 0);
      const pa3 = Number(pa3Raw || 0);
      const pa4 = Number(pa4Raw || 0);
      const sa2 = Number(sa2Raw || 0);

      if (isPrimary) {
        const total = pa1 + pa2 + sa1;
        const { grade, point } = getGradePointAndGrade(total);
        return { sub, pa1, pa2, sa1, total, grade, point, isDrawing: false };
      }

      if (isHalfYearly) {
        const term1 = pa1 / 2 + pa2 / 2 + sa1;
        const { grade, point } = getGradePointAndGrade(term1);
        return {
          sub,
          pa1: pa1 / 2,
          pa2: pa2 / 2,
          sa1,
          term1,
          term1Grade: grade,
          term1Point: point,
          finalTotal: term1,
          grade,
          point,
          isDrawing: false,
        };
      }

      // Final (annual)
      const term1 = pa1 / 2 + pa2 / 2 + sa1;
      const term2 = pa3 / 2 + pa4 / 2 + sa2;
      const finalTotal = (term1 + term2) / 2;

      const { grade: g1, point: p1 } = getGradePointAndGrade(term1);
      const { grade: g2, point: p2 } = getGradePointAndGrade(term2);
      const { grade: gf, point: pf } = getGradePointAndGrade(finalTotal);

      return {
        sub,
        pa1: term1 ? (pa1 / 2) : 0, // already used display as halves in table
        pa2: term1 ? (pa2 / 2) : 0,
        sa1,
        pa3: pa3 / 2,
        pa4: pa4 / 2,
        sa2,
        term1,
        term2,
        finalTotal,
        term1Grade: g1,
        term1Point: p1,
        term2Grade: g2,
        term2Point: p2,
        finalGrade: gf,
        finalPoint: pf,
        isDrawing: false,
      };
    });



    const mainRows = subjectRows.filter((r) => !r.isDrawing);
    const drawingRows = subjectRows.filter((r) => r.isDrawing);

    // safe formatter: only call toFixed on numbers
   const formatCell = (v, decimals = 1) => {
  // 👇 0 ka matlab Absent
  if (v === 0) return "AB";

  if (v === null || v === undefined || v === "") return "";
  return typeof v === "number" ? v.toFixed(decimals) : String(v);
};



    // Totals sirf main subjects se
    // Totals sirf main subjects se
    let sumT1 = 0,
      sumT2 = 0,
      sumF = 0,
      n = 0;

    // Column-wise totals
    let totalPa1 = 0,
      totalPa2 = 0,
      totalPa3 = 0,
      totalPa4 = 0,
      totalSa1 = 0,
      totalSa2 = 0,
      totalTerm1 = 0,
      totalTerm2 = 0,
      totalFinal = 0;

    mainRows.forEach((row) => {
      n++;

      // PRIMARY (sirf PA1, PA2, SA1, Total)
      if (isPrimary) {
        totalPa1 += row.pa1 || 0;
        totalPa2 += row.pa2 || 0;
        totalSa1 += row.sa1 || 0;
        totalFinal += row.total || 0;

        sumF += row.total || 0; // avg aur percentage ke liye
      }
      // HALF YEARLY
      else if (isHalfYearly) {
        totalPa1 += row.pa1 || 0;
        totalPa2 += row.pa2 || 0;
        totalSa1 += row.sa1 || 0;
        totalTerm1 += row.term1 || 0;

        sumT1 += row.term1 || 0;
        sumF += row.term1 || 0; // yahi final माना hai half yearly me
      }
      // FINAL (DONO TERM)
      else {
        totalPa1 += row.pa1 || 0;
        totalPa2 += row.pa2 || 0;
        totalSa1 += row.sa1 || 0;
        totalTerm1 += row.term1 || 0;

        totalPa3 += row.pa3 || 0;
        totalPa4 += row.pa4 || 0;
        totalSa2 += row.sa2 || 0;
        totalTerm2 += row.term2 || 0;

        totalFinal += row.finalTotal || 0;

        sumT1 += row.term1 || 0;
        sumT2 += row.term2 || 0;
        sumF += row.finalTotal || 0;
      }
    });

    // (agar kahin use karna ho to rakh sakte ho)
    const avgT1 = n ? sumT1 / n : 0;
    const avgT2 = n ? sumT2 / n : 0;
    const avgF = n ? sumF / n : 0;

    // ✅ Final Marks (total of all subjects) + Percentage
    let finalMarks = 0;

    if (isPrimary) {
      // Primary classes: totalFinal = sab subjects ke total ka sum
      finalMarks = totalFinal;
    } else if (isHalfYearly) {
      // Half yearly: sirf First Term ka total
      finalMarks = totalTerm1;
    } else {
      // Annual: finalTotal (100) ka sum
      finalMarks = totalFinal;
    }

    const maxMarks = n * 100; // har subject 100 marks maana hai
    const percentage = maxMarks
      ? ((finalMarks / maxMarks) * 100).toFixed(2)
      : "0.00";

    const positionLabel =
      position === 1 ? "1st" : position === 2 ? "2nd" : position === 3 ? "3rd" : null;

    return (
      <>
        {/* School Header */}
        <div
          style={{
            border: "2px solid #000",
            padding: "6px",
            marginBottom: "10px",
            borderRadius: "6px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12pt",
              fontWeight: "bold",
              marginBottom: "12px",
            }}
          >
            <span>Reg. No :- 21912662021926123218</span>
            <span>UDISE No :- 10170504508</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 80px", // left logo, center text, right empty
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* LEFT: Logo */}
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <img
                src={Logo}
                alt="School Logo"
                style={{ width: "70px", height: "auto" }}
              />
            </div>

            {/* CENTER: Full-width text (ab logo se independent center hoga) */}
            <div style={{ textAlign: "center", width: "100%", marginLeft: "40px" }}>
              <h1 className="school-name">
                AMBIKA INTERNATIONAL SCHOOL
              </h1>

              <p style={{ margin: "2px 0 0 0", fontSize: "15pt", fontWeight: 600 }}>

                Based on CBSE curriculum (Play to Xth)
              </p>
              <p style={{ margin: "1px 0", fontSize: "14pt" }}>
                Saidpur, Dighwara (Saran), 841207
              </p>
              <p style={{ margin: "1px 0", fontSize: "14pt" }}>Mob. 8797118188</p>
            </div>

            <div />
          </div>


        </div>

        {/* Student Details */}
        <div
          style={{
            border: "2px solid #000",
            padding: "6px",
            borderRadius: "6px",
            marginBottom: "10px",
            background: "#fff",
          }}
        >
          <h3
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: "16pt",
              margin: "0 auto 8px auto",
            }}
          >
            {isHalfYearly ? "REPORT CARD OF S.A.I" : "ANNUAL REPORT CARD"}
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              fontSize: "12pt",
              marginBottom: "10px",
              width: "100%",
            }}
          >
            <div>
              <strong>CLASS:</strong> {r.class.toUpperCase()}
            </div>
            <div>
              <strong>SECTION:</strong> A
            </div>
            <div>
              <strong>SESSION:</strong> {session || "2025-26"}
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: "12pt",
              fontWeight: "bold",
              padding: "6px 0",
              margin: "10px 0",
              border: "2px solid #000",
              background: "#e6e6e6",
              borderRadius: "6px",
              letterSpacing: "1px",
            }}
          >
            STUDENT'S DETAIL
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",   // border-collapse hata diya
              borderSpacing: 0,
              fontSize: "12pt",
              lineHeight: "1.6",
              padding: "4px",
              border: "none",               // table border off
            }}
          >
            <tbody>
              <tr>
                {/* LEFT DETAILS */}
                <td
                  style={{
                    width: "40%",
                    verticalAlign: "top",
                    paddingRight: "10px",
                    textAlign: "left",
                    fontWeight: "500",
                    border: "none",          // cell border off
                  }}
                >
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Student's Name:</strong> {student.name}
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Mother's Name:</strong> {student.motherName || "N/A"}
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Father's Name:</strong> {student.fatherName || "N/A"}
                  </div>
                  <div>
                    <strong>Address:</strong> {student.address || "N/A"}
                  </div>
                </td>

                <td
                  style={{
                    width: "20%",
                    verticalAlign: "top",
                    textAlign: "center",
                    border: "none",
                  }}
                >
                  <div
                    style={{
                      width: "90px",
                      height: "80px",
                      border: "1px solid #000",   // sirf photo ka frame rahe
                      margin: "0 auto",
                      borderRadius: "10px"
                    }}
                  >
                    <img
                      src={student.photo || "https://via.placeholder.com/100"}
                      alt="Student"
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
                    />
                  </div>
                </td>

                {/* RIGHT DETAILS */}
                <td
                  style={{
                    width: "40%",
                    verticalAlign: "top",
                    paddingLeft: "10px",
                    textAlign: "left",
                    fontWeight: "500",
                    border: "none",
                  }}
                >
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Roll No:</strong> {student.rollNo || "N/A"}
                  </div>
                  <div style={{ marginBottom: positionLabel ? "4px" : 0 }}>
                    <strong>Attendance:</strong> {attendanceDisplay}
                  </div>

                  <div style={{ marginBottom: positionLabel ? "4px" : 0 }}>
                    <strong>Mobile:</strong> {student.mobile || "N/A"}
                  </div>

                  {positionLabel && (
                    <div>
                      <strong>Position:</strong> {positionLabel}
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

        </div>

        {/* Marks Table */}
        <div
          style={{
            border: "2px solid #000",
            padding: "12px",
            borderRadius: "6px",
            marginTop: "10px",
            background: "#fff",
          }}
        >
          <h4
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: "14pt",
              margin: "0 auto 10px auto",
              display: "block",
              fontWeight: "bold",
              textDecoration: "underline",


            }}
          >
            Academic Performance : Scholastic Area (9 Point Scale)
          </h4>

          <div className="table-container" style={{ marginTop: "10px", }}>
            <table className="marks-table">
              <thead>
                {isPrimary ? (
                  <tr>
                    <th>SUBJECT</th>
                    <th>PA I</th>
                    <th>PA II</th>
                    <th>SA I</th>
                    <th>TOTAL</th>
                    <th>GRADE POINT</th>
                    <th>GRADE</th>
                  </tr>
                ) : isHalfYearly ? (
                  <tr>
                    <th>SUBJECT</th>
                    <th>PA I</th>
                    <th>PA II</th>
                    <th>SA I</th>
                    <th>TOTAL</th>
                    <th>GRADE POINT</th>
                    <th>GRADE</th>
                  </tr>
                ) : (
                  <>
                    <tr>
                      <th rowSpan={2}>SUBJECT</th>
                      <th colSpan={5}>First Term</th>
                      <th colSpan={5}>Second Term</th>
                      <th colSpan={5}>Final Result</th>
                    </tr>
                    <tr>
                      {/* First Term */}
                      <th>PA I</th>
                      <th>PA II</th>
                      <th>SA I</th>
                      <th>
                        <div className="vertical-header">TOTAL</div>
                      </th>
                      <th>
                        <div className="vertical-header">GRADE</div>
                      </th>

                      {/* Second Term */}
                      <th>PA III</th>
                      <th>PA IV</th>
                      <th>SA II</th>
                      <th>
                        <div className="vertical-header">TOTAL</div>
                      </th>
                      <th>
                        <div className="vertical-header">GRADE</div>
                      </th>

                      {/* Final Block */}
                      <th>
                        <div className="vertical-header">
                          First<br />Term
                        </div>
                      </th>
                      <th>
                        <div className="vertical-header">Second <br /> Term</div>
                      </th>
                      <th>
                        <div className="vertical-header">Final <br />(100)</div>
                      </th>
                      <th>
                        <div className="vertical-header">Grade <br /> Point</div>
                      </th>
                      <th>
                        <div className="vertical-header">Grade</div>
                      </th>
                    </tr>
                  </>
                )}

              </thead>


              <tbody>
                {/* Main subjects (Drawing ke bina) */}
                {mainRows.map((row) => (
                  <tr key={row.sub}>
                    <td>{row.sub.toUpperCase()}</td>

                    {isPrimary ? (
                      <>
                        <td>{formatCell(row.pa1)}</td>
                        <td>{formatCell(row.pa2)}</td>
                        <td>{formatCell(row.sa1)}</td>
                        <td>{typeof row.total === "number" ? row.total.toFixed(1) : row.total || ""}</td>
                        <td>{row.isDrawing ? "" : row.point || ""}</td>
                        <td>{row.isDrawing ? "" : row.grade || ""}</td>
                      </>
                    ) : isHalfYearly ? (
                      <>
                        <td>{formatCell(row.pa1)}</td>
                        <td>{formatCell(row.pa2)}</td>
                        <td>{formatCell(row.sa1)}</td>
                        <td>{formatCell(row.term1)}</td>
                        <td>{row.isDrawing ? "" : row.term1Point || ""}</td>
                        <td>{row.isDrawing ? "" : row.term1Grade || ""}</td>
                      </>
                    ) : (
                      <>
                        {/* First Term */}
                        <td>{formatCell(row.pa1)}</td>
                        <td>{formatCell(row.pa2)}</td>
                        <td>{formatCell(row.sa1)}</td>
                        <td>{formatCell(row.term1)}</td>
                        <td>{row.isDrawing ? "" : row.term1Grade || ""}</td>

                        {/* Second Term */}
                        <td>{formatCell(row.pa3)}</td>
                        <td>{formatCell(row.pa4)}</td>
                        <td>{formatCell(row.sa2)}</td>
                        <td>{formatCell(row.term2)}</td>
                        <td>{row.isDrawing ? "" : row.term2Grade || ""}</td>

                        {/* Final Block */}
                        <td>{formatCell(row.term1)}</td>
                        <td>{formatCell(row.term2)}</td>
                        <td>{formatCell(row.finalTotal)}</td>
                        <td>{row.isDrawing ? "" : row.finalPoint || ""}</td>
                        <td>{row.isDrawing ? "" : row.finalGrade || ""}</td>
                      </>
                    )}
                  </tr>
                ))}

                {/* Total Row – sirf main subjects ka */}
                <tr style={{ fontWeight: "bold", background: "#f0f0f0" }}>
                  <td>TOTAL</td>

                  {isPrimary ? (
                    <>
                      <td>{formatCell(totalPa1)}</td>
                      <td>{formatCell(totalPa2)}</td>
                      <td>{formatCell(totalSa1)}</td>
                      <td>{formatCell(totalFinal)}</td>
                      <td></td>
                      <td></td>
                    </>
                  ) : isHalfYearly ? (
                    <>
                      <td>{formatCell(totalPa1)}</td>
                      <td>{formatCell(totalPa2)}</td>
                      <td>{formatCell(totalSa1)}</td>
                      <td>{formatCell(totalTerm1)}</td>
                      <td></td>
                      <td></td>
                    </>
                  ) : (
                    <>
                      {/* First Term */}
                      <td>{formatCell(totalPa1)}</td>
                      <td>{formatCell(totalPa2)}</td>
                      <td>{formatCell(totalSa1)}</td>
                      <td>{formatCell(totalTerm1)}</td>
                      <td></td>

                      {/* Second Term */}
                      <td>{formatCell(totalPa3)}</td>
                      <td>{formatCell(totalPa4)}</td>
                      <td>{formatCell(totalSa2)}</td>
                      <td>{formatCell(totalTerm2)}</td>
                      <td></td>

                      {/* Final Block */}
                      <td>{formatCell(totalTerm1)}</td>
                      <td>{formatCell(totalTerm2)}</td>
                      <td>{formatCell(totalFinal)}</td>
                      <td></td>
                      <td></td>
                    </>
                  )}
                </tr>

                {/* Drawing rows – totals ke baad, bina grade/GP ke */}
                {drawingRows.map((row) => (
                  <tr key={row.sub + "-drawing"}>
                    <td>{row.sub.toUpperCase()}</td>

                    {isPrimary ? (
                      <>
                        <td>{formatCell(row.pa1)}</td>
                        <td>{formatCell(row.pa2)}</td>
                        <td>{formatCell(row.sa1)}</td>
                        <td>{formatCell(row.total)}</td>
                        <td></td>
                        <td></td>
                      </>
                    ) : isHalfYearly ? (
                      <>
                        <td>{formatCell(row.pa1)}</td>
                        <td>{formatCell(row.pa2)}</td>
                        <td>{formatCell(row.sa1)}</td>
                        <td>{formatCell(row.term1)}</td>
                        <td></td>
                        <td></td>
                      </>
                    ) : (
                      <>
                        {/* First Term */}
                        <td>{formatCell(row.pa1)}</td>
                        <td>{formatCell(row.pa2)}</td>
                        <td>{formatCell(row.sa1)}</td>
                        <td>{formatCell(row.term1)}</td>
                        <td></td>

                        {/* Second Term */}
                        <td>{formatCell(row.pa3)}</td>
                        <td>{formatCell(row.pa4)}</td>
                        <td>{formatCell(row.sa2)}</td>
                        <td>{formatCell(row.term2)}</td>
                        <td></td>

                        {/* Final block */}
                        <td>{formatCell(row.term1)}</td>
                        <td>{formatCell(row.term2)}</td>
                        <td>{formatCell(row.finalTotal)}</td>
                        <td></td>
                        <td></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>


            </table>
          </div>
        </div>

        {/* Footer: Grading Scale + Notes + Signature */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "15px",
            fontSize: "10pt",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >

          <div
            style={{
              flex: "1 1 30%",
              minWidth: "180px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <table
              className="marks-table grade-scale-table"
              style={{ width: "100%", fontSize: "8pt" }}  // chaho to 9pt bhi rehne do
            >

              <thead>
                <tr>
                  <th colSpan="3" style={{ textAlign: "center" }}>
                    SCHOLASTIC AREAS( 9 Point Scale)
                  </th>
                </tr>
                <tr>
                  <th>MARKS RANGE</th>
                  <th>GRADE</th>
                  <th>GRADE POINT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>91-100</td>
                  <td>A1</td>
                  <td>10.0</td>
                </tr>
                <tr>
                  <td>81-90</td>
                  <td>A2</td>
                  <td>09.0</td>
                </tr>
                <tr>
                  <td>71-80</td>
                  <td>B1</td>
                  <td>08.0</td>
                </tr>
                <tr>
                  <td>61-70</td>
                  <td>B2</td>
                  <td>07.0</td>
                </tr>
                <tr>
                  <td>51-60</td>
                  <td>C1</td>
                  <td>06.0</td>
                </tr>
                <tr>
                  <td>41-50</td>
                  <td>C2</td>
                  <td>05.0</td>
                </tr>
                <tr>
                  <td>33-40</td>
                  <td>D</td>
                  <td>04.0</td>
                </tr>
                <tr>
                  <td>21-32</td>
                  <td>E1</td>
                  <td></td>
                </tr>
                <tr>
                  <td>00-20</td>
                  <td>E2</td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            {/* 👇 yaha signature niche add kiya */}
            <div
              style={{
                marginTop: "10px",
                textAlign: "center",
                fontSize: "10pt",
                fontWeight: 500,
              }}
            >
              Class Teacher Sig. __________________
            </div>
          </div>

          <div
            style={{
              flex: "1 1 55%",
              minWidth: "300px",
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.4,
              marginLeft: "30px",
            }}
          >
            <div>
              <div style={{ fontSize: "11pt", fontWeight: 500, lineHeight: 1.5, wordSpacing: "3px", }}>
                <span style={{ fontWeight: 700, fontSize: "14pt" }}>
                  Students are assessed according to the following :-
                </span>
                <br />
                Promotion is based on the day-to-day work of the student
                <br />
                Throughout the year and also on the performance in the half
                <br />
                Yearly/Summative examination.
                <br />
              </div>


              First Term &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :-PA I (10%) + PA II (10%) + SA I (80%) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= 100%
              <br />
              Second Term &nbsp;&nbsp; :-PA III (10%) + PA IV (10%) +SA II (80%) = 100%
              <br />
              Final Result &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:-50% of 1st Term + 50% of 2nd Term &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= 100%

            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginTop: "25px",
                width: "100%",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "12px",
                  marginTop: "50px",
                  fontSize: "10pt",
                }}
              >

                {/* Label */}
                <div style={{ whiteSpace: "nowrap" }}>
                  Principal Sig.
                </div>
                {/* Signature + underline */}
                <div style={{ textAlign: "center" }}>
                  <img
                    src={PrincipalSign}
                    alt="Principal Signature"
                    style={{
                      width: "120px",
                      height: "auto",
                      display: "block",
                      marginBottom: "2px",
                    }}
                  />

                  {/* underline */}
                  <div
                    style={{
                      borderBottom: "1px solid black",
                      width: "120px",
                      margin: "0 auto",
                    }}
                  ></div>
                </div>
              </div>


              <div
                style={{

                  padding: "3px",
                  width: "140px",
                  fontSize: "10pt",
                  marginRight: "15px",
                  marginTop: "30px",
                }}
              >
                <table
                  style={{
                    border: "1px solid black",
                    borderCollapse: "collapse",
                    width: "160px",
                    fontSize: "10pt",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "3px",
                          fontWeight: "bold",
                          textAlign: "left",
                        }}
                      >
                        Total obtain marks
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "3px",
                          fontWeight: "bold",
                          textAlign: "center",
                          fontSize: "14pt",
                        }}
                      >
                        {finalMarks.toFixed(0)}
                      </td>
                    </tr>

                    <tr>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "6px",
                          fontWeight: "bold",
                          textAlign: "left",
                        }}
                      >
                        Percentage
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "6px",
                          fontWeight: "bold",
                          textAlign: "right",
                          fontSize: "14pt",
                        }}
                      >
                        {percentage}%
                      </td>
                    </tr>
                  </tbody>
                </table>

              </div>

            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="view-result-container">
      <style>{`
        .view-result-container {
          padding: 1rem;
          background: #f9f9f9;
          font-family: "Times New Roman", serif;
        }
            .marks-table th:first-child,
  .marks-table td:first-child {
    width: 70px;      /* Thoda wide karna ho to 160 ya 180 bhi rakh sakte ho */
    font-weight: bold;
    
  }
    /* SUBJECT column left */
.marks-table th:first-child,
.marks-table td:first-child {
  text-align: left !important;
  padding-left: 6px;
}

/* Baaki sab columns center */
.marks-table th:not(:first-child),
.marks-table td:not(:first-child) {
  text-align: center !important;
}

        h2 {
          text-align: center;
          color: #2c3e50;
          margin: 1rem 0;
          font-size: 1.6rem;
        }
        .filters {
          display: flex;
          gap: 0.8rem;
          justify-content: center;
          flex-wrap: wrap;
          margin: 1rem 0;
        }
        .filters input,
        .filters select {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 0.95rem;
          min-width: 160px;
        }
        .report-cards-grid {
          display: grid;
          gap: 1.5rem;
          margin-top: 1.2rem;
        }
        .report-card {
          background: #fff;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
        .table-container {
          overflow-x: auto;
          width: 100%;
          margin: 10px 0;
        }
        .marks-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.65rem;      /* chhota font taaki sab andar aa jaye */
  table-layout: fixed;     /* columns equal width me fit honge */
}
.marks-table th,
.marks-table td {
  padding: 3px 2px;        /* kam padding */
  border: 1px solid #000;
  text-align: center !important;
  word-wrap: break-word;
}


.vertical-header {
  display: flex;                    /* 🔥 IMPORTANT */
  align-items: center;
  justify-content: center;

  transform: rotate(-90deg);
  transform-origin: center center;
  white-space: nowrap;

  line-height: 0.9;        /* 🔥 multi-line ke liye */
  white-space: normal; 

  height: 95px;                     /* 🔥 PRINT me space */
  width: 22px;

  font-weight: bold;
  font-size: 11px;                  /* print readable */
  line-height: 1;
}





        .action-buttons {
          margin-top: 12px;
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .action-buttons button {
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background: #3498db;
          color: white;
        }
        .action-buttons button:hover {
          background: #2980b9;
        }
        .report-border-wrapper {
          border: 5px double #000;
          padding: 12px;
          border-radius: 6px;
          background: #fff;
        }
                  .vr-top-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0.5rem 0 1rem;
          flex-wrap: wrap;
        }

        .vr-back-btn {
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid #d1d5db;
          background: #2563eb;
          cursor: pointer;
          font-size: 0.9rem;
          color: white;
        }

        .vr-top-bar h2 {
          margin: 0;
          flex: 1;
          text-align: center;
        }

        
      `}</style>

      <div className="vr-top-bar">
        <button className="vr-back-btn" onClick={handleBackClick}>
          ← Back
        </button>
        <h2>Student Marks Record</h2>
      </div>


      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "10px",
          marginTop: "-5px",
        }}
      >
        <input
          type="text"
          placeholder="Session (e.g. 2025-26)"
          value={session}
          onChange={(e) => setSession(e.target.value)}
          style={{
            padding: "6px 10px",
            border: "1px solid #888",
            borderRadius: "6px",
            fontSize: "14px",
            width: "180px",
            textAlign: "center",
          }}
        />

        <button
          onClick={saveSession}
          style={{
            padding: "6px 14px",
            background: "#27ae60",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          💾 Save Session
        </button>
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Search Student Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <input
          type="number"
          placeholder="🔍 Search Roll No"
          value={searchRoll}
          onChange={(e) => setSearchRoll(e.target.value)}
        />

        <input
          type="text"
          placeholder="🔍 Search Mobile No"
          value={searchMobile}
          onChange={(e) => setSearchMobile(e.target.value)}
        />

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">All Classes</option>
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        <select
          value={selectedExamType}
          onChange={(e) => setSelectedExamType(e.target.value)}
        >
          <option value="halfYearly">Half Yearly Report</option>
          <option value="final">Annual Report Card</option>
        </select>
      </div>

      {filteredResults.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            color: "#7f8c8d",
            padding: "1.5rem",
          }}
        >
          No matching results found.
        </p>
      ) : (
        <div className="report-cards-grid">
          {filteredResults.map((r) => {
            const student = getStudentFromRecord(r);
            if (!student || !r.class) return null;

            const studentId = student._id || r.studentId;
            const examData = r.exams || {};
            const subjectsArray = classSubjectMap[r.class] || [];
            const att = attendanceData[studentId];
            const attendanceDisplay = att
              ? `${att.present} / ${att.total} (${att.percentage}%)`
              : student.attendance
                ? `${student.attendance} / 115`
                : "—";

            const position = positionMap[r._id];

            return (
              <div
                key={`${r._id}-${selectedExamType}`}
                className="report-card"
              >
                <div
                  id={`report-card-${r._id}-${selectedExamType}`}
                  className="report-border-wrapper"
                >
                  {renderReportCard(
                    r,
                    student,
                    examData,
                    subjectsArray,
                    attendanceDisplay,
                    selectedExamType,
                    position
                  )}
                </div>

                <div className="action-buttons">
                  <button
                    onClick={() =>
                      downloadReportCard(
                        r._id,
                        student.name,
                        selectedExamType
                      )
                    }
                  >
                    📥 Download PDF
                  </button>
                  <button
                    onClick={() =>
                      printReportCard(r._id, selectedExamType)
                    }
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewResult;
