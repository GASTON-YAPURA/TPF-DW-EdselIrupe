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

app.use(express.json())

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
    const result = await pool.query('SELECT * FROM servicios ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    console.error('Error al obtener servicios:', err)
    res.status(500).json({ error: 'Error al obtener servicios' })
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