import { BecaFormData } from '@/types/BecaForm';
import { supabase } from '@/integrations/supabase/client';

function mapToFormData(row: any): BecaFormData & { consentimientoNombre: string } {
  return {
    id: String(row.id ?? ''),
    timestamp: String(row.timestamp ?? ''),
    cicloEscolar: String(row.cicloescolar ?? ''),
    tipoApoyo: String(row.tipoapoyo ?? ''),
    refrendo: String(row.refrendo ?? ''),
    porcentajeBeca: String(row.porcentajebeca ?? ''),
    alumnoApellidoPaterno: String(row.alumnoapellidopaterno ?? ''),
    alumnoApellidoMaterno: String(row.alumnoapellidomaterno ?? ''),
    alumnoNombres: String(row.alumnonombres ?? ''),
    alumnoFechaNacimiento: String(row.alumnofechanacimiento ?? ''),
    alumnoCURP: String(row.alumnocurp ?? ''),
    alumnoDomicilio: String(row.alumnodomicilio ?? ''),
    alumnoCiudad: String(row.alumnociudad ?? ''),
    alumnoEstado: String(row.alumnoestado ?? ''),
    alumnoCP: String(row.alumnocp ?? ''),
    alumnoNivelEducativo: String(row.alumnoniveleducativo ?? ''),
    alumnoGrado: String(row.alumnogrado ?? ''),
    padreApellidoPaterno: String(row.padreapellidopaterno ?? ''),
    padreApellidoMaterno: String(row.padreapellidomaterno ?? ''),
    padreNombres: String(row.padrenombres ?? ''),
    padreFechaNacimiento: String(row.padrefechanacimiento ?? ''),
    padreViveConAlumno: String(row.padreviveconalumno ?? ''),
    padreDomicilio: String(row.padredomicilio ?? ''),
    padreTelefono: String(row.padretelefono ?? ''),
    padreCorreo: String(row.padrecorreo ?? ''),
    padrePuesto: String(row.padrepuesto ?? ''),
    padreLugarTrabajo: String(row.padrelugartrabajo ?? ''),
    padreDomicilioTrabajo: String(row.padredomiciliotrabajo ?? ''),
    padreIngresoMensual: String(row.padreingresomensual ?? ''),
    padreIngresosAdicionales: String(row.padreingresosadicionales ?? ''),
    padreIngresosPensiones: String(row.padreingresospensiones ?? ''),
    padreIngresosExtras: String(row.padreingresosextras ?? ''),
    madreApellidoPaterno: String(row.madreapellidopaterno ?? ''),
    madreApellidoMaterno: String(row.madreapellidomaterno ?? ''),
    madreNombres: String(row.madrenombres ?? ''),
    madreFechaNacimiento: String(row.madrefechanacimiento ?? ''),
    madreViveConAlumno: String(row.madreviveconalumno ?? ''),
    madreDomicilio: String(row.madredomicilio ?? ''),
    madreTelefono: String(row.madretelefono ?? ''),
    madreCorreo: String(row.madrecorreo ?? ''),
    madrePuesto: String(row.madrepuesto ?? ''),
    madreLugarTrabajo: String(row.madrelugartrabajo ?? ''),
    madreDomicilioTrabajo: String(row.madredomiciliotrabajo ?? ''),
    madreIngresoMensual: String(row.madreingresomensual ?? ''),
    madreIngresosAdicionales: String(row.madreingresosadicionales ?? ''),
    madreIngresosPensiones: String(row.madreingresospensiones ?? ''),
    madreIngresosExtras: String(row.madreingresosextras ?? ''),
    estadoCivil: String(row.estadocivil ?? ''),
    numIntegrantes: String(row.numintegrantes ?? ''),
    miembros: Array.isArray(row.miembros) ? row.miembros : [],
    alimentacion: String(row.alimentacion ?? ''),
    rentaHipoteca: String(row.rentahipoteca ?? ''),
    servicios: String(row.servicios ?? ''),
    transporte: String(row.transporte ?? ''),
    educacion: String(row.educacion ?? ''),
    salud: String(row.salud ?? ''),
    deudasCreditos: String(row.deudascreditos ?? ''),
    recreacion: String(row.recreacion ?? ''),
    totalIngresosFamiliares: String(row.totalingresosfamiliares ?? ''),
    tipoVivienda: String(row.tipovivienda ?? ''),
    propiedadesAdicionales: String(row.propiedadesadicionales ?? ''),
    conformidad: Boolean(row.conformidad),
    becaRecomendacionActiva: Boolean(row.becarecomendacionactiva),
    numMiembrosRecomendacion: String(row.nummiembrosrecomendacion ?? ''),
    miembrosRecomendacion: Array.isArray(row.miembrosrecomendacion) ? row.miembrosrecomendacion : [],
    consentimientoNombre: String(row.consentimientonombre ?? ''),
  };
}

