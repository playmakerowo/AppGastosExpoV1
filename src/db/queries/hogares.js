import { getDB } from '../database';

export function crearHogar(nombre, codigo) {
  const db = getDB();
  const result = db.runSync(
    'INSERT INTO hogares (nombre, codigo) VALUES (?, ?)',
    [nombre, codigo]
  );
  return result.lastInsertRowId;
}

export function obtenerHogares() {
  const db = getDB();
  return db.getAllSync('SELECT * FROM hogares');
}

export function obtenerHogar(id) {
  const db = getDB();
  return db.getFirstSync('SELECT * FROM hogares WHERE id = ?', [id]);
}
