import express from 'express'
import cors from 'cors'
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
  origin: [
    'http://localhost:5173',
    'https://tpf-dw-edsel-irupe.vercel.app',
    'https://tpf-dw-edsel-irupe-git-main-gaston-yapura-s-projects.vercel.app',
  ],
  methods: ['GET', 'POST'],
}))

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
        creada_en TIMESTAMP DEFAULT NOW()
      );
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
  const { servicio, fecha, horario, nombre, email, telefono, mensaje } = req.body

  if (!servicio || !fecha || !horario || !nombre || !email || !telefono) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO reservas (servicio, fecha, horario, nombre, email, telefono, mensaje)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [servicio, fecha, horario, nombre, email, telefono, mensaje || null]
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
