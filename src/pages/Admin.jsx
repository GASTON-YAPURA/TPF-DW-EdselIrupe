import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import ScrollToTop from '../components/ScrollToTop'
import { LogIn, LogOut, Lock, CalendarDays, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://edsellrupe-api.onrender.com/api'

function Admin() {
  const navigate = useNavigate()
  const [logueado, setLogueado] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
        return
      }
      sessionStorage.setItem('token', data.token)
      setLogueado(true)
      await cargarReservas(data.token)
    } catch {
      setError('Error de conexión con el servidor')
    } finally {
      setCargando(false)
    }
  }

  async function cargarReservas(token) {
    try {
      const res = await fetch(`${API_URL}/reservas`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setReservas(data)
      } else {
        setError('Error al cargar las reservas')
      }
    } catch {
      setError('Error de conexión')
    }
  }

  function cerrarSesion() {
    sessionStorage.removeItem('token')
    setLogueado(false)
    setReservas([])
    setUsername('')
    setPassword('')
  }

  const tokenGuardado = sessionStorage.getItem('token')

  return (
    <>
      <SEO title="Panel Admin" description="Panel de administración de Edsellrupe - Fotografía" />

      {!logueado && !tokenGuardado ? (
        <div className="bg-[#F5F1EC] min-h-screen">
          <section className="pt-30 pb-20 px-4 max-w-md mx-auto">
            <div className="text-center mb-10">
              <Lock size={40} className="mx-auto text-[#C1121F] mb-4" />
              <h1 className="text-3xl md:text-4xl font-bold text-[#373435]">
                Panel <span className="text-[#C1121F]">Admin</span>
              </h1>
              <p className="text-[#373435] opacity-70 mt-2">
                Ingresá con tus credenciales
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[#373435] font-semibold mb-1">Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError('') }}
                  required
                  className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 bg-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#C1121F]"
                />
              </div>
              <div>
                <label className="block text-[#373435] font-semibold mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  required
                  className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 bg-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#C1121F]"
                />
              </div>
              {error && <p className="text-[#C1121F] text-sm">{error}</p>}
              <button
                type="submit"
                disabled={cargando}
                className="w-full flex items-center justify-center gap-2 bg-[#C1121F] text-[#FEFEFE] py-3 rounded-md font-semibold hover:bg-[#5A0B15] transition-colors cursor-pointer disabled:opacity-60"
              >
                <LogIn size={18} />
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </section>
        </div>
      ) : (
        <div className="bg-[#F5F1EC] min-h-screen">
          <section className="pt-30 pb-20 px-4 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#373435]">
                Reservas <span className="text-[#C1121F]">Activas</span>
              </h1>
              <button
                onClick={cerrarSesion}
                className="flex items-center gap-2 border-2 border-[#373435] text-[#373435] px-4 py-2 rounded-md font-semibold hover:bg-[#373435] hover:text-[#FEFEFE] transition-colors cursor-pointer"
              >
                <LogOut size={18} />
                Salir
              </button>
            </div>

            {reservas.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-[#373435] opacity-60">No hay reservas registradas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-[#FEFEFE] rounded-lg shadow-sm overflow-hidden">
                  <thead>
                    <tr className="bg-[#373435] text-[#FEFEFE]">
                      <th className="text-left px-4 py-3 text-sm font-semibold">#</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">Cliente</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">Email</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">Teléfono</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">Servicio</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">Fecha</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">Horario</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">Mensaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.map((r, i) => (
                      <tr key={r.id} className={i % 2 === 0 ? 'bg-[#F5F1EC]' : 'bg-[#FEFEFE]'}>
                        <td className="px-4 py-3 text-sm text-[#373435]">{r.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-[#373435]">{r.nombre}</td>
                        <td className="px-4 py-3 text-sm text-[#373435]">{r.email}</td>
                        <td className="px-4 py-3 text-sm text-[#373435]">{r.telefono}</td>
                        <td className="px-4 py-3 text-sm text-[#373435]">{r.servicio}</td>
                        <td className="px-4 py-3 text-sm text-[#373435]">{r.fecha}</td>
                        <td className="px-4 py-3 text-sm text-[#373435]">{r.horario}</td>
                        <td className="px-4 py-3 text-sm text-[#373435] opacity-70">{r.mensaje || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <ScrollToTop />
        </div>
      )}
    </>
  )
}

export default Admin