export async function saveSubmission(
  data: BecaFormData & { consentimientoNombre?: string; consentimientoB64?: string }
): Promise<void> {
  const { error } = await supabase.from('solicitudes').insert({
    cicloescolar: data.cicloEscolar,
    tipoapoyo: data.tipoApoyo,
    refrendo: data.refrendo,
    porcentajebeca: data.porcentajeBeca,
    alumnoapellidopaterno: data.alumnoApellidoPaterno,
    alumnoapellidomaterno: data.alumnoApellidoMaterno,
    alumnonombres: data.alumnoNombres,
    alumnofechanacimiento: data.alumnoFechaNacimiento,
    alumnocurp: data.alumnoCURP,
    alumnodomicilio: data.alumnoDomicilio,
    alumnociudad: data.alumnoCiudad,
    alumnoestado: data.alumnoEstado,
    alumnocp: data.alumnoCP,
    alumnoniveleducativo: data.alumnoNivelEducativo,
    alumnogrado: data.alumnoGrado,
    padreapellidopaterno: data.padreApellidoPaterno,
    padreapellidomaterno: data.padreApellidoMaterno,
    padrenombres: data.padreNombres,
    padrefechanacimiento: data.padreFechaNacimiento,
    padreviveconalumno: data.padreViveConAlumno,
    padredomicilio: data.padreDomicilio,
    padretelefono: data.padreTelefono,
    padrecorreo: data.padreCorreo,
    padrepuesto: data.padrePuesto,
    padrelugartrabajo: data.padreLugarTrabajo,
    padredomiciliotrabajo: data.padreDomicilioTrabajo,
    padreingresomensual: data.padreIngresoMensual,
    padreingresosadicionales: data.padreIngresosAdicionales,
    padreingresospensiones: data.padreIngresosPensiones,
    padreingresosextras: data.padreIngresosExtras,
    madreapellidopaterno: data.madreApellidoPaterno,
    madreapellidomaterno: data.madreApellidoMaterno,
    madrenombres: data.madreNombres,
    madrefechanacimiento: data.madreFechaNacimiento,
    madreviveconalumno: data.madreViveConAlumno,
    madredomicilio: data.madreDomicilio,
    madretelefono: data.madreTelefono,
    madrecorreo: data.madreCorreo,
    madrepuesto: data.madrePuesto,
    madrelugartrabajo: data.madreLugarTrabajo,
    madredomiciliotrabajo: data.madreDomicilioTrabajo,
    madreingresomensual: data.madreIngresoMensual,
    madreingresosadicionales: data.madreIngresosAdicionales,
    madreingresospensiones: data.madreIngresosPensiones,
    madreingresosextras: data.madreIngresosExtras,
    estadocivil: data.estadoCivil,
    numintegrantes: data.numIntegrantes,
    miembros: data.miembros || [],
    nummiembrosrecomendacion: data.numMiembrosRecomendacion,
    miembrosrecomendacion: data.miembrosRecomendacion || [],
    becarecomendacionactiva: data.becaRecomendacionActiva || false,
    alimentacion: data.alimentacion,
    rentahipoteca: data.rentaHipoteca,
    servicios: data.servicios,
    transporte: data.transporte,
    educacion: data.educacion,
    salud: data.salud,
    deudascreditos: data.deudasCreditos,
    recreacion: data.recreacion,
    totalingresosfamiliares: data.totalIngresosFamiliares,
    tipovivienda: data.tipoVivienda,
    propiedadesadicionales: data.propiedadesAdicionales,
    conformidad: data.conformidad,
    consentimientonombre: data.consentimientoNombre || '',
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getSubmissions(): Promise<(BecaFormData & { consentimientoNombre: string })[]> {
  const { data, error } = await supabase
    .from('solicitudes')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(mapToFormData);
}

export async function deleteSubmission(id: string): Promise<void> {
  const { error } = await supabase
    .from('solicitudes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
