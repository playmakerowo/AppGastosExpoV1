import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { formatCLP, estasobrePresupuesto, porcentajeUso } from '../utils/calculos';
import { quitarCategoriaPeriodo } from '../db/queries/categorias';

export default function ResumenItem({ categoria, onPress, periodo_id, onEliminado }) {
  const { nombre, icono, monto_esperado, monto_real } = categoria;
  const sobre = estasobrePresupuesto(monto_real, monto_esperado);
  const pct = porcentajeUso(monto_real, monto_esperado);
  const esIngreso = categoria.categoria === 'Ingresos';

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
              <Text style={styles.estado}>{sobre ? '🔴' : '🟢'}</Text>
            </>
          )}
        </View>

        <TouchableOpacity onPress={eliminar} style={styles.btnEliminar}>
          <Text style={styles.btnEliminarTexto}>✕</Text>
        </TouchableOpacity>
      </View>

      {!esIngreso && (
        <View style={styles.barraFondo}>
          <View
            style={[
              styles.barraRelleno,
              {
                width: `${pct}%`,
                backgroundColor: sobre ? '#ef4444' : '#22c55e',
              },
            ]}
          />
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
  nombre: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
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
  estado: {
    fontSize: 12,
    marginLeft: 4,
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
});