import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { formatCLP, estasobrePresupuesto, porcentajeUso } from '../utils/calculos';
import { quitarCategoriaPeriodo } from '../db/queries/categorias';

export default function ResumenItem({ categoria, onPress, periodo_id, onEliminado, onSubir, onBajar }) {
  const { icono, monto_esperado, monto_real } = categoria;
  const sobre = estasobrePresupuesto(monto_real, monto_esperado);
  const pct = porcentajeUso(monto_real, monto_esperado);
  const esIngreso = categoria.categoria_id === 1;

  function eliminar() {
    Alert.alert(
      'Quitar categoría',
      `¿Quitar "${categoria.categoria}" de este periodo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: () => {
            quitarCategoriaPeriodo(categoria.categoria_id, periodo_id);
            onEliminado?.();
          }
        }
      ]
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.fila}>
        <Text style={styles.icono} numberOfLines={1}>
          {icono} {categoria.categoria}
        </Text>

        <View style={styles.montos}>
          <Text style={[styles.real, sobre && !esIngreso && styles.rojo]}>
            {formatCLP(monto_real)}
          </Text>

          {!esIngreso && (
            <>
              <Text style={styles.separador}>/</Text>
              <Text style={styles.esperado}>{formatCLP(monto_esperado)}</Text>
              <TouchableOpacity
                onPress={(e) => { e.stopPropagation(); eliminar(); }}
                style={styles.btnEliminar}
              >
                <Text style={styles.btnEliminarTexto}>✕</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {!esIngreso && (
        <View style={styles.barraFondo}>
          <View
            style={[
              styles.barraRelleno,
              { width: `${pct}%`, backgroundColor: sobre ? '#ef4444' : '#22c55e' },
            ]}
          />
        </View>
      )}

      {(onSubir || onBajar) && (
        <View style={styles.ordenFila}>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); onSubir?.(); }}
            style={[styles.btnOrden, !onSubir && styles.btnOrdenDisabled]}
            disabled={!onSubir}
          >
            <Text style={styles.btnOrdenTexto}>▲</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); onBajar?.(); }}
            style={[styles.btnOrden, !onBajar && styles.btnOrdenDisabled]}
            disabled={!onBajar}
          >
            <Text style={styles.btnOrdenTexto}>▼</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icono: {
    fontSize: 18,
    marginRight: 10,
    flex: 1,
  },
  montos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  real: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  rojo: {
    color: '#ef4444',
  },
  separador: {
    fontSize: 12,
    color: '#94a3b8',
  },
  esperado: {
    fontSize: 13,
    color: '#64748b',
  },
  btnEliminar: {
    paddingLeft: 4,
    paddingRight: 4,
    backgroundColor: '#e6e3e3',
    borderRadius: 4,
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEliminarTexto: {
    color: '#fa0000',
    fontSize: 19,
    fontWeight: '700',
  },
  barraFondo: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barraRelleno: {
    height: 4,
    borderRadius: 2,
  },
  ordenFila: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 6,
  },
  btnOrden: {
    backgroundColor: '#e0e7ff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  btnOrdenDisabled: {
    opacity: 0.3,
  },
  btnOrdenTexto: {
    color: '#6366f1',
    fontWeight: '700',
  },
});