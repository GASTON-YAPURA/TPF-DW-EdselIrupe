import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

const app = express()
const PORT = process.env.PORT || 3001

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Variables de entorno obligatorias: sin ellas el servidor no arranca.
const SECRETO = process.env.JWT_SECRET
const ADMIN_USER = process.env.ADMIN_USER
const ADMIN_PASS = process.env.ADMIN_PASS

if (!SECRETO || !ADMIN_USER || !ADMIN_PASS) {
  console.error(
    'Faltan variables de entorno obligatorias. Creá un archivo server/.env con: ' +
    'DATABASE_URL, JWT_SECRET, ADMIN_USER y ADMIN_PASS (ver server/.env.example).'
  )
  process.exit(1)
}

app.use(helmet())

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tpf-dw-edsel-irupe.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

// Límite de intentos de login para prevenir fuerza bruta (5 intentos cada 15 min).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intentalo en 15 minutos.' },
})

function generarToken(username) {
  return jwt.sign({ username }, SECRETO, { expiresIn: '1d' })
}

function verificarToken(token) {
  try {
    const payload = jwt.verify(token, SECRETO)
    return payload
  } catch {
    return null
  }
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }
  const payload = verificarToken(header.slice(7))
  if (!payload) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
  req.usuario = payload.username
  next()
}

app.use(express.json({ limit: '15mb' }))

// --- Validaciones del lado del servidor ---

function validarCampos(nombre, email, telefono) {
  if (!nombre || nombre.trim().length === 0 || nombre.length > 150) {
    return 'El nombre es obligatorio (máx. 150 caracteres)'
  }
  if (!email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Email inválido'
  }
  if (!telefono || telefono.length > 50 || !/^[\d\s+()-]{7,20}$/.test(telefono)) {
    return 'Teléfono inválido (solo números, +, -, entre 7 y 20 caracteres)'
  }
  return null
}

function validarFecha(fecha) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const f = new Date(`${fecha}T00:00:00`)
  if (isNaN(f.getTime())) return 'Fecha inválida'
  if (f < hoy) return 'La fecha no puede ser anterior a hoy'
  return null
}

function validarHorario(horario) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) return 'Horario inválido'
  return null
}

