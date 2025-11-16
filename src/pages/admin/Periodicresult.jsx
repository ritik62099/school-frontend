// // src/pages/teacher/ViewPAResults.jsx
// import React, { useEffect, useState } from "react";
// import Logo from "../../assets/logo.png";
// import { endpoints } from "../../config/api";

// const ViewPAResults = () => {
//   const [results, setResults] = useState([]);
//   const [classSubjectMap, setClassSubjectMap] = useState({});
//   const [assignedClasses, setAssignedClasses] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Filters
//   const [searchClass, setSearchClass] = useState("");
//   const [searchRoll, setSearchRoll] = useState("");
//   const [searchName, setSearchName] = useState("");
//   const [selectedPA, setSelectedPA] = useState("pa1");

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     fetch(endpoints.auth.me, { headers: { Authorization: `Bearer ${token}` } })
//       .then(res => res.json())
//       .then(data => setAssignedClasses(data.assignedClasses || []));

//     fetch(endpoints.marks.list, { headers: { Authorization: `Bearer ${token}` } })
//       .then(res => res.json())
//       .then(data => setResults(data));

//     fetch(endpoints.classSubjects.getAll, { headers: { Authorization: `Bearer ${token}` } })
//       .then(res => res.json())
//       .then(mapping => setClassSubjectMap(mapping))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <h2>Loading...</h2>;

//   const classOptions = [...new Set(results.map((r) => r.class))];

//   const getStudent = (record) =>
//     typeof record.studentId === "object" ? record.studentId : null;

//   const printClassPA = (paKey, className) => {
//     const element = document.getElementById(`pa-${paKey}-${className}`);
//     if (!element) return;

//     const win = window.open("", "_blank");
//     win.document.write(`
//       <html>
//         <head>
//           <title>${paKey.toUpperCase()} - Class ${className}</title>
//           <style>
//             body { font-family: Poppins; padding: 20px; }
//             table { width: 100%; border-collapse: collapse; font-size: 12px; }
//             th, td { border: 1px solid #000; padding: 5px; text-align: center; }
//             .header { display:flex; align-items:center; margin-bottom:20px; }
//             .header img { width:60px; margin-right:10px; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <img src="${Logo}" />
//             <h2>Ambika International School<br>${paKey.toUpperCase()} Report - Class ${className}</h2>
//           </div>
//           ${element.innerHTML}
//         </body>
//       </html>
//     `);
//     win.document.close();
//     win.print();
//   };

//   // Filter Logic
//   const filteredResults = results.filter(r => {
//     const student = getStudent(r);
//     if (!student) return false;

//     return (
//       (searchClass === "" || r.class.toLowerCase().includes(searchClass.toLowerCase())) &&
//       (searchRoll === "" || student.rollNo?.toString().includes(searchRoll)) &&
//       (searchName === "" || student.name.toLowerCase().includes(searchName.toLowerCase()))
//     );
//   });

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2 style={{ textAlign: "center" }}>📘 Periodic Assessment Results</h2>

//       {/* =================== FILTER BAR =================== */}
//       <div
//         style={{
//           display: "flex",
//           flexWrap: "wrap",
//           gap: "10px",
//           marginBottom: "20px",
//           justifyContent: "center",
//         }}
//       >
//         <input
//           type="text"
//           placeholder="Search Class"
//           value={searchClass}
//           onChange={(e) => setSearchClass(e.target.value)}
//           style={styles.input}
//         />

//         <input
//           type="number"
//           placeholder="Search Roll No"
//           value={searchRoll}
//           onChange={(e) => setSearchRoll(e.target.value)}
//           style={styles.input}
//         />

//         <input
//           type="text"
//           placeholder="Search Student Name"
//           value={searchName}
//           onChange={(e) => setSearchName(e.target.value)}
//           style={styles.input}
//         />

//         <select
//           value={selectedPA}
//           onChange={(e) => setSelectedPA(e.target.value)}
//           style={styles.input}
//         >
//           <option value="pa1">PA1</option>
//           <option value="pa2">PA2</option>
//           <option value="pa3">PA3</option>
//           <option value="pa4">PA4</option>
//         </select>
//       </div>

//       {/* =================== SELECTED PA TABLE =================== */}
//       {["pa1", "pa2", "pa3", "pa4"].includes(selectedPA) && (
//         <div key={selectedPA} style={{ marginTop: "25px" }}>
//           <h3 style={styles.paTitle}>{selectedPA.toUpperCase()} Report</h3>

//           {classOptions.map((cls) => {
//             const students = filteredResults.filter((r) => r.class === cls);
//             if (!students.length) return null;

//             const subjects = classSubjectMap[cls] || [];

//             return (
//               <div key={`${selectedPA}-${cls}`} style={{ marginBottom: "30px" }}>
//                 <h4 style={styles.classTitle}>Class: {cls}</h4>

//                 <div id={`pa-${selectedPA}-${cls}`} style={{ overflowX: "auto" }}>
//                   <table style={styles.table}>
//                     <thead>
//                       <tr>
//                         <th>Roll</th>
//                         <th>Name</th>
//                         {subjects.map((s) => (
//                           <th key={s}>{s}</th>
//                         ))}
//                         <th>Total</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {students.map((r) => {
//                         const student = getStudent(r);
//                         if (!student) return null;

