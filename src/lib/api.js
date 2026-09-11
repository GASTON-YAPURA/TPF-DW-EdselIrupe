export const API_URL = import.meta.env.VITE_API_URL || 'https://edsellrupe-api.onrender.com/api'

export function urlImagenServicio(id) {
  return `${API_URL}/servicios/${id}/imagen`
}

export function urlImagenGaleria(id) {
  return `${API_URL}/galeria/${id}/imagen`
}

export async function obtenerRecurso(path) {
  try {
    const res = await fetch(`${API_URL}${path}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch {
    return null
  }
}