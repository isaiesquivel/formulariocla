import { BecaFormData } from "@/types/BecaForm";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ── Logo loader ────────────────────────────────────────────
let logoBase64Cache: string | null = null;

async function loadLogo(): Promise<string | null> {
  if (logoBase64Cache) return logoBase64Cache;
  try {
    const response = await fetch("/images/logo-colegio.png");
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        logoBase64Cache = reader.result as string;
        resolve(logoBase64Cache);
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function addLogoToDoc(doc: jsPDF, logo: string | null, x: number, y: number, h: number = 18) {
  if (!logo) return;
  doc.addImage(logo, "PNG", x, y, h, h);
}

// ── Design tokens (matching HTML ficha) ────────────────────
const INK: [number, number, number] = [26, 26, 24];        // #1a1a18
const LABEL: [number, number, number] = [90, 87, 80];      // #5a5750
const MUTED: [number, number, number] = [154, 149, 144];   // #9a9590
const SECTION_BG: [number, number, number] = [245, 242, 238]; // #f5f2ee
const BORDER: [number, number, number] = [208, 204, 198];  // #d0ccc6
const LABEL_BG: [number, number, number] = [250, 249, 247]; // #faf9f7
const WHITE: [number, number, number] = [255, 255, 255];
const SIGN_LINE: [number, number, number] = [200, 196, 190]; // #c8c4be

// ── Helpers ────────────────────────────────────────────────
function drawHLine(doc: jsPDF, x1: number, y: number, x2: number, color: [number, number, number] = BORDER, width = 0.3) {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);
  doc.line(x1, y, x2, y);
}

function setFont(doc: jsPDF, style: "title" | "formTitle" | "sectionTitle" | "label" | "body" | "small" | "sign") {
  switch (style) {
    case "title":
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(...INK);
      break;
    case "formTitle":
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      break;
    case "sectionTitle":
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...LABEL);
      break;
    case "label":
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...LABEL);
      break;
    case "body":
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...INK);
      break;
    case "small":
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      break;
    case "sign":
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      break;
  }
}

// ── Section header (matching the HTML beige bar) ───────────
function addSectionBar(doc: jsPDF, title: string, y: number, ml: number, mr: number): number {
  const pw = doc.internal.pageSize.getWidth();
  const barW = pw - ml - mr;
  const barH = 7;

  if (y + barH > doc.internal.pageSize.getHeight() - 30) {
    doc.addPage();
    y = 20;
  }

  // Background
  doc.setFillColor(...SECTION_BG);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.rect(ml, y, barW, barH, "FD");

  // Text centered
  setFont(doc, "sectionTitle");
  doc.text(title.toUpperCase(), pw / 2, y + 4.8, { align: "center", charSpace: 1.2 });

  return y + barH;
}

// ── Key-value table (label | value pairs) ──────────────────
function addFieldTable(doc: jsPDF, rows: [string, string][], y: number, ml: number, mr: number, cols: 2 | 4 | 6 = 4): number {
  const pw = doc.internal.pageSize.getWidth();

  if (y > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    y = 20;
  }

  const pairsPerRow = cols / 2;
  const grouped: [string, string][][] = [];
  for (let i = 0; i < rows.length; i += pairsPerRow) {
    grouped.push(rows.slice(i, i + pairsPerRow));
  }

  const tableBody = grouped.map((group) => {
    const row: string[] = [];
    group.forEach(([label, value]) => {
      row.push(label);
      row.push(value || "—");
    });
    // Pad if incomplete row
    while (row.length < cols) {
      row.push("");
    }
    return row;
  });

  const colStyles: Record<number, any> = {};
  for (let i = 0; i < cols; i++) {
    if (i % 2 === 0) {
      // label column
      colStyles[i] = {
        fillColor: LABEL_BG,
        textColor: LABEL,
        fontSize: 7,
        fontStyle: "normal",
        cellWidth: 36,
      };
    } else {
      // value column
      colStyles[i] = {
        textColor: INK,
        fontSize: 8,
        cellWidth: "auto",
      };
    }
  }

  autoTable(doc, {
    startY: y,
    body: tableBody,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
      lineColor: BORDER,
      lineWidth: 0.3,
      textColor: INK,
      minCellHeight: 7,
    },
    columnStyles: colStyles,
    margin: { left: ml, right: mr },
    tableLineColor: BORDER,
    tableLineWidth: 0.3,
  });

  return (doc as any).lastAutoTable.finalY;
}