// El total se obtiene exclusivamente del catálogo (tabla servicios).
// El cliente nunca envía el precio: evita que un atacante reserve con total 0.
function precioNumerico(precio) {
  const n = parseInt(String(precio).replace(/[^0-9]/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

async function totalDeServicio(titulo) {
  const result = await pool.query(
    'SELECT precio FROM servicios WHERE LOWER(titulo) = LOWER($1)',
    [titulo]
  )
  if (result.rows.length === 0) return null
  return precioNumerico(result.rows[0].precio)
}

async function inicializarDB() {
  const client = await pool.connect()
  try {
    await client.query(`
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
        total INTEGER DEFAULT 0,
        abonado INTEGER DEFAULT 0,
        estado VARCHAR(20) DEFAULT 'pendiente',
        creada_en TIMESTAMP DEFAULT NOW()
      );
    `)

    await client.query(`
      ALTER TABLE reservas
        ADD COLUMN IF NOT EXISTS total INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS abonado INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente'
    `)

    await client.query(`
      ALTER TABLE servicios
        ADD COLUMN IF NOT EXISTS imagen BYTEA,
        ADD COLUMN IF NOT EXISTS imagen_mime VARCHAR(50)
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS galeria_fotos (
        id SERIAL PRIMARY KEY,
        coleccion VARCHAR(50) NOT NULL,
        nombre_archivo VARCHAR(150),
        mime VARCHAR(50) NOT NULL,
        bytes BYTEA NOT NULL,
        orden INT DEFAULT 0,
        creada_en TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_galeria_coleccion ON galeria_fotos (coleccion, orden);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_galeria_coleccion_archivo ON galeria_fotos (coleccion, nombre_archivo);

      CREATE TABLE IF NOT EXISTS galeria_colecciones (
        id VARCHAR(50) PRIMARY KEY,
        titulo VARCHAR(100) NOT NULL,
        orden INT DEFAULT 0,
        portada_foto_id INT REFERENCES galeria_fotos(id) ON DELETE SET NULL,
        creada_en TIMESTAMP DEFAULT NOW()
      );
    `)

    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_servicios_titulo ON servicios (titulo)')

    // Servicios por defecto durante el primer arranque.
    const serviciosDefault = [
      ['Sesiones de Eventos', 'Cobertura completa de fiestas, celebraciones y eventos sociales.', '4 horas', '$25.000'],
      ['Sesiones Particulares', 'Sesiones personalizadas para individuos o parejas.', '2 horas', '$15.000'],
      ['Sesiones Temáticas', 'Sesiones con escenografía y vestuario acorde a la temática elegida.', '3 horas', '$20.000'],
      ['Sesiones Infantiles', 'Sesiones para niños, escuelas y jardines de infantes.', '2 horas', '$18.000'],
      ['Sesiones Individuales y Grupales', 'Sesiones para fotografía individual o grupal.', '2 horas', '$12.000'],
    ]
    for (const s of serviciosDefault) {
      await client.query(
        `INSERT INTO servicios (titulo, descripcion, duracion, precio)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (titulo) DO NOTHING`,
        s
      )
    }

    console.log('Tablas verificadas/creadas y catálogo de servicios sincronizado')
  } finally {
    client.release()
  }
}

app.get('/api/servicios', async (_req, res) => {
  try {
    // No se envían los bytes de imagen en la lista: solo si tiene o no.
    const result = await pool.query(
      `SELECT id, titulo, descripcion, duracion, precio,
              (imagen IS NOT NULL) AS tiene_imagen
       FROM servicios ORDER BY id`
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Error al obtener servicios:', err)
    res.status(500).json({ error: 'Error al obtener servicios' })
  }
})

// --- Validación de imágenes (base64) ---
const MIMES_VALIDOS = new Set(['image/jpeg', 'image/png', 'image/webp'])
const TAMANIO_MAX_IMAGEN = 6 * 1024 * 1024 // 6 MB

function validarImagen(data, mime) {
  if (!MIMES_VALIDOS.has(mime)) {
    return { error: 'Formato no permitido (solo JPG, PNG o WebP)' }
  }
  const base64 = String(data || '').replace(/^data:[^;]+;base64,/, '')
  if (!base64) {
    return { error: 'La imagen está vacía' }
  }
  const bytes = Buffer.byteLength(base64, 'base64')
  if (bytes > TAMANIO_MAX_IMAGEN) {
    return { error: 'La imagen no puede superar los 6 MB' }
  }
  return { base64, bytes }
}

function validarServicio(titulo, descripcion, duracion, precio) {
  if (!titulo || titulo.trim().length === 0 || titulo.length > 100) {
    return 'El título es obligatorio (máx. 100 caracteres)'
  }
  if (!descripcion || descripcion.trim().length === 0 || descripcion.length > 1000) {
    return 'La descripción es obligatoria (máx. 1000 caracteres)'
  }
  if (!duracion || duracion.length > 50) {
    return 'La duración es obligatoria (máx. 50 caracteres)'
  }
  if (!precio || precio.length > 20 || !/^\$?[\d.,]+$/.test(String(precio))) {
    return 'El precio debe ser numérico (ej: $25.000)'
  }
  return null
}

// --- Servicios: CRUD (solo admin) ---
app.post('/api/servicios', authMiddleware, async (req, res) => {
  const { titulo, descripcion, duracion, precio } = req.body
  const error = validarServicio(titulo, descripcion, duracion, precio)
  if (error) return res.status(400).json({ error })
  try {
    const result = await pool.query(
      `INSERT INTO servicios (titulo, descripcion, duracion, precio)
       VALUES ($1, $2, $3, $4)
       RETURNING id, titulo, descripcion, duracion, precio, false AS tiene_imagen`,
      [titulo.trim(), descripcion.trim(), duracion, precio]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un servicio con ese título' })
    }
    console.error('Error al crear servicio:', err)
    res.status(500).json({ error: 'Error al crear el servicio' })
  }
})

app.put('/api/servicios/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  const { titulo, descripcion, duracion, precio } = req.body
  const error = validarServicio(titulo, descripcion, duracion, precio)
  if (error) return res.status(400).json({ error })
  try {
    const result = await pool.query(
      `UPDATE servicios
       SET titulo = $1, descripcion = $2, duracion = $3, precio = $4
       WHERE id = $5
       RETURNING id, titulo, descripcion, duracion, precio, false AS tiene_imagen`,
      [titulo.trim(), descripcion.trim(), duracion, precio, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un servicio con ese título' })
    }
    console.error('Error al actualizar servicio:', err)
    res.status(500).json({ error: 'Error al actualizar el servicio' })
  }
})

app.delete('/api/servicios/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM servicios WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' })
    }
    res.json({ mensaje: 'Servicio eliminado correctamente' })
  } catch (err) {
    console.error('Error al eliminar servicio:', err)
    res.status(500).json({ error: 'Error al eliminar el servicio' })
  }
})

