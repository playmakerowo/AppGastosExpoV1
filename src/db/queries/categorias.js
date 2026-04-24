import { getDB } from '../database';

export function crearCategorias(id, nombre, icono) {
  const db = getDB();
  const result = db.runSync(
    'INSERT INTO Categorias (id, mes, icono) VALUES (?, ?)',
    [id, nombre, icono]
  );
  return result.lastInsertRowId;
}

export function obtenerCategorias() {
  const db = getDB();
  return db.getAllSync(
    'SELECT * FROM categorias ORDER BY nombre ASC'
  );
}

export function unirCategoriaPeriodo(categoria_id, periodo_id) {
  const db = getDB();
  db.runSync(
    'INSERT INTO categoria_periodo (categoria_id, periodo_id, monto_esperado) VALUES (?, ?, 0)',
    [categoria_id, periodo_id]
  );
}

export function actualizarMontoEsperadoCategoria(categoria_id, periodo_id, monto_esperado) {
  const db = getDB();

  const result = db.runSync(
    `UPDATE categoria_periodo 
     SET monto_esperado = ? 
     WHERE categoria_id = ? AND periodo_id = ?`,
    [monto_esperado, categoria_id, periodo_id]
  );

  return result.changes;
}

export function obtenerGastoEsperado(categoria_id, periodo_id) {
  const db = getDB();

  console.log("[obtenerGastoEsperado] CATEGORIA:",categoria_id," PERIODO:", periodo_id)
  const row = db.getFirstSync(
    'SELECT monto_esperado FROM categoria_periodo WHERE categoria_id = ? AND periodo_id = ?',
    [categoria_id, periodo_id]
  );

  return row?.monto_esperado ?? 0;
}

export function obtenerGastoEsperadoTodasCategorias(periodo_id) {
  const db = getDB();

  console.log("[obtenerGastoEsperadoTodasCategorias] PERIODO:", periodo_id);

  const rows = db.getAllSync(
    `SELECT SUM(monto_esperado) as total 
     FROM categoria_periodo 
     WHERE periodo_id = ? AND categoria_id != 1`,
    [periodo_id]
  );

  console.log("[obtenerGastoEsperadoTodasCategorias] estimado:", rows[0]?.total ?? 0);
  return rows[0]?.total ?? 0;
}
