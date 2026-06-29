import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

const app = express()
const PORT = process.env.PORT || 3001

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

app.use(cors({
  origin: function (origin, callback) {
    const permitidos = [
      'http://localhost:5173',
      'https://tpf-dw-edsel-irupe.vercel.app',
    ]
    if (!origin || permitidos.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error('No autorizado por CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

const SECRETO = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123'

function generarToken(username) {
  const payload = { username, exp: Date.now() + 86400000 }
  const data = JSON.stringify(payload)
  const hash = crypto.createHmac('sha256', SECRETO).update(data).digest('hex')
  return Buffer.from(data + '.' + hash).toString('base64')
}

function verificarToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const [data, hash] = decoded.split('.')
    const esperado = crypto.createHmac('sha256', SECRETO).update(data).digest('hex')
    if (hash !== esperado) return null
    const payload = JSON.parse(data)
    if (payload.exp < Date.now()) return null
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

    console.log('Tablas verificadas/creadas correctamente')
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
  const { servicio, fecha, horario, nombre, email, telefono, mensaje, total } = req.body

  if (!servicio || !fecha || !horario || !nombre || !email || !telefono) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO reservas (servicio, fecha, horario, nombre, email, telefono, mensaje, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [servicio, fecha, horario, nombre, email, telefono, mensaje || null, total || 0]
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

app.post('/api/auth/login', (req, res) => {
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

  if (monto == null || monto < 0) {
    return res.status(400).json({ error: 'Monto inválido' })
  }

  try {
    const reserva = await pool.query('SELECT * FROM reservas WHERE id = $1', [id])
    if (reserva.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
    }

    const r = reserva.rows[0]
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
  const { servicio, fecha, horario, nombre, email, telefono, mensaje, total } = req.body

  if (!servicio || !fecha || !horario || !nombre || !email || !telefono) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO reservas (servicio, fecha, horario, nombre, email, telefono, mensaje, total, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendiente') RETURNING *`,
      [servicio, fecha, horario, nombre, email, telefono, mensaje || null, total || 0]
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