//                         const exam = r.exams?.[selectedPA] || {};
//                         const marks = subjects.map((sub) => exam[sub] || 0);
//                         const total = marks.reduce((a, b) => a + b, 0);

//                         return (
//                           <tr key={r._id}>
//                             <td>{student.rollNo}</td>
//                             <td>{student.name}</td>
//                             {marks.map((m, idx) => (
//                               <td key={idx}>{m}</td>
//                             ))}
//                             <td><b>{total}</b></td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>

//                 <div style={{ textAlign: "center", marginTop: "10px" }}>
//                   <button
//                     onClick={() => printClassPA(selectedPA, cls)}
//                     style={styles.printBtn}
//                   >
//                     🖨 Print Class {cls}
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// // ---------------- STYLES ----------------
// const styles = {
//   input: {
//     padding: "8px 12px",
//     fontSize: "14px",
//     borderRadius: "5px",
//     border: "1px solid #ccc",
//     minWidth: "150px",
//   },
//   paTitle: {
//     background: "#eaf3ff",
//     padding: "10px",
//     borderRadius: "6px",
//     fontSize: "18px",
//     color: "#1e40af",
//   },
//   classTitle: {
//     margin: "15px 0 8px",
//     fontSize: "16px",
//   },
//   table: {
//     width: "100%",
//     borderCollapse: "collapse",
//     fontSize: "14px",
//   },
//   printBtn: {
//     padding: "8px 16px",
//     background: "green",
//     color: "#fff",
//     border: "none",
//     borderRadius: "5px",
//     cursor: "pointer",
//   },
// };

// export default ViewPAResults;

// src/pages/teacher/ViewPAResults.jsx
import React, { useEffect, useState } from "react";
import Logo from "../../assets/logo.png";
import { endpoints } from "../../config/api";

const ViewPAResults = () => {
  const [results, setResults] = useState([]);
  const [classSubjectMap, setClassSubjectMap] = useState({});
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchClass, setSearchClass] = useState("");
  const [searchRoll, setSearchRoll] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedPA, setSelectedPA] = useState("pa1");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(endpoints.auth.me, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setAssignedClasses(data.assignedClasses || []));

    fetch(endpoints.marks.list, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setResults(data));

    fetch(endpoints.classSubjects.getAll, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((mapping) => setClassSubjectMap(mapping))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <h2>Loading...</h2>;

  const classOptions = [...new Set(results.map((r) => r.class))];

  const getStudent = (record) =>
    typeof record.studentId === "object" ? record.studentId : null;

  // PRINT
  const printClassPA = (paKey, className) => {
    const element = document.getElementById(`pa-${paKey}-${className}`);
    if (!element) return;

    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>${paKey.toUpperCase()} - Class ${className}</title>
          <style>
            body { font-family: Poppins; padding: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #000; padding: 5px; text-align: center; }
            .header { display:flex; align-items:center; margin-bottom:20px; }
            .header img { width:60px; margin-right:10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${Logo}" />
            <h2>Ambika International School<br>${paKey.toUpperCase()} Report - Class ${className}</h2>
          </div>
          ${element.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  // FILTER LOGIC
  const filteredResults = results.filter((r) => {
    const student = getStudent(r);
    if (!student) return false;

    return (
      (searchClass === "" || r.class.toLowerCase().includes(searchClass.toLowerCase())) &&
      (searchRoll === "" || student.rollNo?.toString().includes(searchRoll)) &&
      (searchName === "" || student.name.toLowerCase().includes(searchName.toLowerCase()))
    );
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>📘 Periodic Assessment Results</h2>

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
        </select>
      </div>

      {/* SELECTED PA TABLE */}
      {["pa1", "pa2", "pa3", "pa4"].includes(selectedPA) && (
        <div key={selectedPA} style={{ marginTop: "25px" }}>
          <h3 style={styles.paTitle}>{selectedPA.toUpperCase()} Report</h3>

          {classOptions.map((cls) => {
            const students = filteredResults
              .filter((r) => r.class === cls)
              .sort((a, b) => {
                const sa = getStudent(a);
                const sb = getStudent(b);
                return (sa?.rollNo || 0) - (sb?.rollNo || 0);
              });

            if (!students.length) return null;

            const subjects = classSubjectMap[cls] || [];
            const maxMarks = subjects.length * 20; // change if needed

            return (
              <div key={`${selectedPA}-${cls}`} style={{ marginBottom: "30px" }}>
                <h4 style={styles.classTitle}>Class: {cls}</h4>

                <div id={`pa-${selectedPA}-${cls}`} style={{ overflowX: "auto" }}>
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

                        const exam = r.exams?.[selectedPA] || {};
                        const marks = subjects.map((sub) => exam[sub] || 0);

                        const total = marks.reduce((a, b) => a + b, 0);
                        const percent = ((total / maxMarks) * 100).toFixed(2);

                        return (
                          <tr key={r._id}>
                            <td>{student.rollNo}</td>
                            <td>{student.name}</td>
                            {marks.map((m, idx) => (
                              <td key={idx}>{m}</td>
                            ))}
                            <td><b>{total}</b></td>
                            <td><b>{percent}%</b></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <button
                    onClick={() => printClassPA(selectedPA, cls)}
                    style={styles.printBtn}
                  >
                    🖨 Print Class {cls}
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
};

export default ViewPAResults;
