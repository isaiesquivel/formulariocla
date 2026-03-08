import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BecaFormData, EMPTY_FORM, FamilyMember, RecomendacionMember } from "@/types/BecaForm";
import { FormFieldInput, FormRadioField } from "@/components/form/FormField";
import { saveSubmission } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Send, CheckCircle2, ExternalLink } from "lucide-react";
import logoColegio from "@/assets/logo-colegio.png";

const STEPS = [
  "Tipo de Apoyo",
  "Datos del Alumno",
  "Datos del Padre/Tutor",
  "Datos de la Madre",
  "Datos Familiares",
  "Egresos Mensuales",
  "Vivienda y Conformidad",
];

const NIVELES = ["Estancia infantil", "Pre maternal", "Maternal", "Jardín de Niños", "Primaria", "Secundaria", "Preparatoria"];
const TIPOS_APOYO = [
  "Nueva solicitud de beca",
  "Beca por situación económica",
  "Beca por rendimiento académico",
  "Beca por convenio con empresa",
  "Beca excelencia académica (Exclusiva para alumnos ya beneficiados)",
  "Beca Personal CLA — Refrendo",
  "Beca por beneficios de recomendación",
];
const ESTADOS_CIVILES = ["Casados", "Unión Libre", "Separados", "Divorciados", "Madre/Padre soltero", "Viudez"];
const TIPOS_VIVIENDA = ["Propia", "Propia con crédito/hipoteca", "Rentada", "Prestada", "Compartida con familiares"];

const DOCS_NUEVA_SOLICITUD = [
  "Copia de acta de nacimiento del alumno",
  "CURP del alumno",
  "Boleta de calificaciones (más reciente)",
  "Carta de no adeudo",
  "Comprobante de domicilio",
  "INE (padre, madre o tutor)",
  "Comprobante de ingresos correspondientes a los últimos 3 meses",
];

const DOCS_DEFAULT = [
  "Copia de acta de nacimiento del alumno",
  "CURP del alumno",
  "Boleta de calificaciones (más reciente)",
  "Carta de no adeudo",
  "Comprobante de domicilio",
  "INE (padre, madre o tutor)",
  "Tarjeta de Reciprocidad CLA",
];

const TARJETA_LINK = "https://drive.google.com/file/d/1hyyNZpFn1ZmlF8J74v8y4Y_U15PsTeQC/view?usp=drive_link";

