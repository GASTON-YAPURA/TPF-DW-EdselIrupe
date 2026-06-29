-- Inicializar base de datos para Edsellrupe

CREATE TABLE IF NOT EXISTS servicios (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  duracion VARCHAR(50) NOT NULL,
  precio VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  servicio VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  horario TIME NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  mensaje TEXT,
  creada_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO servicios (titulo, descripcion, duracion, precio) VALUES
  ('Sesiones de Eventos', 'Cobertura completa de fiestas, celebraciones y eventos sociales.', '4 horas', '$25.000'),
  ('Sesiones Particulares', 'Sesiones personalizadas para individuos o parejas.', '2 horas', '$15.000'),
  ('Sesiones Temáticas', 'Sesiones con escenografía y vestuario acorde a la temática elegida.', '3 horas', '$20.000'),
  ('Sesiones Infantiles', 'Sesiones para niños, escuelas y jardines de infantes.', '2 horas', '$18.000'),
  ('Sesiones Individuales y Grupales', 'Sesiones para fotografía individual o grupal.', '2 horas', '$12.000');
