import { getDB } from '../database';

export function obtenerProductosPeriodo(periodo_id) {
  console.log('[obtenerProductosPeriodo] INICIO', { periodo_id });

  const db = getDB();

  try {
    const result = db.getAllSync(
      `SELECT pp.*, p.nombre, p.categoria_id,
              (pp.cantidad * pp.precio_unitario) AS monto_real
       FROM producto_periodo pp
       JOIN productos p ON p.id = pp.producto_id
       WHERE pp.periodo_id = ?`,
      [periodo_id]
    );

    console.log('[obtenerProductosPeriodo] COUNT', result.length);
    console.log('[obtenerProductosPeriodo] DATA', result);

    return result;
  } catch (error) {
    console.error('[obtenerProductosPeriodo] ERROR', error);
    throw error;
  }
}

export function obtenerProductosPorCategoria(periodo_id, categoria_id) {
  console.log('[obtenerProductosPorCategoria] INICIO', {
    periodo_id,
    categoria_id
  });

  const db = getDB();

  try {
    const result = db.getAllSync(
      `SELECT pp.*, p.nombre,
              (pp.cantidad * pp.precio_unitario) AS monto_real
       FROM producto_periodo pp
       JOIN productos p ON p.id = pp.producto_id
       WHERE pp.periodo_id = ? AND p.categoria_id = ?`,
      [periodo_id, categoria_id]
    );

    console.log('[obtenerProductosPorCategoria] COUNT', result.length);
    console.log('[obtenerProductosPorCategoria] DATA', result);

    return result;
  } catch (error) {
    console.error('[obtenerProductosPorCategoria] ERROR', error);
    throw error;
  }
}

export function agregarProductoPeriodo(
  producto_id,
  periodo_id,
  cantidad,
  precio_unitario,
  monto_esperado
) {

  const db = getDB();

  try {
    const result = db.runSync(
      `INSERT INTO producto_periodo (producto_id, periodo_id, cantidad, precio_unitario, monto_esperado)
       VALUES (?, ?, ?, ?, ?)`,
      [producto_id, periodo_id, cantidad, precio_unitario, monto_esperado]
    );

    console.log('[agregarProductoPeriodo] RESULT', result);

    return result.lastInsertRowId;
  } catch (error) {
    console.error('[agregarProductoPeriodo] ERROR', error);
    throw error;
  }
}

export function eliminarProductoPeriodo(id, producto_id, periodo_id) {
  console.log('[eliminarProductoPeriodo] Id:',id, 'producto_id:', producto_id, ' periodo:',periodo_id);
  const db = getDB();

  try {
    const result = db.runSync('DELETE FROM producto_periodo WHERE id = ? AND producto_id = ? AND periodo_id = ?', [id ,producto_id, periodo_id]);
    console.log('[eliminarProductoPeriodo] Datos modificados', result.changes);
    
    return result.changes;
  } catch (error) {
    console.error('[eliminarProductoPeriodo] ERROR', error);
    throw error;
  }
}

export function actualizarProductoPeriodo(
  id,
  cantidad,
  precio_unitario,
  monto_esperado
) {
  console.log('[actualizarProductoPeriodo] INICIO', {
    id,
    cantidad,
    precio_unitario,
    monto_esperado
  });

  const db = getDB();

  try {
    const result = db.runSync(
      `UPDATE producto_periodo
       SET cantidad = ?, precio_unitario = ?, monto_esperado = ?
       WHERE id = ?`,
      [cantidad, precio_unitario, monto_esperado, id]
    );

    console.log('[actualizarProductoPeriodo] RESULT', result);

    return result;
  } catch (error) {
    console.error('[actualizarProductoPeriodo] ERROR', error);
    throw error;
  }
}

// Resumen por categoría en un periodo
export function obtenerResumenCategorias(periodo_id) {
  const db = getDB();
  try {
    const result = db.getAllSync(
      `SELECT
     c.id AS categoria_id,
     c.nombre AS categoria,
     c.icono,
     cp.monto_esperado,
     COALESCE(SUM(pp.cantidad * pp.precio_unitario), 0) AS monto_real
   FROM categoria_periodo cp
   JOIN categorias c ON c.id = cp.categoria_id
   LEFT JOIN productos p ON p.categoria_id = c.id
   LEFT JOIN producto_periodo pp
     ON pp.producto_id = p.id AND pp.periodo_id = cp.periodo_id
   WHERE cp.periodo_id = ? AND cp.activo = 1
   GROUP BY c.id, cp.monto_esperado, c.nombre, c.icono`,
      [periodo_id]
    );
    console.log('[obtenerResumenCategorias] DATA', result);
    return result;
  } catch (error) {
    console.error('[obtenerResumenCategorias] ERROR', error);
    throw error;
  }
}