import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCLP, estasobrePresupuesto, porcentajeUso } from '../utils/calculos';

export default function ResumenItem({ categoria, onPress }) {
  const { nombre, icono, monto_esperado, monto_real } = categoria;
  const sobre = estasobrePresupuesto(monto_real, monto_esperado);
  const pct = porcentajeUso(monto_real, monto_esperado);
  const esIngreso = categoria.categoria === 'Ingresos';

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
