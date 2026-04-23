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

  console.log('INSERTANDO:', categoria_id, periodo_id);

  const result = db.runSync(
    'INSERT INTO categoria_periodo (categoria_id, periodo_id, monto_esperado) VALUES (?, ?, 0)',
    [categoria_id, periodo_id]
  );

  console.log('RESULT:', result);
}