// ── Signature block ────────────────────────────────────────
function addSignatureArea(doc: jsPDF, y: number, ml: number) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const signY = Math.max(y + 20, ph - 45);

  const signX = pw / 2 - 30;

  // Sign line
  doc.setDrawColor(...SIGN_LINE);
  doc.setLineWidth(0.3);
  doc.line(signX, signY, signX + 60, signY);

  // Label
  setFont(doc, "sign");
  doc.text("FIRMA", signX + 30, signY + 5, { align: "center", charSpace: 0.8 });
}

// ── Footer ─────────────────────────────────────────────────
function addFooter(doc: jsPDF, ml: number, mr: number) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  drawHLine(doc, ml, ph - 14, pw - mr, BORDER, 0.2);
  setFont(doc, "small");
  doc.text("Documento generado electrónicamente · Confidencial", pw / 2, ph - 10, { align: "center" });
  doc.text(
    new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }),
    pw / 2, ph - 6,
    { align: "center" }
  );
}

// ── COLUMNS for bulk exports ───────────────────────────────
const COLUMNS = [
  { header: "Fecha", key: "timestamp" },
  { header: "Ciclo", key: "cicloEscolar" },
  { header: "Tipo de Apoyo", key: "tipoApoyo" },
  { header: "Alumno", key: "_alumnoNombre" },
  { header: "Nacimiento", key: "alumnoFechaNacimiento" },
  { header: "CURP", key: "alumnoCURP" },
  { header: "Domicilio", key: "alumnoDomicilio" },
  { header: "Ciudad", key: "alumnoCiudad" },
  { header: "Estado", key: "alumnoEstado" },
  { header: "CP", key: "alumnoCP" },
  { header: "Nivel", key: "alumnoNivelEducativo" },
  { header: "Grado", key: "alumnoGrado" },
  { header: "% Beca", key: "porcentajeBeca" },
  { header: "Padre/Tutor", key: "_padreNombre" },
  { header: "Tel. Padre", key: "padreTelefono" },
  { header: "Correo Padre", key: "padreCorreo" },
  { header: "Ingreso Padre", key: "padreIngresoMensual" },
  { header: "Madre", key: "_madreNombre" },
  { header: "Tel. Madre", key: "madreTelefono" },
  { header: "Correo Madre", key: "madreCorreo" },
  { header: "Ingreso Madre", key: "madreIngresoMensual" },
  { header: "Estado Civil", key: "estadoCivil" },
  { header: "Integrantes", key: "numIntegrantes" },
  { header: "Total Ingresos", key: "totalIngresosFamiliares" },
  { header: "Vivienda", key: "tipoVivienda" },
];

function toRow(s: BecaFormData): Record<string, string> {
  return {
    ...s,
    timestamp: new Date(s.timestamp).toLocaleDateString("es-MX"),
    _alumnoNombre: `${s.alumnoNombres} ${s.alumnoApellidoPaterno} ${s.alumnoApellidoMaterno}`,
    _padreNombre: `${s.padreNombres} ${s.padreApellidoPaterno} ${s.padreApellidoMaterno}`,
    _madreNombre: `${s.madreNombres} ${s.madreApellidoPaterno} ${s.madreApellidoMaterno}`,
    conformidad: s.conformidad ? "Sí" : "No",
  } as any;
}

// ── EXPORT: All submissions PDF (landscape table) ──────────
export async function exportToPDF(submissions: BecaFormData[]) {
  const logo = await loadLogo();
  const doc = new jsPDF({ orientation: "landscape" });
  const pw = doc.internal.pageSize.getWidth();

  // Header with logo
  addLogoToDoc(doc, logo, 15, 4, 20);
  setFont(doc, "title");
  doc.text("COLEGIO LOS ÁNGELES", pw / 2, 14, { align: "center", charSpace: 2 });
  setFont(doc, "formTitle");
  doc.text("REGISTRO DE SOLICITUDES DE BECA", pw / 2, 21, { align: "center", charSpace: 1 });
  drawHLine(doc, 15, 27, pw - 15, BORDER, 0.4);

  setFont(doc, "small");
  doc.text(`${submissions.length} solicitud(es) · Generado: ${new Date().toLocaleString("es-MX")}`, pw / 2, 32, { align: "center" });

  const rows = submissions.map((s) => {
    const r = toRow(s);
    return COLUMNS.map((c) => (r as any)[c.key] || "—");
  });

  autoTable(doc, {
    startY: 36,
    head: [COLUMNS.map((c) => c.header)],
    body: rows,
    theme: "grid",
    styles: {
      fontSize: 5.5,
      cellPadding: 2,
      textColor: INK,
      lineColor: BORDER,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: SECTION_BG,
      textColor: LABEL,
      fontSize: 5.5,
      fontStyle: "bold",
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: LABEL_BG,
    },
    bodyStyles: {
      fillColor: WHITE,
    },
    didDrawPage: () => {
      const ph = doc.internal.pageSize.getHeight();
      drawHLine(doc, 15, ph - 10, pw - 15, BORDER, 0.2);
      setFont(doc, "small");
      doc.text("Documento confidencial · Colegio", pw / 2, ph - 6, { align: "center" });
    },
  });

  doc.save("becas_solicitudes.pdf");
}

