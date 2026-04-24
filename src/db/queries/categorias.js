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
