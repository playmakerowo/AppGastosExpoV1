import { getDB } from '../db/database';

// Datos extraídos del Excel Mayo.xlsx
const CATEGORIAS = [
  { nombre: 'Ingresos',      icono: '💰' },
  { nombre: 'Fijos',         icono: '🏠' },
  { nombre: 'Comida',        icono: '🛒' },
  { nombre: 'Suscripciones', icono: '📱' },
  { nombre: 'Limpieza',      icono: '🧹' },
  { nombre: 'Higiene',       icono: '🧴' },
  { nombre: 'Salud',         icono: '❤️' },
  { nombre: 'Transporte',    icono: '🚌' },
  { nombre: 'Ocio/Gustos',   icono: '🎮' },
  { nombre: 'Gastos Comunes',icono: '🏢' },
  { nombre: 'Servicios',     icono: '💡' },
  { nombre: 'Ahorro',        icono: '🏦' },
  { nombre: 'Tarjeta',       icono: '💳' },
];

const PRODUCTOS_POR_CATEGORIA = {
  Ingresos:       [{ nombre: 'Sueldo', cantidad: 1, precio: 1048000 }],
  Fijos:          [{ nombre: 'Arriendo', cantidad: 1, precio: 310000 }],
  Tarjeta:        [],
  Ahorro:         [{ nombre: 'Ahorro', cantidad: 1, precio: 100000 }],
  Transporte:     [],
  'Gastos Comunes': [{ nombre: 'Gastos Comunes', cantidad: 1, precio: 105000 }],
  Servicios: [
    { nombre: 'Luz',  cantidad: 1, precio: 40000 },
    { nombre: 'Agua', cantidad: 1, precio: 20000 },
  ],
  Salud:   [],
  Higiene: [],
  'Ocio/Gustos': [],
  Suscripciones: [
    { nombre: 'Youtube Premium', cantidad: 1, precio: 9000 },
    { nombre: 'Teléfono',        cantidad: 1, precio: 26000 },
    { nombre: 'Internet Hogar',  cantidad: 1, precio: 15000 },
    { nombre: 'Mercado Libre',   cantidad: 1, precio: 3000 },
  ],
  Limpieza: [
    { nombre: 'Cloro',          cantidad: 1,  precio: 1350 },
    { nombre: 'Detergente',     cantidad: 2,  precio: 5000 },
    { nombre: 'Suavisante',     cantidad: 1,  precio: 5000 },
    { nombre: 'Lava Loza',      cantidad: 1,  precio: 3000 },
    { nombre: 'Cif',            cantidad: 1,  precio: 2000 },
    { nombre: 'Traperos',       cantidad: 2,  precio: 2500 },
    { nombre: 'Nova (Pack 3)',   cantidad: 3,  precio: 1700 },
    { nombre: 'Lisoform',       cantidad: 1,  precio: 2000 },
  ],
  Comida: [
    { nombre: 'Arroz',              cantidad: 5,  precio: 1000 },
    { nombre: 'Tomate',             cantidad: 1,  precio: 1000 },
    { nombre: 'Huevos (12 uni)',     cantidad: 2,  precio: 2600 },
    { nombre: 'Cebollas',           cantidad: 1,  precio: 1000 },
    { nombre: 'Fideos (pack 4)',     cantidad: 1,  precio: 3000 },
    { nombre: 'Salsa tomate (x6)',   cantidad: 2,  precio: 3000 },
    { nombre: 'Carne Molida',        cantidad: 3,  precio: 2600 },
    { nombre: 'Pan',                 cantidad: 4,  precio: 1890 },
    { nombre: 'Harina',              cantidad: 2,  precio: 890  },
    { nombre: 'Queso',               cantidad: 1,  precio: 4000 },
    { nombre: 'Chancho',             cantidad: 1,  precio: 2500 },
    { nombre: 'Leche',               cantidad: 3,  precio: 1300 },
    { nombre: 'Limón',               cantidad: 1,  precio: 1500 },
    { nombre: 'Aceite',              cantidad: 3,  precio: 1500 },
    { nombre: 'Mantequilla',         cantidad: 1,  precio: 1000 },
    { nombre: 'Nuggets',             cantidad: 2,  precio: 3200 },
    { nombre: 'Yogurt',              cantidad: 3,  precio: 1890 },
    { nombre: 'Naranja',             cantidad: 1,  precio: 2000 },
    { nombre: 'Plátano',             cantidad: 1,  precio: 1500 },
    { nombre: 'Sopas',               cantidad: 6,  precio: 700  },
    { nombre: 'Atún',                cantidad: 4,  precio: 1000 },
    { nombre: 'Agua (Bidón)',         cantidad: 3,  precio: 3000 },
    { nombre: 'Jugo',                cantidad: 5,  precio: 1500 },
    { nombre: 'Café',                cantidad: 2,  precio: 4500 },
    { nombre: 'Carne',               cantidad: 2,  precio: 4000 },
    { nombre: 'Pollo',               cantidad: 2,  precio: 5000 },
    { nombre: 'Zanahoria',           cantidad: 1,  precio: 2000 },
    { nombre: 'Paté de Gatos',       cantidad: 6,  precio: 1200 },
    { nombre: 'Gelatina',            cantidad: 7,  precio: 800  },
  ],
};

