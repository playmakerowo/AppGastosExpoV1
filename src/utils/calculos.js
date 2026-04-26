import { existePeriodo } from "../db/queries/periodos";

// Formato pesos chilenos: 180000 → "$180.000"
export function formatCLP(valor, conSimbolo = true) {
  const num = parseInt(valor) || 0;
  return new Intl.NumberFormat('es-CL', {
    style: conSimbolo ? 'currency' : 'decimal',
    currency: conSimbolo ? 'CLP' : undefined,
    minimumFractionDigits: 0,
  }).format(num);
}

// Calcula monto real de un producto
export function calcularMontoReal(cantidad, precio_unitario) {
  const c = parseInt(cantidad) || 0;
  const p = parseInt(precio_unitario) || 0;
  return c * p;
}

// Retorna true si está sobre el presupuesto
export function estasobrePresupuesto(monto_real, monto_esperado) {
  return parseInt(monto_real) > parseInt(monto_esperado);
}

// Porcentaje usado del presupuesto
export function porcentajeUso(monto_real, monto_esperado) {
  if (!monto_esperado || monto_esperado === 0) return 0;
  return Math.min((monto_real / monto_esperado) * 100, 100);
}

// Mes legible: "2026-05" → "Mayo 2026"
export function formatMes(mes) {
  if (!mes) return '';
  const [anio, m] = mes.split('-');
  const nombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return `${nombres[parseInt(m) - 1]} ${anio}`;
}

export function mesActual() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  return `${anio}-${mes}`;
}

export function verificarPeriodoActual(hogarId) {
  const actual = mesActual();
  const existe = existePeriodo(hogarId, actual);

  if (!existe) {
    return {
      estado: 'faltante',
      actual
    };
  }

  return {
    estado: 'ok',
    actual
  };
}