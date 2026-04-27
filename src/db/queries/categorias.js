import { getDB } from '../database';

export function crearCategoria(nombre, icono) {
  const db = getDB();
  const result = db.runSync(
    'INSERT INTO categorias (nombre, icono) VALUES (?, ?)',
    [nombre, icono]
  );
  return result.lastInsertRowId;
}

export function obtenerCategorias() {
  const db = getDB();
  return db.getAllSync(
    'SELECT * FROM categorias ORDER BY nombre ASC'
  );
}

export function obtenerCategoriasNoIncluidasPeriodo(periodo_id) {
  const db = getDB();

  console.log('[categorias disponibles] periodo:', periodo_id);

  const result = db.getAllSync(
    `SELECT *
    FROM categorias c
    LEFT JOIN categoria_periodo cp 
        ON cp.categoria_id = c.id
    WHERE cp.activo = 0 
      OR c.id NOT IN (
            SELECT cp2.categoria_id
            FROM categoria_periodo cp2
            WHERE cp2.periodo_id = ?
      )
    ORDER BY c.nombre ASC;`,
    [periodo_id]
  );

  console.log('[categorias disponibles RESULT]:', result);

  return result;
}

export function actualizarMontoEsperadoCategoria(categoria_id, periodo_id, monto_esperado) {
  const db = getDB();

  const result = db.runSync(
    `UPDATE categoria_periodo 
     SET monto_esperado = ? 
     WHERE categoria_id = ? AND periodo_id = ? `,
    [monto_esperado, categoria_id, periodo_id]
  );

  return result.changes;
}

export function obtenerGastoEsperado(categoria_id, periodo_id) {
  const db = getDB();

  const row = db.getFirstSync(
    'SELECT monto_esperado FROM categoria_periodo WHERE categoria_id = ? AND periodo_id = ? AND activo = 1',
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
     WHERE periodo_id = ? AND categoria_id != 1 AND activo = 1`,
    [periodo_id]
  );

  console.log("[obtenerGastoEsperadoTodasCategorias] estimado:", rows[0]?.total ?? 0);
  return rows[0]?.total ?? 0;
}

export function obtenerGastoTodasCategorias(periodo_id) {
  const db = getDB();
  console.log("[obtenerGastoTodasCategorias] PERIODO:", periodo_id);

  const rows = db.getAllSync(
    `SELECT SUM(pp.cantidad * pp.precio_unitario) as total
     FROM producto_periodo pp
     JOIN productos p ON p.id = pp.producto_id
     JOIN categoria_periodo cp ON cp.categoria_id = p.categoria_id AND cp.periodo_id = pp.periodo_id
     WHERE pp.periodo_id = ? AND p.categoria_id != 1 AND cp.activo = 1`,
    [periodo_id]
  );

  return rows[0]?.total ?? 0;
}

// En vez de DELETE, desactiva
export function quitarCategoriaPeriodo(categoria_id, periodo_id) {
  const db = getDB();
  db.runSync(
    'UPDATE categoria_periodo SET activo = 0 WHERE categoria_id = ? AND periodo_id = ?',
    [categoria_id, periodo_id]
  );
}

// Al volver a agregar, reactiva
export function unirCategoriaPeriodo(categoria_id, periodo_id) {
  const db = getDB();
  const existe = db.getFirstSync(
    'SELECT id FROM categoria_periodo WHERE categoria_id = ? AND periodo_id = ?',
    [categoria_id, periodo_id]
  );

  if (existe) {
    db.runSync(
      'UPDATE categoria_periodo SET activo = 1 WHERE categoria_id = ? AND periodo_id = ?',
      [categoria_id, periodo_id]
    );
  } else {
    db.runSync(
      'INSERT INTO categoria_periodo (categoria_id, periodo_id, monto_esperado, activo) VALUES (?, ?, 0, 1)',
      [categoria_id, periodo_id]
    );
  }
}