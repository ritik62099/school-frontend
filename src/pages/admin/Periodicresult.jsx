

// src/pages/teacher/ViewPAResults.jsx
import React, { useEffect, useState } from "react";
import Logo from "../../assets/logo.png";
import { endpoints } from "../../config/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const ViewPAResults = ({ onBack }) => {
  const [results, setResults] = useState([]);
  const [classSubjectMap, setClassSubjectMap] = useState({});
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchClass, setSearchClass] = useState("");
  const [searchRoll, setSearchRoll] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedPA, setSelectedPA] = useState("pa1");
 


  const handleBackClick = () => {
    if (typeof onBack === "function") onBack();
    else window.history.back();
  };

  // helper: detect drawing subject
  const isDrawing = (sub) => String(sub || "").trim().toLowerCase() === "drawing";

  // safe formatter for display
  const formatCell = (v, decimals = 2) => {
    if (v === null || v === undefined || v === "") return "";
    return typeof v === "number" ? v.toFixed(decimals) : String(v);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(endpoints.auth.me, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setAssignedClasses(data.assignedClasses || []))
      .catch(() => {});

    fetch(endpoints.marks.list, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]));

    fetch(endpoints.classSubjects.getAll, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((mapping) => setClassSubjectMap(mapping || {}))
      .catch(() => setClassSubjectMap({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <h2>Loading...</h2>;

  const classOptions = [...new Set(results.map((r) => r.class))];

  const getStudent = (record) =>
    typeof record.studentId === "object" ? record.studentId : null;

  // UI exam key -> DB exam key mapping
  const getExamStorageKey = (examKey) => {
    switch (examKey) {
      case "sa1":
        return "halfYear"; // DB name
      case "sa2":
        return "final"; // DB name
      default:
        return examKey; // pa1, pa2, pa3, pa4
    }
  };

  // exam per-subject max marks (PA = 20, SA = 80)
  const getPerSubjectMax = (examKey) => {
    if (examKey === "sa1" || examKey === "sa2") return 80;
    return 20;
  };


const loadImageAsBase64 = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
  });
};


const printClassPA_PDF = async (examKey, className, students, subjects) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ✅ Load logo
  const logoBase64 = await loadImageAsBase64(Logo);

  // ===== HEADER =====
  const drawHeader = () => {
    doc.setFontSize(9);
doc.setFont("helvetica", "normal");

doc.text("Reg. No: 21912662021926123218", 14, 8);
doc.text("UDISE No: 10170504508", pageWidth - 14, 8, { align: "right" });

    doc.addImage(logoBase64, "PNG", 14, 10, 20, 20);

    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("AMBIKA INTERNATIONAL SCHOOL", pageWidth / 2, 15, { align: "center" });

  
   
    doc.setFontSize(10);
    doc.text("Based on CBSE curriculum (Play to Xth)", pageWidth / 2, 21, { align: "center" });
    doc.text("Saidpur, Dighwara (Saran), 841207", pageWidth / 2, 26, { align: "center" });
    doc.text("Mob. 8797118188", pageWidth / 2, 31, { align: "center" });

    doc.setFontSize(9);

    doc.line(14, 39, pageWidth - 14, 39);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(
      `${examKey.toUpperCase()} EXAMINATION RESULT  |  Class: ${className}`,
      pageWidth / 2,
      45,
      { align: "center" }
    );
  };

  // ===== TABLE HEAD =====
  const head = [[
    "Roll",
    "Name",
    ...subjects,
    "Total",
    "%"
  ]];

  // ===== TABLE BODY =====
  const body = students.map((r) => {
    const student = typeof r.studentId === "object" ? r.studentId : {};
    const examKeyDB =
      examKey === "sa1" ? "halfYear" :
      examKey === "sa2" ? "final" :
      examKey;

    const exam = r.exams?.[examKeyDB] || {};

    let total = 0;

    const marks = subjects.map((sub) => {
      const val = exam[sub];
      if (String(sub).toLowerCase() === "drawing") return val || "";
      const num = parseFloat(val);
      if (!isNaN(num)) total += num;
      return isNaN(num) ? 0 : num;
    });

    const maxMarks =
      subjects.filter((s) => String(s).toLowerCase() !== "drawing").length *
      (examKey === "sa1" || examKey === "sa2" ? 80 : 20);

    const percent = maxMarks ? ((total / maxMarks) * 100).toFixed(2) : "0.00";

    return [
      student.rollNo || "",
      student.name || "",
      ...marks,
      total,
      `${percent}%`
    ];
  });

  // ===== AUTOTABLE =====
  autoTable(doc, {
    startY: 50,
    head,
    body,
    theme: "grid",
    styles: {
      fontSize: 9,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [230, 230, 230],
      fontStyle: "bold",
    },
    didDrawPage: () => {
      drawHeader();
      doc.setFontSize(9);
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    },
    margin: { top: 50 },
  });

  doc.save(`${examKey.toUpperCase()}_Class_${className}.pdf`);
};


  // FILTER LOGIC
  const filteredResults = results.filter((r) => {
    const student = getStudent(r);
    if (!student) return false;

    return (
      (searchClass === "" ||
        r.class.toLowerCase().includes(searchClass.toLowerCase())) &&
      (searchRoll === "" || String(student.rollNo || "").includes(searchRoll)) &&
      (searchName === "" ||
        student.name.toLowerCase().includes(searchName.toLowerCase()))
    );
  });

  return (
    <div style={{ padding: "20px" }}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={handleBackClick}>
          ← Back
        </button>
        <h2 style={styles.heading}>📘 Periodic Assessment Results</h2>
      </div>

      {/* FILTER BAR */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "20px",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search Class"
          value={searchClass}
          onChange={(e) => setSearchClass(e.target.value)}
          style={styles.input}
        />

        <input
          type="number"
          placeholder="Search Roll No"
          value={searchRoll}
          onChange={(e) => setSearchRoll(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Search Student Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={styles.input}
        />

        <select
          value={selectedPA}
          onChange={(e) => setSelectedPA(e.target.value)}
          style={styles.input}
        >
          <option value="pa1">PA1</option>
          <option value="pa2">PA2</option>
          <option value="pa3">PA3</option>
          <option value="pa4">PA4</option>
          <option value="sa1">SA1</option>
          <option value="sa2">SA2</option>
        </select>
      </div>

      {/* AGAR CLASS NA DALI HO TO TABLE MAT DIKHAAO */}
      {!searchClass.trim() ? (
        <p style={{ textAlign: "center", color: "#666" }}>
          Pehle <b>Class</b> daaliye, phir result dikhega.
        </p>
      ) : (
        ["pa1", "pa2", "pa3", "pa4", "sa1", "sa2"].includes(selectedPA) && (
          <div key={selectedPA} style={{ marginTop: "25px" }}>
            <h3 style={styles.paTitle}>{selectedPA.toUpperCase()} Report</h3>

            {classOptions.map((cls) => {
              // sirf wahi class jisme searchClass match kare
              if (!cls.toLowerCase().includes(searchClass.toLowerCase()))
                return null;

              const students = filteredResults
                .filter((r) => r.class === cls)
                .sort((a, b) => {
                  const sa = getStudent(a);
                  const sb = getStudent(b);
                  return (sa?.rollNo || 0) - (sb?.rollNo || 0);
                });

              if (!students.length) return null;

              const subjects = classSubjectMap[cls] || [];
              const perSubMax = getPerSubjectMax(selectedPA);

              // Consider only numeric subjects when computing class max
              const numericSubjects = subjects.filter((s) => !isDrawing(s));
              const maxMarks = numericSubjects.length * perSubMax;

              return (
                <div key={`${selectedPA}-${cls}`} style={{ marginBottom: "30px" }}>
                  <h4 style={styles.classTitle}>Class: {cls}</h4>

                  <div id={`pa-${selectedPA}-${cls}`} className="print-table-wrap">

                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Roll</th>
                          <th>Name</th>
                          {subjects.map((s) => (
                            <th key={s}>{s}</th>
                          ))}
                          <th>Total</th>
                          <th>%</th>
                        </tr>
                      </thead>

                      <tbody>
                        {students.map((r) => {
                          const student = getStudent(r);
                          if (!student) return null;

                          const storageKey = getExamStorageKey(selectedPA);
                          const exam = r.exams?.[storageKey] || {};

                          // Build marks info per subject: if drawing -> keep string, else numeric
                          const marksInfo = subjects.map((sub) => {
                            const raw = exam[sub];
                            if (isDrawing(sub)) {
                              // show letter grade as-is (or blank)
                              return { sub, display: raw || "", numeric: 0, isDrawing: true };
                            }
                            // numeric subjects: try parse float, fallback 0
                            const num = parseFloat(raw);
                            const numeric = Number.isFinite(num) ? num : 0;
                            return { sub, display: numeric, numeric, isDrawing: false };
                          });

                          const total = marksInfo.reduce((acc, mi) => acc + (mi.isDrawing ? 0 : mi.numeric), 0);
                          const percent = maxMarks ? ((total / maxMarks) * 100).toFixed(2) : "0.00";

                          return (
                            <tr key={r._id}>
                              <td>{student.rollNo}</td>
                              <td style={{ textAlign: "left", paddingLeft: 8 }}>{student.name}</td>
                              {marksInfo.map((m) => (
                                <td key={m.sub}>
                                  {m.isDrawing ? String(m.display || "") : formatCell(m.display, 0)}
                                </td>
                              ))}
                              <td>
                                <b>{formatCell(total, 0)}</b>
                              </td>
                              <td>
                                <b>{percent}%</b>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ textAlign: "center", marginTop: "10px" }}>
<button
  onClick={() =>
    printClassPA_PDF(selectedPA, cls, students, subjects)
  }
  style={styles.printBtn}
>
  📄 Download PDF – Class {cls}
</button>


                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

// STYLES
const styles = {
  input: {
    padding: "8px 12px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    minWidth: "150px",
  },
  paTitle: {
    background: "#eaf3ff",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "18px",
    color: "#1e40af",
  },
  classTitle: {
    margin: "15px 0 8px",
    fontSize: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  printBtn: {
    padding: "8px 16px",
    background: "green",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  backBtn: {
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1px solid #d1d5db",
    background: "#2563eb",
    cursor: "pointer",
    fontSize: "14px",
    color: "white",
  },
  heading: {
    margin: 0,
    textAlign: "center",
    flex: 1,
  },
};

export default ViewPAResults;
