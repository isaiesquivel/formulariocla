import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSubmissions, deleteSubmission } from "@/lib/storage";
import { BecaFormData } from "@/types/BecaForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { LogOut, Eye, Trash2, RefreshCw, Users, FileDown, FileSpreadsheet, FileText, Search, X, ChartBar as BarChart2, FileImage } from "lucide-react";
import { exportToPDF, exportToExcel, exportSinglePDF } from "@/lib/exportUtils";
import logoColegio from "@/assets/logo-colegio.png";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const NIVELES = ["Estancia infantil", "Pre maternal", "Maternal", "Jardín de Niños", "Primaria", "Secundaria", "Preparatoria"];
const TIPOS_APOYO = [
  "Nueva solicitud de beca",
  "Beca por situación económica",
  "Beca por rendimiento académico",
  "Beca por convenio con empresa",
  "Beca excelencia académica (Exclusiva para alumnos ya beneficiados)",
  "Beca Personal CLA — Refrendo",
  "Refrendo primera vez personal CLA",
];

// Paleta de colores para gráficas
const COLORS = [
  "#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed",
  "#0891b2", "#be185d", "#065f46",
];

// Abreviatura para los tipos de apoyo (para los ejes)
const TIPO_SHORT: Record<string, string> = {
  "Nueva solicitud de beca": "Nueva",
  "Beca por situación económica": "Situación Econ.",
  "Beca por rendimiento académico": "Rendimiento",
  "Beca por convenio con empresa": "Convenio",
  "Beca excelencia académica (Exclusiva para alumnos ya beneficiados)": "Excelencia",
  "Beca Personal CLA — Refrendo": "CLA Refrendo",
  "Refrendo primera vez personal CLA": "1ª vez CLA",
};

