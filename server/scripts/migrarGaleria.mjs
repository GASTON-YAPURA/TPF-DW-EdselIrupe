// Migra las 60 fotos de src/assets/galeria a la base de datos (tabla galeria_fotos)
// y crea las 6 colecciones en galeria_colecciones con su portada (primera foto).
//
// Uso (una sola vez, desde tu PC):
//   node scripts/migrarGaleria.mjs
// La conexión sale de DATABASE_URL: usá la External Database URL de tu Postgres
// de Render (server/.env o variable de entorno). Es idempotente: si se corre de
// nuevo, no duplica fotos ni pisa una portada ya elegida.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const TITULOS = {
  bebes: 'Bebés',
  paisajes: 'Paisajes',
  bodas: 'Bodas',
  infantiles: 'Infantiles',
  embarazo: 'Embarazo',
  bautismos: 'Bautismos',
}
const ORDEN_COLECCIONES = ['bebes', 'paisajes', 'bodas', 'infantiles', 'embarazo', 'bautismos']

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }

const galeriaDir = fileURLToPath(new URL('../../src/assets/galeria/', import.meta.url))

async function migrar() {
  if (!process.env.DATABASE_URL) {
    console.error('Falta DATABASE_URL (externo de Render). Ponelo en server/.env o como variable de entorno.')
    process.exit(1)
  }

  const resumen = {}
  for (const [i, coleccion] of ORDEN_COLECCIONES.entries()) {
    const dir = path.join(galeriaDir, coleccion)
    if (!fs.existsSync(dir)) {
      console.warn(`  ! carpeta "${coleccion}" no encontrada, se saltea`)
      continue
    }
    const archivos = fs
      .readdirSync(dir)
      .filter((f) => MIME[path.extname(f).toLowerCase()])
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

    await pool.query(
      `INSERT INTO galeria_colecciones (id, titulo, orden)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, orden = EXCLUDED.orden`,
      [coleccion, TITULOS[coleccion] || coleccion, i]
    )

    const existentes = new Set(
      (await pool.query('SELECT nombre_archivo FROM galeria_fotos WHERE coleccion = $1', [coleccion])).rows.map((r) => r.nombre_archivo)
    )

    let insertadas = 0
    for (const [j, archivo] of archivos.entries()) {
      if (existentes.has(archivo)) continue
      const bytes = fs.readFileSync(path.join(dir, archivo))
      await pool.query(
        `INSERT INTO galeria_fotos (coleccion, nombre_archivo, mime, bytes, orden)
         VALUES ($1, $2, $3, $4, $5)`,
        [coleccion, archivo, MIME[path.extname(archivo).toLowerCase()], bytes, j + 1]
      )
      insertadas += 1
    }

    await pool.query(
      `UPDATE galeria_colecciones
       SET portada_foto_id = (
         SELECT id FROM galeria_fotos WHERE coleccion = $1 ORDER BY orden, id LIMIT 1
       )
       WHERE id = $1 AND portada_foto_id IS NULL`,
      [coleccion]
    )

    resumen[coleccion] = { archivos: archivos.length, insertadas }
  }

  console.log('\nMigración de galería completada:')
  for (const [c, r] of Object.entries(resumen)) {
    console.log(`  ${c}: ${r.insertadas} de ${r.archivos} fotos insertadas`)
  }
  await pool.end()
}

migrar().catch((err) => {
  console.error('Error durante la migración:', err)
  process.exit(1)
})