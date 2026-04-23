import { getDB } from '../database';

export function crearPeriodo(hogar_id, mes) {
  console.log('[crearPeriodo] INICIO', { hogar_id, mes });

  const db = getDB();

  try {
    const result = db.runSync(
      'INSERT INTO periodos (hogar_id, mes) VALUES (?, ?)',
      [hogar_id, mes]
    );

    console.log('[crearPeriodo] RESULT', result);
    console.log('[crearPeriodo] lastInsertRowId', result.lastInsertRowId);

    return result.lastInsertRowId;
  } catch (error) {
    console.error('[crearPeriodo] ERROR', error);
    throw error;
  }
}

export function obtenerPeriodos(hogar_id) {
  console.log('[obtenerPeriodos] INICIO', { hogar_id });

  const db = getDB();

  try {
    const result = db.getAllSync(
      'SELECT * FROM periodos WHERE hogar_id = ? ORDER BY mes DESC',
      [hogar_id]
    );

    console.log('[obtenerPeriodos] COUNT', result.length);
    console.log('[obtenerPeriodos] DATA', result);

    return result;
  } catch (error) {
    console.error('[obtenerPeriodos] ERROR', error);
    throw error;
  }
}

export function obtenerPeriodo(id) {
  console.log('[obtenerPeriodo] INICIO', { id });

  const db = getDB();

  try {
    const result = db.getFirstSync(
      'SELECT * FROM periodos WHERE id = ?',
      [id]
    );

    console.log('[obtenerPeriodo] RESULT', result);

    return result;
  } catch (error) {
    console.error('[obtenerPeriodo] ERROR', error);
    throw error;
  }
}

export function obtenerUltimoPeriodo(hogar_id) {
  console.log('[obtenerUltimoPeriodo] INICIO', { hogar_id });

  const db = getDB();

  try {
    const result = db.getFirstSync(
      'SELECT * FROM periodos WHERE hogar_id = ? ORDER BY mes DESC LIMIT 1',
      [hogar_id]
    );

    console.log('[obtenerUltimoPeriodo] RESULT', result);

    return result;
  } catch (error) {
    console.error('[obtenerUltimoPeriodo] ERROR', error);
    throw error;
  }
}