// ── EXPORT: Excel ──────────────────────────────────────────
export function exportToExcel(submissions: BecaFormData[]) {
  const data = submissions.map((s) => {
    const r = toRow(s);
    const obj: Record<string, string> = {};
    COLUMNS.forEach((c) => {
      obj[c.header] = (r as any)[c.key] || "";
    });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = COLUMNS.map((c) => ({
    wch: Math.max(c.header.length + 2, 14),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Solicitudes de Beca");
  XLSX.writeFile(wb, "becas_solicitudes.xlsx");
}

// ── EXPORT: Single premium ficha PDF ───────────────────────
export async function exportSinglePDF(s: BecaFormData) {
  const logo = await loadLogo();
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ML = 18; // margin left
  const MR = 18; // margin right

  // ── Logo + Outer title ──
  const logoSize = 22;
  addLogoToDoc(doc, logo, pw / 2 - logoSize / 2, 8, logoSize);

  setFont(doc, "title");
  doc.text("COLEGIO LOS ÁNGELES", pw / 2, 36, { align: "center", charSpace: 2 });
  doc.setFontSize(14);
  doc.text("SOLICITUD DE BECA", pw / 2, 43, { align: "center", charSpace: 1.5 });

  // ── Paper starts ──
  drawHLine(doc, ML, 48, pw - MR, BORDER, 0.5);

  // Form subtitle
  setFont(doc, "formTitle");
  doc.text("REGISTRO DE DATOS DEL ALUMNO Y FAMILIA", pw / 2, 54, { align: "center", charSpace: 1 });

  // ── Meta row: Folio, Ciclo, Fecha ──
  let y = 58;
  y = addFieldTable(doc, [
    ["Folio", s.id.slice(0, 8).toUpperCase()],
    ["Ciclo Escolar", s.cicloEscolar],
    ["Fecha", new Date(s.timestamp).toLocaleDateString("es-MX")],
  ], y, ML, MR, 6);

  // ── Tipo de apoyo row ──
  y += 1;
  autoTable(doc, {
    startY: y,
    body: [["Tipo de Apoyo: " + (s.tipoApoyo || "—") + "          Porcentaje de Beca: " + (s.porcentajeBeca || "—")]],
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: { top: 3, bottom: 3, left: 6, right: 6 },
      lineColor: BORDER,
      lineWidth: 0.3,
      textColor: INK,
    },
    margin: { left: ML, right: MR },
  });
  y = (doc as any).lastAutoTable.finalY;

  // ── I. Datos del Alumno ──
  y += 2;
  y = addSectionBar(doc, "I. Datos del Alumno", y, ML, MR);
  y = addFieldTable(doc, [
    ["Nombre(s)", s.alumnoNombres],
    ["Primer Apellido", s.alumnoApellidoPaterno],
    ["Segundo Apellido", s.alumnoApellidoMaterno],
    ["Fecha Nacimiento", s.alumnoFechaNacimiento],
    ["CURP", s.alumnoCURP],
    ["Nivel Educativo", s.alumnoNivelEducativo],
    ["Grado", s.alumnoGrado],
    ["% Beca", s.porcentajeBeca || "—"],
  ], y, ML, MR, 4);

  // ── II. Domicilio del Alumno ──
  y += 2;
  y = addSectionBar(doc, "II. Domicilio del Alumno", y, ML, MR);
  y = addFieldTable(doc, [
    ["Domicilio", s.alumnoDomicilio],
    ["Ciudad", s.alumnoCiudad],
    ["Estado", s.alumnoEstado],
    ["C.P.", s.alumnoCP],
  ], y, ML, MR, 4);

  // ── III. Datos del Padre / Tutor ──
  y += 2;
  y = addSectionBar(doc, "III. Datos del Padre / Tutor", y, ML, MR);
  y = addFieldTable(doc, [
    ["Nombre(s)", s.padreNombres],
    ["Primer Apellido", s.padreApellidoPaterno],
    ["Segundo Apellido", s.padreApellidoMaterno],
    ["Fecha Nacimiento", s.padreFechaNacimiento],
    ["Vive con Alumno", s.padreViveConAlumno],
    ["Domicilio", s.padreDomicilio],
    ["Teléfono", s.padreTelefono],
    ["Correo", s.padreCorreo],
    ["Puesto", s.padrePuesto],
    ["Lugar de Trabajo", s.padreLugarTrabajo],
    ["Ingreso Mensual", s.padreIngresoMensual],
    ["Ingresos Adicionales", s.padreIngresosAdicionales || "—"],
    ["Pensiones/Apoyos", s.padreIngresosPensiones || "—"],
    ["Ingresos Extras", s.padreIngresosExtras || "—"],
  ], y, ML, MR, 4);

  // ── IV. Datos de la Madre ──
  y += 2;
  y = addSectionBar(doc, "IV. Datos de la Madre", y, ML, MR);
  y = addFieldTable(doc, [
    ["Nombre(s)", s.madreNombres],
    ["Primer Apellido", s.madreApellidoPaterno],
    ["Segundo Apellido", s.madreApellidoMaterno],
    ["Fecha Nacimiento", s.madreFechaNacimiento],
    ["Vive con Alumno", s.madreViveConAlumno],
    ["Teléfono", s.madreTelefono],
    ["Correo", s.madreCorreo],
    ["Ingreso Mensual", s.madreIngresoMensual || "—"],
  ], y, ML, MR, 4);

  // ── V. Composición Familiar ──
  y += 2;
  y = addSectionBar(doc, "V. Composición Familiar", y, ML, MR);
  y = addFieldTable(doc, [
    ["Estado Civil", s.estadoCivil],
    ["No. Integrantes", s.numIntegrantes],
  ], y, ML, MR, 4);

  // Family members table
  if (s.miembros && s.miembros.length > 0) {
    y += 1;
    autoTable(doc, {
      startY: y,
      head: [["#", "Nombre", "Edad", "Escolaridad", "Escuela", "Situación Médica"]],
      body: s.miembros.map((m, i) => [String(i + 1), m.nombre, m.edad, m.escolaridad, m.escuela, m.situacionMedica]),
      theme: "grid",
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        textColor: INK,
        lineColor: BORDER,
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: SECTION_BG,
        textColor: LABEL,
        fontSize: 7,
        fontStyle: "normal",
      },
      alternateRowStyles: { fillColor: LABEL_BG },
      margin: { left: ML, right: MR },
    });
    y = (doc as any).lastAutoTable.finalY;
  }

  // ── VI. Egresos Mensuales ──
  y += 2;
  y = addSectionBar(doc, "VI. Egresos Mensuales", y, ML, MR);
  y = addFieldTable(doc, [
    ["Alimentación", s.alimentacion],
    ["Renta/Hipoteca", s.rentaHipoteca],
    ["Servicios", s.servicios],
    ["Transporte", s.transporte],
    ["Educación", s.educacion],
    ["Salud", s.salud],
    ["Deudas/Créditos", s.deudasCreditos],
    ["Recreación", s.recreacion],
    ["Total Ingresos", s.totalIngresosFamiliares],
    ["", ""],
  ], y, ML, MR, 4);

  // ── VII. Vivienda ──
  y += 2;
  y = addSectionBar(doc, "VII. Vivienda y Conformidad", y, ML, MR);
  y = addFieldTable(doc, [
    ["Tipo de Vivienda", s.tipoVivienda],
    ["Propiedades Adic.", s.propiedadesAdicionales],
    ["Conformidad", s.conformidad ? "Sí" : "No"],
    ["", ""],
  ], y, ML, MR, 4);

  // ── Signatures ──
  addSignatureArea(doc, y, ML);

  // ── Footer ──
  addFooter(doc, ML, MR);

  doc.save(`beca_${s.alumnoApellidoPaterno}_${s.alumnoNombres}.pdf`.replace(/\s/g, "_"));
}