// --- Imagen de servicio ---
app.get('/api/servicios/:id/imagen', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT imagen, imagen_mime FROM servicios WHERE id = $1',
      [req.params.id]
    )
    if (result.rows.length === 0 || !result.rows[0].imagen) {
      return res.status(404).json({ error: 'Imagen no disponible' })
    }
    res.set('Content-Type', result.rows[0].imagen_mime)
    res.set('Cache-Control', 'public, max-age=60')
    res.send(result.rows[0].imagen)
  } catch (err) {
    console.error('Error al obtener imagen de servicio:', err)
    res.status(500).json({ error: 'Error al obtener la imagen' })
  }
})

app.post('/api/servicios/:id/imagen', authMiddleware, async (req, res) => {
  const validador = validarImagen(req.body.data, req.body.mime)
  if (validador.error) return res.status(400).json({ error: validador.error })
  try {
    const existe = await pool.query('SELECT id FROM servicios WHERE id = $1', [req.params.id])
    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' })
    }
    await pool.query(
      'UPDATE servicios SET imagen = $1, imagen_mime = $2 WHERE id = $3',
      [Buffer.from(validador.base64, 'base64'), req.body.mime, req.params.id]
    )
    res.json({ mensaje: 'Imagen actualizada correctamente' })
  } catch (err) {
    console.error('Error al guardar imagen de servicio:', err)
    res.status(500).json({ error: 'Error al guardar la imagen' })
  }
})

app.delete('/api/servicios/:id/imagen', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'UPDATE servicios SET imagen = NULL, imagen_mime = NULL WHERE id = $1',
      [req.params.id]
    )
    res.json({ mensaje: 'Imagen eliminada (se usa la imagen por defecto)' })
  } catch (err) {
    console.error('Error al eliminar imagen de servicio:', err)
    res.status(500).json({ error: 'Error al eliminar la imagen' })
  }
})

// --- Galería: fotos y colecciones almacenadas en la base de datos ---
function slugificar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

app.get('/api/galeria', async (_req, res) => {
  try {
    const [fotos, colecciones] = await Promise.all([
      pool.query(
        `SELECT id, coleccion, nombre_archivo, mime, orden, creada_en
         FROM galeria_fotos ORDER BY coleccion, orden, id`
      ),
      pool.query(
        'SELECT id, titulo, orden, portada_foto_id FROM galeria_colecciones ORDER BY orden, id'
      ),
    ])
    const conColeccion = new Set(colecciones.rows.map((c) => c.id))
    const porFotos = new Set(fotos.rows.map((f) => f.coleccion))
    const porNombre = Array.from(porFotos)
      .filter((id) => !conColeccion.has(id))
      .sort()
      .map((id) => ({
        id,
        titulo: id.charAt(0).toUpperCase() + id.slice(1),
        orden: 0,
        portada_foto_id: null,
      }))
    res.json({
      colecciones: [...colecciones.rows, ...porNombre],
      fotos: fotos.rows,
    })
  } catch (err) {
    console.error('Error al obtener galería:', err)
    res.status(500).json({ error: 'Error al obtener galería' })
  }
})

app.get('/api/galeria/:id/imagen', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT bytes, mime FROM galeria_fotos WHERE id = $1',
      [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Foto no encontrada' })
    }
    res.set('Content-Type', result.rows[0].mime)
    res.set('Cache-Control', 'public, max-age=60')
    res.send(result.rows[0].bytes)
  } catch (err) {
    console.error('Error al obtener foto de galería:', err)
    res.status(500).json({ error: 'Error al obtener la foto' })
  }
})

