export interface BecaFormData {
  id: string;
  timestamp: string;
  // Section 1
  cicloEscolar: string;
  tipoApoyo: string;
  refrendo: string; // "Refrendo" | "Primera vez"
  // Beca por beneficios de recomendación
  becaRecomendacionActiva: boolean;
  numMiembrosRecomendacion: string;
  miembrosRecomendacion: RecomendacionMember[];
  // Datos alumno
  alumnoApellidoPaterno: string;
  alumnoApellidoMaterno: string;
  alumnoNombres: string;
  alumnoFechaNacimiento: string;
  alumnoCURP: string;
  alumnoDomicilio: string;
  alumnoCiudad: string;
  alumnoEstado: string;
  alumnoCP: string;
  alumnoNivelEducativo: string;
  alumnoGrado: string;
  porcentajeBeca: string;
  // Datos padre/tutor
  padreApellidoPaterno: string;
  padreApellidoMaterno: string;
  padreNombres: string;
  padreFechaNacimiento: string;
  padreViveConAlumno: string;
  padreDomicilio: string;
  padreTelefono: string;
  padreCorreo: string;
  padrePuesto: string;
  padreLugarTrabajo: string;
  padreDomicilioTrabajo: string;
  padreIngresoMensual: string;
  padreIngresosAdicionales: string;
  padreIngresosPensiones: string;
  padreIngresosExtras: string;
  // Datos madre
  madreApellidoPaterno: string;
  madreApellidoMaterno: string;
  madreNombres: string;
  madreFechaNacimiento: string;
  madreViveConAlumno: string;
  madreDomicilio: string;
  madreTelefono: string;
  madreCorreo: string;
  madrePuesto: string;
  madreLugarTrabajo: string;
  madreDomicilioTrabajo: string;
  madreIngresoMensual: string;
  madreIngresosAdicionales: string;
  madreIngresosPensiones: string;
  madreIngresosExtras: string;
  // Familia
  estadoCivil: string;
  numIntegrantes: string;
  miembros: FamilyMember[];
  // Egresos
  alimentacion: string;
  rentaHipoteca: string;
  servicios: string;
  transporte: string;
  educacion: string;
  salud: string;
  deudasCreditos: string;
  recreacion: string;
  totalIngresosFamiliares: string;
  // Vivienda
  tipoVivienda: string;
  propiedadesAdicionales: string;
  // Conformidad
  conformidad: boolean;
}

export interface FamilyMember {
  nombre: string;
  edad: string;
  escolaridad: string;
  escuela: string;
  situacionMedica: string;
}

export interface RecomendacionMember {
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombre: string;
  grado: string;
  nombrePadreTutor: string;
  telefonoPadreTutor: string;
}

export const EMPTY_FORM: BecaFormData = {
  id: '',
  timestamp: '',
  cicloEscolar: '',
  tipoApoyo: '',
  refrendo: '',
  becaRecomendacionActiva: false,
  numMiembrosRecomendacion: '',
  miembrosRecomendacion: [],
  alumnoApellidoPaterno: '',
  alumnoApellidoMaterno: '',
  alumnoNombres: '',
  alumnoFechaNacimiento: '',
  alumnoCURP: '',
  alumnoDomicilio: '',
  alumnoCiudad: '',
  alumnoEstado: '',
  alumnoCP: '',
  alumnoNivelEducativo: '',
  alumnoGrado: '',
  porcentajeBeca: '',
  padreApellidoPaterno: '',
  padreApellidoMaterno: '',
  padreNombres: '',
  padreFechaNacimiento: '',
  padreViveConAlumno: '',
  padreDomicilio: '',
  padreTelefono: '',
  padreCorreo: '',
  padrePuesto: '',
  padreLugarTrabajo: '',
  padreDomicilioTrabajo: '',
  padreIngresoMensual: '',
  padreIngresosAdicionales: '',
  padreIngresosPensiones: '',
  padreIngresosExtras: '',
  madreApellidoPaterno: '',
  madreApellidoMaterno: '',
  madreNombres: '',
  madreFechaNacimiento: '',
  madreViveConAlumno: '',
  madreDomicilio: '',
  madreTelefono: '',
  madreCorreo: '',
  madrePuesto: '',
  madreLugarTrabajo: '',
  madreDomicilioTrabajo: '',
  madreIngresoMensual: '',
  madreIngresosAdicionales: '',
  madreIngresosPensiones: '',
  madreIngresosExtras: '',
  estadoCivil: '',
  numIntegrantes: '',
  miembros: [],
  alimentacion: '',
  rentaHipoteca: '',
  servicios: '',
  transporte: '',
  educacion: '',
  salud: '',
  deudasCreditos: '',
  recreacion: '',
  totalIngresosFamiliares: '',
  tipoVivienda: '',
  propiedadesAdicionales: '',
  conformidad: false,
};
