import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react';
import { Svg, G, Path } from 'react-native-svg';
import { formatCLP } from '../utils/calculos';
import { obtenerProductosMasComprados } from '../db/queries/producto_periodo';

function GraficoTorta({ datos }) {

    let total = 0;
    datos.forEach(d => {
        total += d.valor;
    });
    console.log("[GraficoTorta] datos grafico: ", datos, "total: ", total)

    if (total === 0) return <Text style={styles.vacio}>Sin datos</Text>;

    const colores = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];
    const MAX_SEGMENTOS = 100;

    let datosAgrupados = [...datos].sort((a, b) => b.valor - a.valor);
    if (datosAgrupados.length > MAX_SEGMENTOS) {
        const top = datosAgrupados.slice(0, MAX_SEGMENTOS - 1);
        const otros = datosAgrupados.slice(MAX_SEGMENTOS - 1);
        const totalOtros = otros.reduce((acc, d) => acc + d.valor, 0);
        datosAgrupados = [...top, { nombre: 'Otros', valor: totalOtros }];
    }

    const cx = 100, cy = 100, r = 80;
    let anguloActual = -Math.PI / 2;
    const segmentos = datosAgrupados.map((d, i) => {
        const porcentaje = d.valor / total;
        const angulo = porcentaje * 2 * Math.PI;
        const x1 = cx + r * Math.cos(anguloActual);
        const y1 = cy + r * Math.sin(anguloActual);
        anguloActual += angulo;
        const x2 = cx + r * Math.cos(anguloActual);
        const y2 = cy + r * Math.sin(anguloActual);
        const largeArc = angulo > Math.PI ? 1 : 0;
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        return { path, color: colores[i % colores.length], ...d };
    });

    return (
        <View style={styles.graficoContainer}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
                <G>
                    {segmentos.map((s, i) => (
                        <Path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={2} />
                    ))}
                </G>
            </Svg>
            <ScrollView style={styles.leyendaScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.leyenda}>
                    <View style={styles.leyendaItem}>
                        <View style={[styles.leyendaColor, { backgroundColor: 'red' }]} />
                        <Text style={styles.leyendaNombre} numberOfLines={1}>{'Total'}</Text>
                        <Text style={styles.leyendaValor}>{formatCLP(total, false)}</Text>
                    </View>

                    {segmentos.map((s, i) => (
                        <View key={i} style={styles.leyendaItem}>
                            <View style={[styles.leyendaColor, { backgroundColor: s.color }]} />
                            <Text style={styles.leyendaNombre} numberOfLines={1}>{s.nombre}</Text>
                            <Text style={styles.leyendaValor}>{formatCLP(s.valor, false)}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

export default function ReportesModal({ datos, periodo_id }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [filtro, setFiltro] = useState('gastos');

    const datosFiltrados = datos?.filter(d => d.nombre !== 'Ingresos') ?? [];

    const productos = obtenerProductosMasComprados(periodo_id) ?? [];

    console.log('[ReportesModal] productos raw:', productos);

    // 🔥 Agrupación correcta por producto
    const productosAgrupados = Object.values(
        productos.reduce((acc, p) => {
            if (!acc[p.nombre]) {
                acc[p.nombre] = {
                    nombre: p.nombre,
                    cantidad: 0,
                    valor: 0
                };
            }

            const cantidad = Number(p.cantidad) || 0;
            const precio = Number(p.precio_unitario) || 0;

            acc[p.nombre].cantidad += cantidad;
            acc[p.nombre].valor += cantidad * precio;

            return acc;
        }, {})
    );

    // 📦 Cantidad total por producto
    const datosProductosCantidad = productosAgrupados.map(p => ({
        nombre: p.nombre,
        valor: p.cantidad
    }));

    // 💰 Valor total por producto
    const datosProductosValor = productosAgrupados.map(p => ({
        nombre: p.nombre,
        valor: p.valor
    }));

    const graficos = {
        gastos: <GraficoTorta datos={datosFiltrados} />,
        cantidad: <GraficoTorta datos={datosProductosCantidad} />,
        valor: <GraficoTorta datos={datosProductosValor} />,
    };

    return (
        <View>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.buttonText}>📊 Resumen de gastos</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.container}>

                        <TouchableOpacity
                            style={styles.dragBarContainer}
                            onPress={() => setModalVisible(false)}
                        >
                            <View style={styles.dragBar} />
                        </TouchableOpacity>

                        <Text style={styles.titulo}>Resumen del periodo</Text>

                        {/* FILTROS */}
                        <View style={styles.filtros}>
                            {['gastos', 'cantidad', 'valor'].map(f => (
                                <TouchableOpacity
                                    key={f}
                                    style={[styles.filtroBtn, filtro === f && styles.filtroActivo]}
                                    onPress={() => setFiltro(f)}
                                >
                                    <Text style={[styles.filtroTexto, filtro === f && styles.filtroTextoActivo]}>
                                        {f === 'gastos'
                                            ? 'Gastos'
                                            : f === 'cantidad'
                                                ? 'Cant Produc'
                                                : 'Gasto x producto'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* GRAFICOS */}
                        {graficos[filtro]}

                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#6365f1d3',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        margin: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        maxHeight: '85%',
    },
    dragBar: {
        width: 40,
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    dragBarContainer: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    titulo: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
        textAlign: 'center',
    },
    filtros: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    filtroBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
    },
    filtroActivo: {
        backgroundColor: '#6365f1d3',
    },
    filtroTexto: {
        fontSize: 13,
        color: '#64748b',
    },
    filtroTextoActivo: {
        color: '#fff',
        fontWeight: '600',
    },
    graficoContainer: {
        alignItems: 'center',
        gap: 16,
        paddingBottom: 12,
    },
    leyenda: {
        width: '100%',
        padding: 10
    },
    leyendaScroll: {
        maxHeight: 200,
        width: '100%',
        backgroundColor: '#99a3ad',
        borderRadius: 8,
    },
    leyendaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 1,
        paddingHorizontal: 5,
        borderRadius: 4,
        marginBottom: 1,
        borderBottomWidth: 1,
        backgroundColor: '#ffffff',
        borderBottomColor: '#e2e8f0',
    },
    leyendaColor: {
        width: 12,
        height: 12,
        borderRadius: 3,
    },
    leyendaNombre: {
        flex: 1,
        fontSize: 14,
        color: '#1e293b',
    },
    leyendaValor: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    listaScroll: {
        maxHeight: 200,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        marginTop: 8,
    },
    productoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        gap: 8,
    },
    productoRank: {
        fontSize: 13,
        color: '#ffffff',
        width: 28,
    },
    productoNombre: {
        flex: 1,
        fontSize: 14,
        color: '#1e293b',
    },
    productoCantidad: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366f1',
    },
    vacio: {
        color: '#ffffff',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 15,
    },
});