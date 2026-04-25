import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { obtenerProductosPorCategoria, actualizarProductoPeriodo } from '../../src/db/queries/producto_periodo';
import { formatCLP, calcularMontoReal, estasobrePresupuesto } from '../../src/utils/calculos';
import ProductoRow from '../../src/components/ProductoRow';
import GastoEsperadoModal from '../../src/components/GastoEsperadoModal';
import { obtenerGastoEsperado } from '../../src/db/queries/categorias';
import Toast from 'react-native-toast-message';
import ProductosModal from '../../src/components/ProdutosModal';

export default function CategoriaScreen() {
  const { id, periodo_id, nombre } = useLocalSearchParams();
  const navigation = useNavigation();
  const [productos, setProductos] = useState([]);
  const [editados, setEditados] = useState({});
  const [montoEstimado, setMontoEstimado] = useState(0);

  useEffect(() => {
    const montoEstimado = obtenerGastoEsperado(id, periodo_id);
    setMontoEstimado(montoEstimado);

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

    guardarProducto(productoActualizado);
  }

  function guardarProducto(p) {
    try {
      console.log("[guardarProducto] productos a guardar", productos);
      actualizarProductoPeriodo(
        p.id,
        parseInt(p.cantidad) || 0,
        parseInt(p.precio_unitario) || 0,
        parseInt(p.monto_esperado) || 0
      );
      setEditados({});
      Toast.show({ type: 'success', text1: 'Cambios guardados producto: '+p.nombre });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'No se pudo guardar' });
    }
  }

  const totalReal = productos.reduce(
    (acc, p) => acc + calcularMontoReal(p.cantidad, p.precio_unitario), 0
  );
  const sobre = estasobrePresupuesto(totalReal, montoEstimado);
  const hayEdiciones = Object.keys(editados).length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <View style={[styles.resumenCard, sobre && styles.resumenRojo]}>
        <View style={styles.resumenFila}>
          <Text style={styles.resumenLabel}>Gastado</Text>
          <Text style={[styles.resumenValor, sobre && styles.rojo]}>
            {formatCLP(totalReal)}
          </Text>
        </View>
        <View style={styles.resumenFila}>
          <Text style={styles.resumenLabel}>Presupuesto</Text>
          <Text style={styles.resumenValor}>{formatCLP(montoEstimado)}</Text>
        </View>
        <View style={styles.resumenFila}>
          <Text style={styles.resumenLabel}>Restante</Text>
          <Text style={[styles.resumenValor, sobre && styles.rojo]}>
            {formatCLP(montoEstimado - totalReal)}
          </Text>
        </View>
        <View style={styles.resumenFila}>
          <Text style={styles.resumenLabel}>Coste diario</Text>
          <Text style={[styles.resumenValor, sobre && styles.rojo]}>
            {formatCLP(totalReal / 30)}
          </Text>
        </View>
      </View>

      <GastoEsperadoModal
        categoria_id={id}
        periodo_id={periodo_id}
        onActualizado={() => {
          const monto = obtenerGastoEsperado(id, periodo_id);
          setMontoEstimado(monto);
        }}
      />

      {/* Lista de productos */}
      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductoRow producto={item} periodo_id={periodo_id} onChange={handleCambio} onDelete={cargarProductos} />
        )}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />

      <ProductosModal categoria_id={id} periodo_id={periodo_id} onProductoAgregado={cargarProductos} />

      {hayEdiciones && (
        <TouchableOpacity style={styles.button} onPress={guardarTodo}>
          <Text style={styles.btnText}>Guardar cambios</Text>
        </TouchableOpacity>
      )}

      <Toast position='top' topOffset={10} onPress={() => Toast.hide()} />
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
    margin: 8,
    borderRadius: 14,
    paddingVertical: 16,
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
  button: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    margin: 5,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
