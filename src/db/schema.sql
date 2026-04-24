CREATE TABLE IF NOT EXISTS hogares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS periodos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hogar_id INTEGER,
  mes TEXT NOT NULL,
  FOREIGN KEY (hogar_id) REFERENCES hogares(id)
);

CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  icono TEXT
);

CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  categoria_id INTEGER,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS producto_periodo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER,
  periodo_id INTEGER,
  cantidad INTEGER DEFAULT 0,
  precio_unitario INTEGER DEFAULT 0,
  monto_esperado INTEGER DEFAULT 0,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (periodo_id) REFERENCES periodos(id),
  UNIQUE (producto_id, periodo_id) 
);

CREATE TABLE IF NOT EXISTS categoria_periodo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria_id INTEGER,
  periodo_id INTEGER,
  monto_esperado INTEGER DEFAULT 0,
  activo INTEGER DEFAULT 1;,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  FOREIGN KEY (periodo_id) REFERENCES periodos(id)
  UNIQUE (categoria_id, periodo_id) 
);