export default function BecaFormPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BecaFormData>({ ...EMPTY_FORM });
  const [submitted, setSubmitted] = useState(false);

  const [porcentajeBecaActual, setPorcentajeBecaActual] = useState("");

  const set = (field: keyof BecaFormData, value: string | boolean | FamilyMember[] | RecomendacionMember[]) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));


  const handleSubmit = async () => {
    if (!form.conformidad) {
      toast({ title: "Debe aceptar la conformidad", variant: "destructive" });
      return;
    }
    try {
      await saveSubmission({
        ...form,
        consentimientoNombre: '',
        consentimientoB64: '',
      } as any);
      setSubmitted(true);
      toast({ title: "Solicitud enviada correctamente" });
    } catch (err: any) {
      toast({ title: "Error al guardar la solicitud", description: err.message, variant: "destructive" });
    }
  };

  const updateMember = (idx: number, field: keyof FamilyMember, value: string) => {
    const members = [...form.miembros];
    members[idx] = { ...members[idx], [field]: value };
    set("miembros", members);
  };

  const updateRecomendacionMember = (idx: number, field: keyof RecomendacionMember, value: string) => {
    const members = [...form.miembrosRecomendacion];
    members[idx] = { ...members[idx], [field]: value };
    set("miembrosRecomendacion", members);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-xl shadow-lg p-10 text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">¡Solicitud Enviada!</h2>
          <p className="text-muted-foreground mb-6">Tu solicitud de beca ha sido recibida exitosamente. Nos pondremos en contacto contigo.</p>
          <Button onClick={() => { setSubmitted(false); setForm({ ...EMPTY_FORM }); setStep(0); }}>
            Enviar otra solicitud
          </Button>
        </div>
      </div>
    );
  }

  const docsToShow = form.tipoApoyo === "Nueva solicitud de beca" ? DOCS_NUEVA_SOLICITUD : DOCS_DEFAULT;
  const isNuevaSolicitud = form.tipoApoyo === "Nueva solicitud de beca";
  const isBecaRecomendacion = form.tipoApoyo === "Beca por beneficios de recomendación";

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="form-section-title">Indicaciones para la Selección de Modalidad de Beca</h3>
            <div className="text-sm text-muted-foreground space-y-2 border-l-4 border-primary pl-4">
              <p>Seleccione cuidadosamente el ciclo escolar correspondiente y el tipo de apoyo que desea solicitar.</p>
              <p>Es importante elegir la opción correcta, ya que cada modalidad tiene requisitos y criterios de evaluación específicos conforme al <span className="font-semibold text-foreground">Reglamento de Becas vigente</span>.</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Si el alumno <span className="font-semibold text-foreground">ya cuenta con una beca</span> y desea renovarla, deberá seleccionar la modalidad que actualmente tiene asignada.</li>
                <li>Si el alumno <span className="font-semibold text-foreground">no cuenta con beca vigente</span>, deberá elegir la opción <span className="font-semibold text-foreground">Nueva Solicitud de Beca</span>.</li>
                <li>La opción <span className="font-semibold text-foreground">"Beca Excelencia Académica"</span> es exclusiva para alumnos que ya fueron previamente beneficiados con esta distinción.</li>
              </ul>
              <p className="italic">La selección incorrecta no garantiza la asignación del apoyo y podrá requerir corrección o ajuste durante el proceso de revisión.</p>
            </div>
            <FormFieldInput label="Fecha de inscripción" field="cicloEscolar" value={form.cicloEscolar} onChange={set} required placeholder="Ej. 2026-2027" />
            <FormRadioField label="Tipo de apoyo" field="tipoApoyo" options={TIPOS_APOYO} required value={form.tipoApoyo as string} onChange={set} />

            {/* Beca por beneficios de recomendación */}
            {isBecaRecomendacion && (
              <div className="border border-primary/30 bg-primary/5 rounded-lg p-4 space-y-4">
                <h4 className="text-sm font-semibold text-primary">Beca por Beneficios de Recomendación</h4>
                <div className="space-y-1.5">
                  <Label className="form-field-label">Número de miembros recomendados <span className="text-destructive">*</span></Label>
                  <Select
                    value={form.numMiembrosRecomendacion}
                    onValueChange={(v) => {
                      const n = parseInt(v);
                      const existing = form.miembrosRecomendacion;
                      const newMembers: RecomendacionMember[] = Array.from({ length: n }, (_, i) =>
                        existing[i] || { apellidoPaterno: "", apellidoMaterno: "", nombre: "", grado: "", nombrePadreTutor: "", telefonoPadreTutor: "" }
                      );
                      set("numMiembrosRecomendacion", v);
                      set("miembrosRecomendacion", newMembers);
                    }}
                  >
                    <SelectTrigger className="bg-background w-32"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {form.miembrosRecomendacion.map((m, i) => (
                  <div key={i} className="bg-background border border-border rounded-lg p-4 space-y-3">
                    <p className="text-sm font-semibold text-primary">Registro {i + 1}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Apellido Paterno</Label>
                        <Input value={m.apellidoPaterno} onChange={(e) => updateRecomendacionMember(i, "apellidoPaterno", e.target.value)} className="bg-muted/30" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Apellido Materno</Label>
                        <Input value={m.apellidoMaterno} onChange={(e) => updateRecomendacionMember(i, "apellidoMaterno", e.target.value)} className="bg-muted/30" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Nombre(s)</Label>
                        <Input value={m.nombre} onChange={(e) => updateRecomendacionMember(i, "nombre", e.target.value)} className="bg-muted/30" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Grado</Label>
                        <Input value={m.grado} onChange={(e) => updateRecomendacionMember(i, "grado", e.target.value)} className="bg-muted/30" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Nombre del Padre o Tutor</Label>
                        <Input value={m.nombrePadreTutor} onChange={(e) => updateRecomendacionMember(i, "nombrePadreTutor", e.target.value)} className="bg-muted/30" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Teléfono del Padre o Tutor</Label>
                        <Input value={m.telefonoPadreTutor} onChange={(e) => updateRecomendacionMember(i, "telefonoPadreTutor", e.target.value)} className="bg-muted/30" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {form.tipoApoyo === "Beca Personal CLA — Refrendo" && (
              <div className="space-y-1.5">
                <Label className="form-field-label">Porcentaje de beca actual</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={porcentajeBecaActual === '' ? '0' : porcentajeBecaActual}
                    onChange={(e) => {
                      const val = e.target.value.replace('%', '').trim();
                      setPorcentajeBecaActual(val);
                      if (form.refrendo === "Refrendo") {
                        set("porcentajeBeca", val);
                      }
                    }}
                    className="bg-background w-28"
                    placeholder="0"
                  />
                  <span className="text-foreground font-medium">%</span>
                </div>
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="form-section-title">Datos del Alumno/a</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldInput label="Apellido Paterno" field="alumnoApellidoPaterno" required value={form.alumnoApellidoPaterno} onChange={set} />
              <FormFieldInput label="Apellido Materno" field="alumnoApellidoMaterno" required value={form.alumnoApellidoMaterno} onChange={set} />
              <FormFieldInput label="Nombre(s)" field="alumnoNombres" required value={form.alumnoNombres} onChange={set} />
              <FormFieldInput label="Fecha de nacimiento" field="alumnoFechaNacimiento" type="date" required value={form.alumnoFechaNacimiento} onChange={set} />
              <FormFieldInput label="CURP" field="alumnoCURP" value={form.alumnoCURP} onChange={set} />
              <FormFieldInput label="Domicilio (Calle, número y colonia)" field="alumnoDomicilio" required value={form.alumnoDomicilio} onChange={set} />
              <FormFieldInput label="Ciudad" field="alumnoCiudad" required value={form.alumnoCiudad} onChange={set} />
              <FormFieldInput label="Estado" field="alumnoEstado" value={form.alumnoEstado} onChange={set} />
              <FormFieldInput label="CP" field="alumnoCP" required value={form.alumnoCP} onChange={set} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="form-field-label">Nivel Educativo <span className="text-destructive">*</span></Label>
                <Select value={form.alumnoNivelEducativo} onValueChange={(v) => set("alumnoNivelEducativo", v)}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{NIVELES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="form-field-label">Grado que cursará <span className="text-destructive">*</span></Label>
                <Select value={form.alumnoGrado} onValueChange={(v) => set("alumnoGrado", v)}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{[1, 2, 3, 4, 5, 6].map((g) => <SelectItem key={g} value={String(g)}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FormRadioField
                  label="% de beca"
                  field="refrendo"
                  options={["Refrendo", "Primera vez"]}
                  value={form.refrendo as string}
                  onChange={(val) => {
                    set("refrendo", val);
                    if (val === "Refrendo" && form.tipoApoyo === "Beca Personal CLA — Refrendo" && porcentajeBecaActual) {
                      set("porcentajeBeca", porcentajeBecaActual);
                    }
                    if (val === "Primera vez") {
                      set("porcentajeBeca", "");
                    }
                  }}
                />
                {form.refrendo === "Refrendo" && (
                  <div className="space-y-1.5">
                    <Label className="form-field-label">Porcentaje de beca</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={form.porcentajeBeca === '' ? '0' : form.porcentajeBeca}
                        onChange={(e) => set("porcentajeBeca", e.target.value.replace('%', '').trim())}
                        className="bg-muted w-28"
                        placeholder="0"
                        disabled={form.tipoApoyo === "Beca Personal CLA — Refrendo" && porcentajeBecaActual !== ""}
                        readOnly={form.tipoApoyo === "Beca Personal CLA — Refrendo" && porcentajeBecaActual !== ""}
                      />
                      <span className="text-foreground font-medium">%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="form-section-title">Datos del Padre/Tutor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldInput label="Apellido Paterno" field="padreApellidoPaterno" required value={form.padreApellidoPaterno} onChange={set} />
              <FormFieldInput label="Apellido Materno" field="padreApellidoMaterno" required value={form.padreApellidoMaterno} onChange={set} />
              <FormFieldInput label="Nombre(s)" field="padreNombres" required value={form.padreNombres} onChange={set} />
              <FormFieldInput label="Fecha de nacimiento" field="padreFechaNacimiento" type="date" required value={form.padreFechaNacimiento} onChange={set} />
              <FormRadioField label="¿Vive con el alumno?" field="padreViveConAlumno" options={["Sí", "No"]} required value={form.padreViveConAlumno as string} onChange={set} />
              <FormFieldInput label="Domicilio (Calle, número y colonia)" field="padreDomicilio" required value={form.padreDomicilio} onChange={set} />
              <FormFieldInput label="Teléfono" field="padreTelefono" required value={form.padreTelefono} onChange={set} />
              <FormFieldInput label="Correo electrónico" field="padreCorreo" type="email" value={form.padreCorreo} onChange={set} />
              <FormFieldInput label="Puesto de trabajo" field="padrePuesto" required value={form.padrePuesto} onChange={set} />
              <FormFieldInput label="Lugar de trabajo" field="padreLugarTrabajo" required value={form.padreLugarTrabajo} onChange={set} />
              <FormFieldInput label="Domicilio del trabajo (Calle, número y colonia)" field="padreDomicilioTrabajo" required value={form.padreDomicilioTrabajo} onChange={set} />
              <FormFieldInput label="Ingreso mensual" field="padreIngresoMensual" value={form.padreIngresoMensual} onChange={set} />
              <FormFieldInput label="Ingresos adicionales/negocios" field="padreIngresosAdicionales" value={form.padreIngresosAdicionales} onChange={set} />
              <FormFieldInput label="Pensiones/apoyos/remesas" field="padreIngresosPensiones" value={form.padreIngresosPensiones} onChange={set} />
              <FormFieldInput label="Ingresos extras familiares" field="padreIngresosExtras" value={form.padreIngresosExtras} onChange={set} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="form-section-title">Datos de la Madre/Tutora</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldInput label="Apellido Paterno" field="madreApellidoPaterno" required value={form.madreApellidoPaterno} onChange={set} />
              <FormFieldInput label="Apellido Materno" field="madreApellidoMaterno" required value={form.madreApellidoMaterno} onChange={set} />
              <FormFieldInput label="Nombre(s)" field="madreNombres" required value={form.madreNombres} onChange={set} />
              <FormFieldInput label="Fecha de nacimiento" field="madreFechaNacimiento" type="date" required value={form.madreFechaNacimiento} onChange={set} />
              <FormRadioField label="¿Vive con el alumno?" field="madreViveConAlumno" options={["Sí", "No"]} required value={form.madreViveConAlumno as string} onChange={set} />
              <FormFieldInput label="Domicilio (Calle, número y colonia)" field="madreDomicilio" required value={form.madreDomicilio} onChange={set} />
              <FormFieldInput label="Teléfono" field="madreTelefono" required value={form.madreTelefono} onChange={set} />
              <FormFieldInput label="Correo electrónico" field="madreCorreo" value={form.madreCorreo} onChange={set} />
              <FormFieldInput label="Puesto de trabajo" field="madrePuesto" value={form.madrePuesto} onChange={set} />
              <FormFieldInput label="Lugar de trabajo" field="madreLugarTrabajo" value={form.madreLugarTrabajo} onChange={set} />
              <FormFieldInput label="Domicilio del trabajo (Calle, número y colonia)" field="madreDomicilioTrabajo" value={form.madreDomicilioTrabajo} onChange={set} />
              <FormFieldInput label="Ingreso mensual" field="madreIngresoMensual" value={form.madreIngresoMensual} onChange={set} />
              <FormFieldInput label="Ingresos adicionales/negocios" field="madreIngresosAdicionales" value={form.madreIngresosAdicionales} onChange={set} />
              <FormFieldInput label="Pensiones/apoyos/remesas" field="madreIngresosPensiones" value={form.madreIngresosPensiones} onChange={set} />
              <FormFieldInput label="Ingresos extras familiares" field="madreIngresosExtras" value={form.madreIngresosExtras} onChange={set} />
            </div>
          </div>
        );
      case 4: {
        const numMembers = parseInt(form.numIntegrantes) || 0;
        if (form.miembros.length !== numMembers) {
          const newMembers: FamilyMember[] = Array.from({ length: numMembers }, (_, i) =>
            form.miembros[i] || { nombre: "", edad: "", escolaridad: "", escuela: "", situacionMedica: "" }
          );
          setTimeout(() => set("miembros", newMembers), 0);
        }
        return (
          <div className="space-y-4">
            <h3 className="form-section-title">Datos Familiares</h3>
            <FormRadioField label="Estado civil de los padres" field="estadoCivil" options={ESTADOS_CIVILES} required value={form.estadoCivil as string} onChange={set} />
            <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Favor de completar únicamente la información correspondiente a las personas que viven actualmente en el domicilio familiar.</p>
              <p>Para cada integrante, registre los siguientes datos:</p>
              <p><span className="font-medium text-foreground">Nombre completo</span>, <span className="font-medium text-foreground">edad</span>, <span className="font-medium text-foreground">ocupación o escolaridad</span> (nivel educativo), <span className="font-medium text-foreground">lugar de trabajo o nombre de la escuela</span> y <span className="font-medium text-foreground">situación médica, emocional o psiquiátrica relevante</span> (en caso de existir).</p>
            </div>
            <div className="space-y-1.5">
              <Label className="form-field-label">Número de integrantes en la familia <span className="text-destructive">*</span></Label>
              <Select value={form.numIntegrantes} onValueChange={(v) => set("numIntegrantes", v)}>
                <SelectTrigger className="bg-background w-32"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{[2, 3, 4, 5, 6, 7].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {form.miembros.map((m, i) => (
              <div key={i} className="bg-muted/50 p-4 rounded-lg space-y-3">
                <p className="text-sm font-semibold text-primary">Miembro {i + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Nombre completo</Label><Input value={m.nombre} onChange={(e) => updateMember(i, "nombre", e.target.value)} className="bg-background" /></div>
                  <div className="space-y-1"><Label className="text-xs">Edad</Label><Input value={m.edad} onChange={(e) => updateMember(i, "edad", e.target.value)} className="bg-background" /></div>
                  <div className="space-y-1"><Label className="text-xs">Escolaridad u ocupación</Label><Input value={m.escolaridad} onChange={(e) => updateMember(i, "escolaridad", e.target.value)} className="bg-background" /></div>
                  <div className="space-y-1"><Label className="text-xs">Escuela o lugar de trabajo</Label><Input value={m.escuela} onChange={(e) => updateMember(i, "escuela", e.target.value)} className="bg-background" /></div>
                  <div className="space-y-1"><Label className="text-xs">Situación médica, emocional o psiquiátrica</Label><Input value={m.situacionMedica} onChange={(e) => updateMember(i, "situacionMedica", e.target.value)} className="bg-background" /></div>
                </div>
              </div>
            ))}
          </div>
        );
      }
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="form-section-title">Egresos Mensuales</h3>
            <p className="text-sm text-muted-foreground">Anote cantidades aproximadas que coincidan con los comprobantes que entregará.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldInput label="Alimentación" field="alimentacion" required placeholder="$" value={form.alimentacion} onChange={set} />
              <FormFieldInput label="Renta o Hipoteca" field="rentaHipoteca" required placeholder="$" value={form.rentaHipoteca} onChange={set} />
              <FormFieldInput label="Servicios (luz, agua, gas, internet, teléfono)" field="servicios" required placeholder="$" value={form.servicios} onChange={set} />
              <FormFieldInput label="Transporte (gasolina)" field="transporte" required placeholder="$" value={form.transporte} onChange={set} />
              <FormFieldInput label="Educación (colegiaturas, materiales, uniformes)" field="educacion" required placeholder="$" value={form.educacion} onChange={set} />
              <FormFieldInput label="Salud (medicinas, seguros)" field="salud" required placeholder="$" value={form.salud} onChange={set} />
              <FormFieldInput label="Deudas o créditos" field="deudasCreditos" required placeholder="$" value={form.deudasCreditos} onChange={set} />
              <FormFieldInput label="Recreación (salidas, viajes)" field="recreacion" required placeholder="$" value={form.recreacion} onChange={set} />
              <FormFieldInput label="Total de ingresos familiares" field="totalIngresosFamiliares" required placeholder="$" value={form.totalIngresosFamiliares} onChange={set} />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h3 className="form-section-title">Vivienda</h3>
            <FormRadioField label="Tipo de vivienda" field="tipoVivienda" options={TIPOS_VIVIENDA} required value={form.tipoVivienda as string} onChange={set} />
            <FormFieldInput label="Propiedades adicionales (casas, terrenos, locales comerciales)" field="propiedadesAdicionales" required value={form.propiedadesAdicionales} onChange={set} />

            <div className="border-t border-border pt-6">
              <h3 className="form-section-title">Documentación Requerida</h3>
              <div className="bg-accent/50 rounded-lg p-4 text-sm space-y-3 text-accent-foreground">
                <p className="font-semibold">Deberá entregar en formato PDF:</p>
                <ol className="list-decimal list-inside space-y-1">
                  {docsToShow.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ol>
                {!isNuevaSolicitud && form.tipoApoyo !== "" && (
                  <div className="pt-2 border-t border-border">
                    <a
                      href={TARJETA_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Descargar formato de Tarjeta de Reciprocidad
                    </a>
                  </div>
                )}

                {/* Consentimiento Informado — siempre visible */}
                <div className="pt-2 border-t border-border space-y-1">
                  <p className="font-semibold text-foreground">Consentimiento Informado</p>
                  <p className="text-muted-foreground">Descarga el formato de Consentimiento Informado, fírmalo y entrégalo en la institución.</p>
                  <a
                    href="https://drive.google.com/file/d/1B5Dtx_l4iWznKGSPO2Am2o4uFW_9v03O/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Descargar formato de Consentimiento Informado
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-5">
              <h3 className="form-section-title">Consentimiento para el tratamiento de datos personales</h3>

              <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-foreground leading-relaxed space-y-3">
                <p>
                  Declaro que he leído y comprendido el Aviso de Privacidad disponible en el siguiente enlace:{" "}
                  <a
                    href="https://drive.google.com/file/d/1hGvhkAcNFMILKGJmYdOeP4RH9gBFdsSO/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    AVISO DE PRIVACIDAD DEL COLEGIO LOS ÁNGELES
                  </a>
                  , otorgo mi consentimiento para el tratamiento de los datos personales proporcionados, incluyendo los datos personales sensibles, para los fines relacionados con el análisis, evaluación, otorgamiento y seguimiento del programa de becas del Colegio Los Ángeles.
                </p>
                <p>
                  Manifiesto que la información proporcionada es verídica y autorizo su verificación en caso de ser necesario.
                </p>
              </div>

              <div className="flex items-start space-x-3 bg-card border border-border rounded-lg p-4">
                <Checkbox
                  checked={form.conformidad}
                  onCheckedChange={(v) => set("conformidad", !!v)}
                  id="conformidad"
                  className="mt-0.5"
                />
                <Label htmlFor="conformidad" className="text-sm font-medium cursor-pointer leading-relaxed">
                  He leído y acepto el Aviso de Privacidad y otorgo mi consentimiento para el tratamiento de mis datos personales conforme a lo descrito anteriormente. <span className="text-destructive">*</span>
                </Label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border py-6 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center gap-2">
          <img src={logoColegio} alt="Logo Colegio Los Ángeles" className="w-16 h-16 object-contain" />
          <p className="text-muted-foreground text-sm">Colegio Los Ángeles de Torreón</p>
          <h1 className="text-2xl font-display font-bold text-foreground">Solicitud de Becas</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          {STEPS.map((_, i) => (
            <div key={i} className={i < step ? "stepper-dot-done" : i === step ? "stepper-dot-active" : "stepper-dot"} />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Paso {step + 1} de {STEPS.length}: <span className="font-medium text-foreground">{STEPS[step]}</span>
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-card rounded-xl shadow-md p-6 md:p-8">
          {renderStep()}

          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <Button variant="outline" onClick={prev} disabled={step === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next}>
                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Send className="w-4 h-4 mr-1" /> Enviar Solicitud
              </Button>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        El llenado de este formato no garantiza la asignación o renovación de una beca.
      </footer>
    </div>
  );
}
