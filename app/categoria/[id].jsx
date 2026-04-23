import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { obtenerProductosPorCategoria, actualizarProductoPeriodo } from '../../src/db/queries/producto_periodo';
import { formatCLP, calcularMontoReal, estasobrePresupuesto } from '../../src/utils/calculos';
import ProductoRow from '../../src/components/ProductoRow';

export default function CategoriaScreen() {
  const { id, periodo_id, nombre } = useLocalSearchParams();
  const navigation = useNavigation();
  const [productos, setProductos] = useState([]);
  const [editados, setEditados] = useState({});

  useEffect(() => {
    navigation.setOptions({ title: nombre || 'Categoría' });
    cargarProductos();
  }, [id, periodo_id]);

  function cargarProductos() {
    const datos = obtenerProductosPorCategoria(parseInt(periodo_id), parseInt(id));
    setProductos(datos);
    setEditados({});
  }

  function handleCambio(productoActualizado) {
    setProductos(prev =>
      prev.map(p => p.id === productoActualizado.id ? productoActualizado : p)
    );
    setEditados(prev => ({ ...prev, [productoActualizado.id]: true }));
  }

  function guardarTodo() {
    try {
      productos.forEach(p => {
        if (editados[p.id]) {
          actualizarProductoPeriodo(
            p.id,
            parseInt(p.cantidad) || 0,
            parseInt(p.precio_unitario) || 0,
            parseInt(p.monto_esperado) || 0
          );
        }
      });
      setEditados({});
      Alert.alert('✓', 'Cambios guardados');
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar');
    }
  }

  const totalReal = productos.reduce(
    (acc, p) => acc + calcularMontoReal(p.cantidad, p.precio_unitario), 0
  );
  const totalEsperado = productos[0]?.monto_esperado || 0;
  const sobre = estasobrePresupuesto(totalReal, totalEsperado);
  const hayEdiciones = Object.keys(editados).length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      {/* Resumen de la categoría */}
      <View style={[styles.resumenCard, sobre && styles.resumenRojo]}>
        <View style={styles.resumenFila}>
          <Text style={styles.resumenLabel}>Gastado</Text>
          <Text style={[styles.resumenValor, sobre && styles.rojo]}>
            {formatCLP(totalReal)}
          </Text>
        </View>
        <View style={styles.resumenFila}>
          <Text style={styles.resumenLabel}>Presupuesto</Text>
          <Text style={styles.resumenValor}>{formatCLP(totalEsperado)}</Text>
        </View>
        <View style={styles.resumenFila}>
          <Text style={styles.resumenLabel}>Restante</Text>
          <Text style={[styles.resumenValor, sobre && styles.rojo]}>
            {formatCLP(totalEsperado - totalReal)}
          </Text>
        </View>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductoRow producto={item} onChange={handleCambio} />
        )}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón guardar flotante */}
      {hayEdiciones && (
        <TouchableOpacity style={styles.btnGuardar} onPress={guardarTodo}>
          <Text style={styles.btnGuardarText}>Guardar cambios</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  resumenCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  resumenRojo: {
    borderLeftColor: '#ef4444',
  },
  resumenFila: {
    flex: 1,
    alignItems: 'center',
  },
  resumenLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  resumenValor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  rojo: {
    color: '#ef4444',
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  btnGuardar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnGuardarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
