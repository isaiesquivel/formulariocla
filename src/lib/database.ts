/**
 * database.ts
 * SQLite singleton usando sql.js (WebAssembly) con persistencia en IndexedDB.
 * Usa import ?url de Vite para que el WASM se sirva correctamente.
 */

// Importamos el WASM como URL mediante el plugin de assets de Vite
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

const IDB_NAME = 'becas_storage';
const IDB_STORE = 'sqliteDb';
const IDB_KEY = 'main';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;
let initPromise: Promise<void> | null = null;

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

function openIDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = () => {
            req.result.createObjectStore(IDB_STORE);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function loadFromIDB(): Promise<Uint8Array | null> {
    const idb = await openIDB();
    return new Promise((resolve, reject) => {
        const tx = idb.transaction(IDB_STORE, 'readonly');
        const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => idb.close();
    });
}

async function saveToIDB(data: Uint8Array): Promise<void> {
    const idb = await openIDB();
    return new Promise((resolve, reject) => {
        const tx = idb.transaction(IDB_STORE, 'readwrite');
        const req = tx.objectStore(IDB_STORE).put(data, IDB_KEY);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => idb.close();
    });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function doInit(): Promise<void> {
    const { default: initSqlJs } = await import('sql.js');

    const SQL = await initSqlJs({
        // Usa la URL que Vite resuelve correctamente para el archivo WASM
        locateFile: () => sqlWasmUrl,
    });

    const saved = await loadFromIDB();
    db = saved ? new SQL.Database(saved) : new SQL.Database();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Devuelve la instancia de la DB (lazy-init al primer uso). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDB(): Promise<any> {
    if (db) return db;
    if (!initPromise) {
        initPromise = doInit();
    }
    await initPromise;
    return db;
}

/** Persiste la BD en IndexedDB después de cada escritura. */
export async function persistDB(): Promise<void> {
    if (!db) return;
    const data = db.export();
    await saveToIDB(data);
}

/** Elimina la BD guardada en IndexedDB y resetea el singleton en memoria. */
export async function resetDB(): Promise<void> {
    const idb = await openIDB();
    await new Promise<void>((resolve, reject) => {
        const tx = idb.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).delete(IDB_KEY);
        tx.oncomplete = () => { idb.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
    });
    db = null;
    initPromise = null;
}