app.post('/api/galeria/colecciones', authMiddleware, async (req, res) => {
  const titulo = String(req.body.titulo || '').trim().slice(0, 100)
  if (!titulo) {
    return res.status(400).json({ error: 'El nombre de la colección es obligatorio' })
  }
  const id = slugificar(String(req.body.id || titulo))
  if (!id) {
    return res.status(400).json({ error: 'El nombre no genera un id válido' })
  }
  try {
    const result = await pool.query(
      'INSERT INTO galeria_colecciones (id, titulo) VALUES ($1, $2) RETURNING id, titulo, orden, portada_foto_id',
      [id, titulo]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe una colección con ese nombre' })
    }
    console.error('Error al crear colección:', err)
    res.status(500).json({ error: 'Error al crear la colección' })
  }
})

app.put('/api/galeria/colecciones/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  const titulo = String(req.body.titulo || '').trim().slice(0, 100)
  const portada_foto_id = req.body.portada_foto_id != null ? Number(req.body.portada_foto_id) : null
  try {
    if (portada_foto_id != null) {
      const foto = await pool.query('SELECT id FROM galeria_fotos WHERE id = $1 AND coleccion = $2', [portada_foto_id, id])
      if (foto.rows.length === 0) {
        return res.status(400).json({ error: 'La foto no pertenece a esa colección' })
      }
    }
    const result = await pool.query(
      `UPDATE galeria_colecciones
       SET titulo = COALESCE(NULLIF($2, ''), titulo),
           portada_foto_id = $3
       WHERE id = $1
       RETURNING id, titulo, orden, portada_foto_id`,
      [id, titulo, portada_foto_id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colección no encontrada' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error al actualizar colección:', err)
    res.status(500).json({ error: 'Error al actualizar la colección' })
  }
})

app.delete('/api/galeria/colecciones/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM galeria_colecciones WHERE id = $1', [id])
    const borradas = await pool.query('DELETE FROM galeria_fotos WHERE coleccion = $1 RETURNING id', [id])
    res.json({ mensaje: `Colección eliminada (${borradas.rows.length} fotos)` })
  } catch (err) {
    console.error('Error al eliminar colección:', err)
    res.status(500).json({ error: 'Error al eliminar la colección' })
  }
})

app.post('/api/galeria', authMiddleware, async (req, res) => {
  const coleccion = String(req.body.coleccion || '').trim().slice(0, 50)
  if (!coleccion) {
    return res.status(400).json({ error: 'La colección es obligatoria' })
  }
  const validador = validarImagen(req.body.data, req.body.mime)
  if (validador.error) return res.status(400).json({ error: validador.error })
  const nombre_archivo = String(req.body.nombre_archivo || '').trim().slice(0, 150) || null
  try {
    const coleccionId = slugificar(coleccion)
    await pool.query(
      'INSERT INTO galeria_colecciones (id, titulo) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
      [coleccionId, coleccion]
    )
    const orden = await pool.query(
      'SELECT COALESCE(MAX(orden), 0) + 1 AS sig FROM galeria_fotos WHERE coleccion = $1',
      [coleccionId]
    )
    const result = await pool.query(
      `INSERT INTO galeria_fotos (coleccion, nombre_archivo, mime, bytes, orden)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, coleccion, nombre_archivo, mime, orden, creada_en`,
      [coleccionId, nombre_archivo, req.body.mime, Buffer.from(validador.base64, 'base64'), orden.rows[0].sig]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe una foto con ese nombre en la colección' })
    }
    console.error('Error al subir foto de galería:', err)
    res.status(500).json({ error: 'Error al subir la foto' })
  }
})

app.delete('/api/galeria/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM galeria_fotos WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Foto no encontrada' })
    }
    res.json({ mensaje: 'Foto eliminada correctamente' })
  } catch (err) {
    console.error('Error al eliminar foto de galería:', err)
    res.status(500).json({ error: 'Error al eliminar la foto' })
  }
})

