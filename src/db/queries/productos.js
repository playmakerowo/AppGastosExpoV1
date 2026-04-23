import { getDB } from '../database';

export function crearProducto(nombre, categoria_id) {
  const db = getDB();
  const result = db.runSync(
    'INSERT INTO productos (nombre, categoria_id) VALUES (?, ?)',
    [nombre, categoria_id]
  );
  return result.lastInsertRowId;
}

export function obtenerProductos(categoria_id) {
  const db = getDB();
  return db.getAllSync(
    'SELECT * FROM productos WHERE categoria_id = ?',
    [categoria_id]
  );
}

export function editarProducto(id, nombre) {
  const db = getDB();
  db.runSync('UPDATE productos SET nombre = ? WHERE id = ?', [nombre, id]);
}

export function eliminarProducto(id) {
  const db = getDB();
  db.runSync('DELETE FROM productos WHERE id = ?', [id]);
}