// Colores por tipo de apoyo para el tooltip
function ColorDot({ color }: { color: string }) {
  return <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: color, marginRight: 6 }} />;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<BecaFormData[]>([]);
  const [selected, setSelected] = useState<BecaFormData | null>(null);
  const [showCharts, setShowCharts] = useState(false);
  const [consentPreview, setConsentPreview] = useState<{ nombre: string; b64: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [filterNivel, setFilterNivel] = useState("all");
  const [filterTipo, setFilterTipo] = useState("all");

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") !== "true") {
      navigate("/admin", { replace: true });
      return;
    }
    refresh();
  }, [navigate]);

  const refresh = async () => {
    try {
      const data = await getSubmissions();
      setSubmissions(data);
    } catch (error: any) {
      toast({
        title: "Error al cargar solicitudes",
        description: error.message,
        variant: "destructive"
      });
      console.error("Error loading submissions:", error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSubmission(deleteId);
      await refresh();
      toast({ title: "Solicitud eliminada" });
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const logout = () => {
    sessionStorage.removeItem("admin_auth");
    navigate("/admin");
  };

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const fullName = `${s.alumnoNombres} ${s.alumnoApellidoPaterno} ${s.alumnoApellidoMaterno}`.toLowerCase();
      if (searchName && !fullName.includes(searchName.toLowerCase())) return false;
      if (filterNivel !== "all" && s.alumnoNivelEducativo !== filterNivel) return false;
      if (filterTipo !== "all" && s.tipoApoyo !== filterTipo) return false;
      return true;
    });
  }, [submissions, searchName, filterNivel, filterTipo]);

  const hasFilters = searchName || filterNivel !== "all" || filterTipo !== "all";

  const clearFilters = () => {
    setSearchName("");
    setFilterNivel("all");
    setFilterTipo("all");
  };

  // ─── Datos para gráficas ────────────────────────────────────────────────────

  // Pie chart: conteo por tipo de apoyo (de todas las solicitudes)
  const dataByTipo = useMemo(() => {
    const map: Record<string, number> = {};
    submissions.forEach((s) => {
      const k = s.tipoApoyo || "Sin especificar";
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      short: TIPO_SHORT[name] || name,
      value,
    }));
  }, [submissions]);

  // Bar chart apilado: nivel educativo × tipo de apoyo
  const dataByNivel = useMemo(() => {
    const nivelMap: Record<string, Record<string, number>> = {};
    submissions.forEach((s) => {
      const nivel = s.alumnoNivelEducativo || "Sin especificar";
      const tipo = TIPO_SHORT[s.tipoApoyo] || s.tipoApoyo || "Sin especificar";
      if (!nivelMap[nivel]) nivelMap[nivel] = {};
      nivelMap[nivel][tipo] = (nivelMap[nivel][tipo] || 0) + 1;
    });
    return Object.entries(nivelMap).map(([nivel, tipos]) => ({ nivel, ...tipos }));
  }, [submissions]);

  // Tipos únicos en los datos (para las barras del stacked chart)
  const tiposUnicos = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => set.add(TIPO_SHORT[s.tipoApoyo] || s.tipoApoyo || "Sin especificar"));
    return Array.from(set);
  }, [submissions]);

  // ─── Visor de consentimiento ─────────────────────────────────────────────────

  const handleViewConsent = async (s: BecaFormData) => {
    const nombre = (s as any).consentimientoNombre;
    if (!nombre) {
      toast({ title: "Sin consentimiento", description: "Esta solicitud no tiene un archivo adjunto.", variant: "destructive" });
      return;
    }
    toast({ title: "Funcionalidad deshabilitada", description: "La visualización de archivos de consentimiento no está disponible actualmente.", variant: "destructive" });
  };

  // Determinar el tipo MIME a partir del nombre de archivo
  const getMimeType = (nombre: string) => {
    const ext = nombre?.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "application/pdf";
    if (["jpg", "jpeg"].includes(ext ?? "")) return "image/jpeg";
    if (ext === "png") return "image/png";
    if (ext === "webp") return "image/webp";
    return "application/octet-stream";
  };

  const buildDataUrl = (b64: string, nombre: string) =>
    `data:${getMimeType(nombre)};base64,${b64}`;

  const DetailRow = ({ label, value }: { label: string; value: string | boolean | undefined }) => (
    <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{typeof value === "boolean" ? (value ? "Sí" : "No") : value || "—"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border py-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center gap-2 relative">
          <img src={logoColegio} alt="Logo Colegio Los Ángeles" className="w-14 h-14 object-contain" />
          <p className="text-muted-foreground text-sm">Colegio Los Ángeles de Torreón</p>
          <h1 className="text-xl font-display font-bold text-foreground">Panel de Control — Becas</h1>
          <Button variant="outline" size="sm" onClick={logout} className="absolute right-4 top-4">
            <LogOut className="w-4 h-4 mr-2" /> Salir
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Stats + Export row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {filtered.length} de {submissions.length} solicitud(es)
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button
              variant={showCharts ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCharts((v) => !v)}
            >
              <BarChart2 className="w-4 h-4 mr-1" /> {showCharts ? "Ocultar" : "Estadísticas"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToPDF(filtered)} disabled={filtered.length === 0}>
              <FileDown className="w-4 h-4 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToExcel(filtered)} disabled={filtered.length === 0}>
              <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
            </Button>
          </div>
        </div>

        {/* ── Sección de Gráficas ── */}
        {showCharts && submissions.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {/* Bar chart: distribución por tipo de apoyo */}
            <div className="bg-card rounded-xl shadow p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                Distribución por Tipo de Beca
              </h3>
              {dataByTipo.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={dataByTipo} margin={{ top: 4, right: 8, left: -16, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="short"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value, name) => [`${value} solicitud(es)`, "Cantidad"]}
                    />
                    <Bar
                      dataKey="value"
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {showCharts && submissions.length === 0 && (
          <div className="bg-card rounded-xl shadow p-8 text-center">
            <p className="text-muted-foreground">No hay datos para mostrar en las gráficas.</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-xl shadow p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Buscar por nombre</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Nombre del alumno..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="w-[200px]">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nivel educativo</label>
            <Select value={filterNivel} onValueChange={setFilterNivel}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los niveles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                {NIVELES.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[280px]">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo de apoyo</label>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {TIPOS_APOYO.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="w-4 h-4 mr-1" /> Limpiar
            </Button>
          )}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="bg-card rounded-xl shadow p-12 text-center">
            <p className="text-muted-foreground">
              {submissions.length === 0 ? "No hay solicitudes registradas." : "No se encontraron solicitudes con los filtros seleccionados."}
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Tipo de Apoyo</TableHead>
                  <TableHead>Consent.</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-sm">{new Date(s.timestamp).toLocaleDateString("es-MX")}</TableCell>
                    <TableCell className="font-medium">{s.alumnoNombres} {s.alumnoApellidoPaterno} {s.alumnoApellidoMaterno}</TableCell>
                    <TableCell className="text-sm">{s.alumnoNivelEducativo}</TableCell>
                    <TableCell className="text-sm max-w-[180px] truncate" title={s.tipoApoyo}>{s.tipoApoyo}</TableCell>
                    <TableCell>
                      {(s as any).consentimientoNombre ? (
                        <Button variant="ghost" size="sm" onClick={() => handleViewConsent(s)} title="Ver consentimiento firmado">
                          <FileImage className="w-4 h-4 text-green-600" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(s)} title="Ver detalle">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => exportSinglePDF(s)} title="Exportar PDF">
                        <FileText className="w-4 h-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(s.id)} title="Eliminar">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ── Modal: Detalle de Solicitud ── */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="font-display">Detalle de Solicitud</DialogTitle>
          </DialogHeader>
          {selected && (
            <ScrollArea className="max-h-[65vh] pr-4">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-primary border-b pb-1">Tipo de Apoyo</h4>
                <DetailRow label="Ciclo" value={selected.cicloEscolar} />
                <DetailRow label="Tipo" value={selected.tipoApoyo} />

                <h4 className="text-sm font-bold text-primary border-b pb-1 mt-4">Datos del Alumno</h4>
                <DetailRow label="Nombre completo" value={`${selected.alumnoNombres} ${selected.alumnoApellidoPaterno} ${selected.alumnoApellidoMaterno}`} />
                <DetailRow label="Fecha nacimiento" value={selected.alumnoFechaNacimiento} />
                <DetailRow label="CURP" value={selected.alumnoCURP} />
                <DetailRow label="Domicilio" value={selected.alumnoDomicilio} />
                <DetailRow label="Ciudad" value={selected.alumnoCiudad} />
                <DetailRow label="Estado" value={selected.alumnoEstado} />
                <DetailRow label="CP" value={selected.alumnoCP} />
                <DetailRow label="Nivel Educativo" value={selected.alumnoNivelEducativo} />
                <DetailRow label="Grado" value={selected.alumnoGrado} />

                <h4 className="text-sm font-bold text-primary border-b pb-1 mt-4">Datos del Padre/Tutor</h4>
                <DetailRow label="Nombre" value={`${selected.padreNombres} ${selected.padreApellidoPaterno} ${selected.padreApellidoMaterno}`} />
                <DetailRow label="Fecha nacimiento" value={selected.padreFechaNacimiento} />
                <DetailRow label="Vive con alumno" value={selected.padreViveConAlumno} />
                <DetailRow label="Domicilio" value={selected.padreDomicilio} />
                <DetailRow label="Teléfono" value={selected.padreTelefono} />
                <DetailRow label="Correo" value={selected.padreCorreo} />
                <DetailRow label="Puesto" value={selected.padrePuesto} />
                <DetailRow label="Lugar trabajo" value={selected.padreLugarTrabajo} />
                <DetailRow label="Ingreso mensual" value={selected.padreIngresoMensual} />
                <DetailRow label="Ingresos adicionales" value={selected.padreIngresosAdicionales} />
                <DetailRow label="Pensiones/apoyos" value={selected.padreIngresosPensiones} />

                <h4 className="text-sm font-bold text-primary border-b pb-1 mt-4">Datos de la Madre</h4>
                <DetailRow label="Nombre" value={`${selected.madreNombres} ${selected.madreApellidoPaterno} ${selected.madreApellidoMaterno}`} />
                <DetailRow label="Fecha nacimiento" value={selected.madreFechaNacimiento} />
                <DetailRow label="Vive con alumno" value={selected.madreViveConAlumno} />
                <DetailRow label="Teléfono" value={selected.madreTelefono} />
                <DetailRow label="Correo" value={selected.madreCorreo} />
                <DetailRow label="Ingreso mensual" value={selected.madreIngresoMensual} />

                <h4 className="text-sm font-bold text-primary border-b pb-1 mt-4">Familia</h4>
                <DetailRow label="Estado civil" value={selected.estadoCivil} />
                <DetailRow label="Integrantes" value={selected.numIntegrantes} />

                <h4 className="text-sm font-bold text-primary border-b pb-1 mt-4">Egresos</h4>
                <DetailRow label="Alimentación" value={selected.alimentacion} />
                <DetailRow label="Renta/Hipoteca" value={selected.rentaHipoteca} />
                <DetailRow label="Servicios" value={selected.servicios} />
                <DetailRow label="Transporte" value={selected.transporte} />
                <DetailRow label="Educación" value={selected.educacion} />
                <DetailRow label="Salud" value={selected.salud} />
                <DetailRow label="Deudas" value={selected.deudasCreditos} />
                <DetailRow label="Recreación" value={selected.recreacion} />
                <DetailRow label="Total ingresos" value={selected.totalIngresosFamiliares} />

                <h4 className="text-sm font-bold text-primary border-b pb-1 mt-4">Vivienda</h4>
                <DetailRow label="Tipo" value={selected.tipoVivienda} />
                <DetailRow label="Propiedades adicionales" value={selected.propiedadesAdicionales} />
                <DetailRow label="Conformidad" value={selected.conformidad} />

                {/* Consentimiento firmado */}
                {(selected as any).consentimientoB64 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-primary border-b pb-1 mb-3">Consentimiento Informado Firmado</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewConsent(selected)}
                      className="w-full"
                    >
                      <FileImage className="w-4 h-4 mr-2 text-green-600" />
                      Ver archivo: {(selected as any).consentimientoNombre || "consentimiento"}
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal: Visor de Consentimiento ── */}
      <Dialog open={!!consentPreview} onOpenChange={() => setConsentPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-border">
            <DialogTitle className="font-display flex items-center gap-2">
              <FileImage className="w-5 h-5 text-green-600" />
              Consentimiento Informado Firmado
              {consentPreview && (
                <span className="text-xs text-muted-foreground font-normal ml-2">
                  {consentPreview.nombre}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {consentPreview && (() => {
            const mimeType = getMimeType(consentPreview.nombre);
            const dataUrl = buildDataUrl(consentPreview.b64, consentPreview.nombre);

            if (mimeType === "application/pdf") {
              return (
                <div className="w-full" style={{ height: "75vh" }}>
                  <iframe
                    src={dataUrl}
                    title="Consentimiento firmado"
                    className="w-full h-full border-0"
                  />
                </div>
              );
            }

            // Imagen (JPG, PNG, WEBP)
            return (
              <ScrollArea className="max-h-[75vh]">
                <div className="flex items-center justify-center p-4 bg-muted/30">
                  <img
                    src={dataUrl}
                    alt="Consentimiento firmado"
                    className="max-w-full rounded-lg shadow-md"
                    style={{ maxHeight: "70vh", objectFit: "contain" }}
                  />
                </div>
              </ScrollArea>
            );
          })()}
          <div className="px-6 py-3 border-t border-border flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Archivo almacenado localmente en la base de datos SQLite del browser.
            </p>
            {consentPreview && (
              <a
                href={buildDataUrl(consentPreview.b64, consentPreview.nombre)}
                download={consentPreview.nombre}
                className="text-xs font-medium text-primary hover:underline"
              >
                Descargar archivo
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Confirmación de eliminación ── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar solicitud?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La solicitud será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