app.post('/api/reservas', async (req, res) => {
  const { servicio, fecha, horario, nombre, email, telefono, mensaje } = req.body

  if (!servicio || !fecha || !horario || !nombre || !email || !telefono) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos' })
  }

  const errorCampos = validarCampos(nombre, email, telefono)
  if (errorCampos) return res.status(400).json({ error: errorCampos })

  const errorFecha = validarFecha(fecha)
  if (errorFecha) return res.status(400).json({ error: errorFecha })

  const errorHorario = validarHorario(horario)
  if (errorHorario) return res.status(400).json({ error: errorHorario })

  const total = await totalDeServicio(servicio)
  if (total === null) {
    return res.status(400).json({ error: 'El servicio seleccionado no existe' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO reservas (servicio, fecha, horario, nombre, email, telefono, mensaje, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [servicio, fecha, horario, nombre, email, telefono, mensaje || null, total]
    )
    res.status(201).json({ id: result.rows[0].id, mensaje: 'Turno registrado correctamente' })
  } catch (err) {
    console.error('Error al registrar turno:', err)
    res.status(500).json({ error: 'Error al registrar el turno' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ estado: 'ok', timestamp: new Date().toISOString() })
})

app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
  }
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }
  const token = generarToken(username)
  res.json({ token })
})

app.get('/api/reservas', authMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reservas ORDER BY creada_en DESC'
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Error al obtener reservas:', err)
    res.status(500).json({ error: 'Error al obtener reservas' })
  }
})

app.get('/api/admin/kpis', authMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS reservas_activas,
        COALESCE(SUM(abonado), 0)::int AS ingresos_registrados,
        COALESCE(SUM(total - abonado), 0)::int AS cobro_pendiente
      FROM reservas
    `)
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error al obtener KPIs:', err)
    res.status(500).json({ error: 'Error al obtener KPIs' })
  }
})

app.put('/api/reservas/:id/cobro', authMiddleware, async (req, res) => {
  const { id } = req.params
  const { monto } = req.body

  if (monto == null || monto <= 0) {
    return res.status(400).json({ error: 'Monto inválido' })
  }

  try {
    const reserva = await pool.query('SELECT * FROM reservas WHERE id = $1', [id])
    if (reserva.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
    }

    const r = reserva.rows[0]
    const saldoPendiente = r.total - r.abonado

    if (monto > saldoPendiente) {
      return res.status(400).json({ error: `El monto supera el saldo pendiente ($${saldoPendiente})` })
    }

    const nuevoAbonado = r.abonado + monto
    let nuevoEstado = r.estado
    if (nuevoAbonado >= r.total) {
      nuevoEstado = 'completado'
    } else if (nuevoAbonado > 0) {
      nuevoEstado = 'señado'
    }

    await pool.query(
      'UPDATE reservas SET abonado = $1, estado = $2 WHERE id = $3',
      [nuevoAbonado, nuevoEstado, id]
    )

    const actualizada = await pool.query('SELECT * FROM reservas WHERE id = $1', [id])
    res.json(actualizada.rows[0])
  } catch (err) {
    console.error('Error al registrar cobro:', err)
    res.status(500).json({ error: 'Error al registrar cobro' })
  }
})

app.delete('/api/reservas/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM reservas WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
    }
    res.json({ mensaje: 'Reserva eliminada correctamente' })
  } catch (err) {
    console.error('Error al eliminar reserva:', err)
    res.status(500).json({ error: 'Error al eliminar reserva' })
  }
})

app.post('/api/reservas/manual', authMiddleware, async (req, res) => {
  const { servicio, fecha, horario, nombre, email, telefono, mensaje } = req.body

  if (!servicio || !fecha || !horario || !nombre || !email || !telefono) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos' })
  }

  const errorCampos = validarCampos(nombre, email, telefono)
  if (errorCampos) return res.status(400).json({ error: errorCampos })

  const errorFecha = validarFecha(fecha)
  if (errorFecha) return res.status(400).json({ error: errorFecha })

  const errorHorario = validarHorario(horario)
  if (errorHorario) return res.status(400).json({ error: errorHorario })

  const total = await totalDeServicio(servicio)
  if (total === null) {
    return res.status(400).json({ error: 'El servicio seleccionado no existe' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO reservas (servicio, fecha, horario, nombre, email, telefono, mensaje, total, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendiente') RETURNING *`,
      [servicio, fecha, horario, nombre, email, telefono, mensaje || null, total]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Error al crear reserva manual:', err)
    res.status(500).json({ error: 'Error al crear la reserva' })
  }
})

async function iniciar() {
  try {
    await inicializarDB()
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Error al iniciar servidor:', err)
    process.exit(1)
  }
}

iniciar()