/**
 * storage.ts
 * API de persistencia usando SQLite (sql.js + IndexedDB).
 * El PDF de consentimiento se almacena en IndexedDB por ser un blob grande;
 * en SQLite solo se guarda el nombre del archivo.
 */
import { BecaFormData } from '@/types/BecaForm';
import { getDB, persistDB } from './database';
import { initDB } from './db-init';

async function ensureInit() {
  await initDB();
}

// ─── IndexedDB: almacén de blobs de consentimiento ────────────────────────────

const CONSENT_IDB = 'becas_consents';
const CONSENT_STORE = 'files';

function openConsentIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(CONSENT_IDB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(CONSENT_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveConsentBlob(id: string, b64: string): Promise<void> {
  if (!b64) return;
  const idb = await openConsentIDB();
  await new Promise<void>((resolve, reject) => {
    const tx = idb.transaction(CONSENT_STORE, 'readwrite');
    const req = tx.objectStore(CONSENT_STORE).put(b64, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => idb.close();
  });
}

export async function getConsentBlob(id: string): Promise<string | null> {
  const idb = await openConsentIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(CONSENT_STORE, 'readonly');
    const req = tx.objectStore(CONSENT_STORE).get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => idb.close();
  });
}

async function deleteConsentBlob(id: string): Promise<void> {
  const idb = await openConsentIDB();
  await new Promise<void>((resolve, reject) => {
    const tx = idb.transaction(CONSENT_STORE, 'readwrite');
    tx.objectStore(CONSENT_STORE).delete(id);
    tx.oncomplete = () => { idb.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Columnas SQLite (sin el blob b64) ───────────────────────────────────────
const COLUMNS = [
  'id', 'timestamp', 'cicloEscolar', 'tipoApoyo', 'refrendo', 'porcentajeBeca',
  'alumnoApellidoPaterno', 'alumnoApellidoMaterno', 'alumnoNombres',
  'alumnoFechaNacimiento', 'alumnoCURP', 'alumnoDomicilio', 'alumnoCiudad',
  'alumnoEstado', 'alumnoCP', 'alumnoNivelEducativo', 'alumnoGrado',
  'padreApellidoPaterno', 'padreApellidoMaterno', 'padreNombres',
  'padreFechaNacimiento', 'padreViveConAlumno', 'padreDomicilio',
  'padreTelefono', 'padreCorreo', 'padrePuesto', 'padreLugarTrabajo',
  'padreDomicilioTrabajo', 'padreIngresoMensual', 'padreIngresosAdicionales',
  'padreIngresosPensiones', 'padreIngresosExtras',
  'madreApellidoPaterno', 'madreApellidoMaterno', 'madreNombres',
  'madreFechaNacimiento', 'madreViveConAlumno', 'madreDomicilio',
  'madreTelefono', 'madreCorreo', 'madrePuesto', 'madreLugarTrabajo',
  'madreDomicilioTrabajo', 'madreIngresoMensual', 'madreIngresosAdicionales',
  'madreIngresosPensiones', 'madreIngresosExtras',
  'estadoCivil', 'numIntegrantes', 'miembros',
  'alimentacion', 'rentaHipoteca', 'servicios', 'transporte', 'educacion',
  'salud', 'deudasCreditos', 'recreacion', 'totalIngresosFamiliares',
  'tipoVivienda', 'propiedadesAdicionales', 'conformidad',
  'consentimientoNombre',
] as const;

function rowToFormData(row: Record<string, unknown>): BecaFormData & { consentimientoNombre: string } {
  return {
    id: String(row.id ?? ''),
    timestamp: String(row.timestamp ?? ''),
    cicloEscolar: String(row.cicloEscolar ?? ''),
    tipoApoyo: String(row.tipoApoyo ?? ''),
    refrendo: String(row.refrendo ?? ''),
    porcentajeBeca: String(row.porcentajeBeca ?? ''),
    alumnoApellidoPaterno: String(row.alumnoApellidoPaterno ?? ''),
    alumnoApellidoMaterno: String(row.alumnoApellidoMaterno ?? ''),
    alumnoNombres: String(row.alumnoNombres ?? ''),
    alumnoFechaNacimiento: String(row.alumnoFechaNacimiento ?? ''),
    alumnoCURP: String(row.alumnoCURP ?? ''),
    alumnoDomicilio: String(row.alumnoDomicilio ?? ''),
    alumnoCiudad: String(row.alumnoCiudad ?? ''),
    alumnoEstado: String(row.alumnoEstado ?? ''),
    alumnoCP: String(row.alumnoCP ?? ''),
    alumnoNivelEducativo: String(row.alumnoNivelEducativo ?? ''),
    alumnoGrado: String(row.alumnoGrado ?? ''),
    padreApellidoPaterno: String(row.padreApellidoPaterno ?? ''),
    padreApellidoMaterno: String(row.padreApellidoMaterno ?? ''),
    padreNombres: String(row.padreNombres ?? ''),
    padreFechaNacimiento: String(row.padreFechaNacimiento ?? ''),
    padreViveConAlumno: String(row.padreViveConAlumno ?? ''),
    padreDomicilio: String(row.padreDomicilio ?? ''),
    padreTelefono: String(row.padreTelefono ?? ''),
    padreCorreo: String(row.padreCorreo ?? ''),
    padrePuesto: String(row.padrePuesto ?? ''),
    padreLugarTrabajo: String(row.padreLugarTrabajo ?? ''),
    padreDomicilioTrabajo: String(row.padreDomicilioTrabajo ?? ''),
    padreIngresoMensual: String(row.padreIngresoMensual ?? ''),
    padreIngresosAdicionales: String(row.padreIngresosAdicionales ?? ''),
    padreIngresosPensiones: String(row.padreIngresosPensiones ?? ''),
    padreIngresosExtras: String(row.padreIngresosExtras ?? ''),
    madreApellidoPaterno: String(row.madreApellidoPaterno ?? ''),
    madreApellidoMaterno: String(row.madreApellidoMaterno ?? ''),
    madreNombres: String(row.madreNombres ?? ''),
    madreFechaNacimiento: String(row.madreFechaNacimiento ?? ''),
    madreViveConAlumno: String(row.madreViveConAlumno ?? ''),
    madreDomicilio: String(row.madreDomicilio ?? ''),
    madreTelefono: String(row.madreTelefono ?? ''),
    madreCorreo: String(row.madreCorreo ?? ''),
    madrePuesto: String(row.madrePuesto ?? ''),
    madreLugarTrabajo: String(row.madreLugarTrabajo ?? ''),
    madreDomicilioTrabajo: String(row.madreDomicilioTrabajo ?? ''),
    madreIngresoMensual: String(row.madreIngresoMensual ?? ''),
    madreIngresosAdicionales: String(row.madreIngresosAdicionales ?? ''),
    madreIngresosPensiones: String(row.madreIngresosPensiones ?? ''),
    madreIngresosExtras: String(row.madreIngresosExtras ?? ''),
    estadoCivil: String(row.estadoCivil ?? ''),
    numIntegrantes: String(row.numIntegrantes ?? ''),
    miembros: (() => {
      try { return JSON.parse(String(row.miembros ?? '[]')); } catch { return []; }
    })(),
    alimentacion: String(row.alimentacion ?? ''),
    rentaHipoteca: String(row.rentaHipoteca ?? ''),
    servicios: String(row.servicios ?? ''),
    transporte: String(row.transporte ?? ''),
    educacion: String(row.educacion ?? ''),
    salud: String(row.salud ?? ''),
    deudasCreditos: String(row.deudasCreditos ?? ''),
    recreacion: String(row.recreacion ?? ''),
    totalIngresosFamiliares: String(row.totalIngresosFamiliares ?? ''),
    tipoVivienda: String(row.tipoVivienda ?? ''),
    propiedadesAdicionales: String(row.propiedadesAdicionales ?? ''),
    conformidad: Number(row.conformidad) === 1,
    becaRecomendacionActiva: row.becaRecomendacionActiva === 1 || row.becaRecomendacionActiva === true,
    numMiembrosRecomendacion: String(row.numMiembrosRecomendacion ?? ''),
    miembrosRecomendacion: (() => {
      try { return JSON.parse(String(row.miembrosRecomendacion ?? '[]')); } catch { return []; }
    })(),
    consentimientoNombre: String(row.consentimientoNombre ?? ''),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function saveSubmission(
  data: BecaFormData & { consentimientoNombre?: string; consentimientoB64?: string }
): Promise<void> {
  await ensureInit();
  const db = await getDB();

  const id = crypto.randomUUID();
  const ts = new Date().toISOString();

  const b64 = data.consentimientoB64 ?? '';
  if (b64) await saveConsentBlob(id, b64);

  // Build a keyed map with overrides for generated/serialized fields
  const dataMap: Record<string, unknown> = {
    ...(data as unknown as Record<string, unknown>),
    id,
    timestamp: ts,
    miembros: JSON.stringify((data as any).miembros ?? []),
    conformidad: data.conformidad ? 1 : 0,
    consentimientoNombre: data.consentimientoNombre ?? '',
  };

  // Pick values in exact COLUMNS order — guarantees no index mismatch
  const values = COLUMNS.map((col) => {
    const v = dataMap[col];
    return v === undefined ? null : v;
  });

  const placeholders = COLUMNS.map(() => '?').join(', ');
  const sql = `INSERT OR REPLACE INTO solicitudes (${COLUMNS.join(', ')}) VALUES (${placeholders})`;

  db.run(sql, values);
  await persistDB();
}

export async function getSubmissions(): Promise<(BecaFormData & { consentimientoNombre: string })[]> {
  await ensureInit();
  const db = await getDB();
  const results = db.exec('SELECT * FROM solicitudes ORDER BY timestamp DESC');
  if (!results.length || !results[0].values.length) return [];
  const { columns, values } = results[0];
  return values.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return rowToFormData(obj);
  });
}

export async function deleteSubmission(id: string): Promise<void> {
  await ensureInit();
  const db = await getDB();
  db.run('DELETE FROM solicitudes WHERE id = ?', [id]);
  await deleteConsentBlob(id);
  await persistDB();
}
