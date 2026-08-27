CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  tipo VARCHAR(20) NOT NULL
);

CREATE TABLE promociones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  tipo_descuento VARCHAR(30) NOT NULL,
  valor NUMERIC(12, 2) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Programada'
);

INSERT INTO productos (nombre, tipo) VALUES
  ('Laptop HP 15', 'producto'),
  ('Mouse inalambrico', 'producto'),
  ('Computadores', 'categoria'),
  ('Accesorios', 'categoria'),
  ('Audifonos Bluetooth', 'producto');
