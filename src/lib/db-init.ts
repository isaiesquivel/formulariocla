/**
 * db-init.ts
 * Inicializa el esquema de la base de datos SQLite.
 * Versión 2: incluye migración automática si el esquema cambió.
 */
import { getDB, resetDB, persistDB } from './database';

const SCHEMA_VERSION = 2;

const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS solicitudes (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  cicloEscolar TEXT,
  tipoApoyo TEXT,
  refrendo TEXT,
  porcentajeBeca TEXT,
  alumnoApellidoPaterno TEXT,
  alumnoApellidoMaterno TEXT,
  alumnoNombres TEXT,
  alumnoFechaNacimiento TEXT,
  alumnoCURP TEXT,
  alumnoDomicilio TEXT,
  alumnoCiudad TEXT,
  alumnoEstado TEXT,
  alumnoCP TEXT,
  alumnoNivelEducativo TEXT,
  alumnoGrado TEXT,
  padreApellidoPaterno TEXT,
  padreApellidoMaterno TEXT,
  padreNombres TEXT,
  padreFechaNacimiento TEXT,
  padreViveConAlumno TEXT,
  padreDomicilio TEXT,
  padreTelefono TEXT,
  padreCorreo TEXT,
  padrePuesto TEXT,
  padreLugarTrabajo TEXT,
  padreDomicilioTrabajo TEXT,
  padreIngresoMensual TEXT,
  padreIngresosAdicionales TEXT,
  padreIngresosPensiones TEXT,
  padreIngresosExtras TEXT,
  madreApellidoPaterno TEXT,
  madreApellidoMaterno TEXT,
  madreNombres TEXT,
  madreFechaNacimiento TEXT,
  madreViveConAlumno TEXT,
  madreDomicilio TEXT,
  madreTelefono TEXT,
  madreCorreo TEXT,
  madrePuesto TEXT,
  madreLugarTrabajo TEXT,
  madreDomicilioTrabajo TEXT,
  madreIngresoMensual TEXT,
  madreIngresosAdicionales TEXT,
  madreIngresosPensiones TEXT,
  madreIngresosExtras TEXT,
  estadoCivil TEXT,
  numIntegrantes TEXT,
  miembros TEXT,
  alimentacion TEXT,
  rentaHipoteca TEXT,
  servicios TEXT,
  transporte TEXT,
  educacion TEXT,
  salud TEXT,
  deudasCreditos TEXT,
  recreacion TEXT,
  totalIngresosFamiliares TEXT,
  tipoVivienda TEXT,
  propiedadesAdicionales TEXT,
  conformidad INTEGER DEFAULT 0,
  consentimientoNombre TEXT
);
`;

let initialized = false;

export async function initDB(): Promise<void> {
  if (initialized) return;
  let db = await getDB();

  // Intentar leer la versión del esquema en la BD cargada desde caché
  let currentVersion = 0;
  try {
    db.run(`CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)`);
    const res = db.exec('SELECT version FROM schema_version LIMIT 1');
    currentVersion = res.length && res[0].values.length ? Number(res[0].values[0][0]) : 0;
  } catch {
    // Si falla (BD corrupta o vacía), forzar reset
    currentVersion = 0;
  }

  if (currentVersion < SCHEMA_VERSION) {
    // Esquema desactualizado: limpiar IndexedDB y reiniciar con BD fresca
    await resetDB();
    db = await getDB(); // BD limpia en memoria
    db.run(`CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)`);
    db.run(CREATE_TABLE);
    db.run('INSERT INTO schema_version (version) VALUES (?)', [SCHEMA_VERSION]);
    await persistDB(); // Guardar BD fresca en IndexedDB
  } else {
    db.run(CREATE_TABLE);
  }

  initialized = true;
}
