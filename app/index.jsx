import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { obtenerResumenCategorias } from '../src/db/queries/producto_periodo';
import { obtenerPeriodos, crearPeriodo } from '../src/db/queries/periodos';
import { crearHogar, obtenerHogares } from '../src/db/queries/hogares';
import { seedData } from '../src/utils/seedData';
import { formatCLP, formatMes, mesActual } from '../src/utils/calculos';
import ResumenItem from '../src/components/ResumenItem';
import { obtenerGastoEsperadoTodasCategorias, obtenerGastoTodasCategorias } from '../src/db/queries/categorias';
import Toast from 'react-native-toast-message';
import CategoriasModal from '../src/components/CategoriasModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditarPresupuestos from '../src/components/EditarPresupuestosModal';
import { useLocalSearchParams } from 'expo-router';
import ReportesModal from '../src/components/GraficoTorta';

export default function HomeScreen() {
  const router = useRouter();
  const [periodos, setPeriodos] = useState([]);
  const [periodoIdx, setPeriodoIdx] = useState(0);
  const [resumen, setResumen] = useState([]);
  const [gastosOrdenados, setGastosOrdenados] = useState([]);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEstimado, setTotalEstimado] = useState(0);
  const [totalGastado, setTotalGastado] = useState(0);
  const gastadoExcede = totalGastado > totalIngresos;
  const restanteNegativo = (totalIngresos - totalGastado) < 0;
  const estimadoExcede = totalEstimado > totalIngresos;

  const { periodo_id } = useLocalSearchParams();
  const inicializado = useRef(false);
  const periodoIdxRef = useRef(0);

  useEffect(() => {
    cargarPeriodosInicial();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!inicializado.current) return;
      const hogares = obtenerHogares();
      if (hogares.length === 0) return;
      const lista = obtenerPeriodos(hogares[0].id);
      if (lista.length > 0) {
        setPeriodos(lista);
        const idx = periodoIdxRef.current;
        cargarResumen(lista[idx]?.id ?? lista[0].id);
      }
    }, [])
  );

  async function cargarPeriodosInicial() {
    try {
      let hogares = obtenerHogares();
      let hogarId;
      if (hogares.length === 0) {
        hogarId = crearHogar('Mi Hogar', 'HOGAR01');
      } else {
        hogarId = hogares[0].id;
      }
      let lista = obtenerPeriodos(hogarId);
      if (lista.length === 0) {
        const id = crearPeriodo(hogarId, mesActual());
        seedData(id);
        lista = obtenerPeriodos(hogarId);
      }
      setPeriodos(lista);
      if (periodo_id) {
        const idx = lista.findIndex(p => String(p.id) === String(periodo_id));
        if (idx !== -1) {
          setPeriodoIdx(idx);
          periodoIdxRef.current = idx;
          cargarResumen(lista[idx].id);
          return;
        }
      }
      cargarResumen(lista[0].id);
      setPeriodoIdx(0);
      periodoIdxRef.current = 0;
      cargarResumen(lista[0].id);
      inicializado.current = true;
    } catch (e) {
      console.error('Error cargando periodos:', e);
    }
  }

  async function cargarResumen(periodo_id) {
    const datos = obtenerResumenCategorias(periodo_id);
    setResumen(datos);

    const gastos = datos.filter(d => d.categoria_id !== 1);
    const ordenados = await cargarOrden(gastos, periodo_id);
    setGastosOrdenados(ordenados);

    const ingresos = datos.find(d => d.categoria_id === 1);
    setTotalIngresos(ingresos?.monto_real ?? 0);
    setTotalEstimado(obtenerGastoEsperadoTodasCategorias(periodo_id));
    setTotalGastado(obtenerGastoTodasCategorias(periodo_id));
  }

  async function cargarOrden(data, periodo_id) {
    try {
      const raw = await AsyncStorage.getItem(`orden_categorias_${periodo_id}`);
      if (!raw) return data;
      const orden = JSON.parse(raw);
      return [...data].sort((a, b) => orden.indexOf(a.categoria_id) - orden.indexOf(b.categoria_id));
    } catch {
      return data;
    }
  }

  async function guardarOrden(data, periodo_id) {
    try {
      const orden = data.map(item => item.categoria_id);
      await AsyncStorage.setItem(`orden_categorias_${periodo_id}`, JSON.stringify(orden));
    } catch (e) {
      console.error('Error guardando orden:', e);
    }
  }

  function moverArriba(index) {
    if (index === 0) return;
    const nuevo = [...gastosOrdenados];
    [nuevo[index - 1], nuevo[index]] = [nuevo[index], nuevo[index - 1]];
    setGastosOrdenados(nuevo);
    guardarOrden(nuevo, periodo?.id);
  }

  function moverAbajo(index) {
    if (index === gastosOrdenados.length - 1) return;
    const nuevo = [...gastosOrdenados];
    [nuevo[index + 1], nuevo[index]] = [nuevo[index], nuevo[index + 1]];
    setGastosOrdenados(nuevo);
    guardarOrden(nuevo, periodo?.id);
  }

  function irAnterior() {
    const nuevoIdx = periodoIdx + 1;
    if (nuevoIdx < periodos.length) {
      periodoIdxRef.current = nuevoIdx;
      setPeriodoIdx(nuevoIdx);
      cargarResumen(periodos[nuevoIdx].id);
    }
  }

  function irSiguiente() {
    const nuevoIdx = periodoIdx - 1;
    if (nuevoIdx >= 0) {
      periodoIdxRef.current = nuevoIdx;
      setPeriodoIdx(nuevoIdx);
      cargarResumen(periodos[nuevoIdx].id);
    }
  }

  function mostrarAlerta() {
    if (estimadoExcede) {
      Toast.show({ type: 'error', text1: 'El presupuesto estimado supera los ingresos' });
    }
    if (gastadoExcede) {
      Toast.show({ type: 'error', text1: 'El gasto real supera los ingresos' });
    }
  }

  const periodo = periodos[periodoIdx];

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={irAnterior}
          style={[styles.flecha, periodoIdx >= periodos.length - 1 && styles.flechaDisabled]}
          disabled={periodoIdx >= periodos.length - 1}
        >
          <Text style={styles.flechaTexto}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/periodo')} style={styles.periodoCenter}>
          <Text style={styles.periodoLabel}>Periodo</Text>
          <Text style={styles.periodoNombre}>{formatMes(periodo?.mes)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={irSiguiente}
          style={[styles.flecha, periodoIdx <= 0 && styles.flechaDisabled]}
          disabled={periodoIdx <= 0}
        >
          <Text style={styles.flechaTexto}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.totalesCard} onPress={mostrarAlerta}>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Estimado</Text>
          <Text style={[styles.totalValor, estimadoExcede && styles.rojo]}>
            {formatCLP(totalEstimado)}
          </Text>
        </View>
        <View style={styles.divisor} />
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Ingresos</Text>
          <Text style={styles.totalValor}>{formatCLP(totalIngresos)}</Text>
        </View>
        <View style={styles.divisor} />
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Gastado</Text>
          <Text style={[styles.totalValor, gastadoExcede && styles.rojo]}>
            {formatCLP(totalGastado)}
          </Text>
        </View>
        <View style={styles.divisor} />
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Restante</Text>
          <Text style={[styles.totalValor, restanteNegativo && styles.rojo]}>
            {formatCLP(totalIngresos - totalGastado)}
          </Text>
        </View>
      </TouchableOpacity>

      <ReportesModal
        periodo_id={periodo?.id}
        datos={resumen.map(d => ({
          nombre: d.categoria,
          valor: d.monto_real,
          esperado: d.monto_esperado,
          categoria_id: d.categoria_id,
        }))}
      />
      
      <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
        {/* Ingresos fijo arriba */}
        {resumen.filter(d => d.categoria_id === 1).map(item => (
          <ResumenItem
            key={String(item.categoria_id)}
            categoria={item}
            periodo_id={periodo?.id}
            onEliminado={() => cargarResumen(periodo?.id)}
            onPress={() => router.push(`/categoria/${item.categoria_id}?periodo_id=${periodo?.id}&nombre=${item.categoria}`)}
          />
        ))}

        {/* Gastos con botones orden */}
        {gastosOrdenados.map((item, index) => (
          <ResumenItem
            key={String(item.categoria_id)}
            categoria={item}
            periodo_id={periodo?.id}
            onEliminado={() => cargarResumen(periodo?.id)}
            onPress={() => router.push(`/categoria/${item.categoria_id}?periodo_id=${periodo?.id}&nombre=${item.categoria}`)}
            onSubir={index > 0 ? () => moverArriba(index) : null}
            onBajar={index < gastosOrdenados.length - 1 ? () => moverAbajo(index) : null}
          />
        ))}
      </ScrollView>

      <EditarPresupuestos
        periodo_id={periodo?.id}
        onActualizado={() => cargarResumen(periodo?.id)} />

      <CategoriasModal periodo_id={periodo?.id} onCategoriaAgregada={cargarResumen} />
      <Toast position='top' topOffset={10} onPress={() => Toast.hide()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#d7dbdf' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  flecha: { width: 44, alignItems: 'center', justifyContent: 'center' },
  flechaDisabled: { opacity: 0.3 },
  flechaTexto: { fontSize: 32, color: '#fff', lineHeight: 36 },
  periodoCenter: { flex: 1, alignItems: 'center' },
  periodoLabel: { fontSize: 12, color: '#c7d2fe' },
  periodoNombre: { fontSize: 18, fontWeight: '700', color: '#fff' },
  totalesCard: {
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
  totalItem: { flex: 1, alignItems: 'center' },
  totalLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 4 },
  totalValor: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  rojo: { color: '#ef4444' },
  divisor: { width: 1, backgroundColor: '#f1f5f9', marginVertical: 4 },
  lista: { paddingHorizontal: 16, paddingBottom: 10 },
  vacio: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 15 },
});