// Presupuestos esperados por categoría (del resumen Mayo)
const PRESUPUESTOS = {
  Ingresos:        1048000,
  Fijos:           310000,
  Tarjeta:         274000,
  Ahorro:          100000,
  Transporte:      38000,
  Suscripciones:   60000,
  Limpieza:        60000,
  Higiene:         30000,
  Salud:           50000,
  'Ocio/Gustos':   50000,
  Comida:          180000,
  'Gastos Comunes':105000,
  Servicios:       60000,
};

const CATEGORIAS_INICIALES = ['Ingresos', 'Fijos', 'Ahorro', 'Suscripciones'];

export function seedData(periodoId) {
  const db = getDB();

  const yaExiste = db.getFirstSync(
    'SELECT id FROM categoria_periodo WHERE periodo_id = ?',
    [periodoId]
  );

  if (yaExiste) return;

  const categorias = db.getAllSync('SELECT * FROM categorias');
  const catMap = {};
  categorias.forEach(c => { catMap[c.nombre] = c.id; });

  CATEGORIAS_INICIALES.forEach(catNombre => {
    const catId = catMap[catNombre];
    if (!catId) return;

    const presupuesto = PRESUPUESTOS[catNombre] || 0;

    db.runSync(
      'INSERT OR IGNORE INTO categoria_periodo (categoria_id, periodo_id, monto_esperado) VALUES (?, ?, ?)',
      [catId, periodoId, presupuesto]
    );
  });

  console.log('[seedData] COMPLETADO periodo', periodoId);
}

export function seedCategorias() {
  const db = getDB();
  const existe = db.getFirstSync('SELECT id FROM categorias LIMIT 1');
  if (existe) return;

  CATEGORIAS.forEach(cat => {
    db.runSync(
      'INSERT OR IGNORE INTO categorias (nombre, icono) VALUES (?, ?)',
      [cat.nombre, cat.icono]
    );
  });

  // Insertar productos base
  const categorias = db.getAllSync('SELECT * FROM categorias');
  const catMap = {};
  categorias.forEach(c => { catMap[c.nombre] = c.id; });

  Object.entries(PRODUCTOS_POR_CATEGORIA).forEach(([catNombre, productos]) => {
    const catId = catMap[catNombre];
    if (!catId) return;
    productos.forEach(prod => {
      db.runSync(
        'INSERT OR IGNORE INTO productos (nombre, categoria_id) VALUES (?, ?)',
        [prod.nombre, catId]
      );
    });
  });

  console.log('Categorías y productos base insertados');
}
