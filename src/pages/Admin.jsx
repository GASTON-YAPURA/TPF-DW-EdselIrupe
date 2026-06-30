import { useState, useEffect } from 'react'
import SEO from '../components/SEO'
import ScrollToTop from '../components/ScrollToTop'
import { LogIn, LogOut, Lock, Plus, Trash2, DollarSign, CalendarDays, Clock, User, Mail, Phone, MessageSquare, BarChart3, TrendingUp, AlertCircle, X, Loader2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://edsellrupe-api.onrender.com/api'

const serviciosList = [
  'Sesiones de Eventos',
  'Sesiones Particulares',
  'Sesiones Temáticas',
  'Sesiones Infantiles',
  'Sesiones Individuales y Grupales',
]

function Admin() {
  const [logueado, setLogueado] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [reservas, setReservas] = useState([])
  const [kpis, setKpis] = useState({ reservas_activas: 0, ingresos_registrados: 0, cobro_pendiente: 0 })
  const [cargando, setCargando] = useState(false)
  const [cargandoDatos, setCargandoDatos] = useState(false)
  const [modalCobro, setModalCobro] = useState(null)
  const [montoCobro, setMontoCobro] = useState('')
  const [modalManual, setModalManual] = useState(false)
  const [formManual, setFormManual] = useState({ servicio: '', fecha: '', horario: '', nombre: '', email: '', telefono: '', mensaje: '', total: '' })

  const tokenGuardado = sessionStorage.getItem('token')

  useEffect(() => {
    if (tokenGuardado) {
      setLogueado(true)
      cargarDatos(tokenGuardado)
    }
  }, [])

  async function cargarDatos(token) {
    setCargandoDatos(true)
    try {
      const [resReservas, resKpis] = await Promise.all([
        fetch(`${API_URL}/reservas`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/kpis`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (resReservas.ok) setReservas(await resReservas.json())
      if (resKpis.ok) setKpis(await resKpis.json())
    } catch {
      setError('Error al cargar datos')
    } finally {
      setCargandoDatos(false)
    }
  }

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
      if (!res.ok) { setError(data.error || 'Error al iniciar sesión'); return }
      sessionStorage.setItem('token', data.token)
      setLogueado(true)
      await cargarDatos(data.token)
    } catch { setError('Error de conexión') }
    finally { setCargando(false) }
  }

  function cerrarSesion() {
    sessionStorage.removeItem('token')
    setLogueado(false)
    setReservas([])
    setKpis({ reservas_activas: 0, ingresos_registrados: 0, cobro_pendiente: 0 })
  }

  async function handleCobro() {
    if (!montoCobro || montoCobro <= 0) return
    try {
      const res = await fetch(`${API_URL}/reservas/${modalCobro}/cobro`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenGuardado}` },
        body: JSON.stringify({ monto: Number(montoCobro) }),
      })
      if (res.ok) {
        setModalCobro(null)
        setMontoCobro('')
        await cargarDatos(tokenGuardado)
      }
    } catch { setError('Error al registrar cobro') }
  }

  async function handleEliminar(id) {
    if (!window.confirm('¿Eliminar esta reserva?')) return
    try {
      const res = await fetch(`${API_URL}/reservas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenGuardado}` },
      })
      if (res.ok) await cargarDatos(tokenGuardado)
    } catch { setError('Error al eliminar') }
  }

  async function handleManual(e) {
    e.preventDefault()
    if (!formManual.servicio || !formManual.fecha || !formManual.horario || !formManual.nombre || !formManual.email || !formManual.telefono) return
    try {
      const res = await fetch(`${API_URL}/reservas/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenGuardado}` },
        body: JSON.stringify({ ...formManual, total: Number(formManual.total) || 0 }),
      })
      if (res.ok) {
        setModalManual(false)
        setFormManual({ servicio: '', fecha: '', horario: '', nombre: '', email: '', telefono: '', mensaje: '', total: '' })
        await cargarDatos(tokenGuardado)
      }
    } catch { setError('Error al crear reserva') }
  }

  function badgeColor(estado) {
    if (estado === 'completado') return 'bg-green-100 text-green-800'
    if (estado === 'señado') return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (!logueado && !tokenGuardado) {
    return (
      <>
        <SEO title="Panel Admin" />
        <div className="bg-[#F5F1EC] min-h-screen">
          <section className="pt-30 pb-20 px-4 max-w-md mx-auto">
            <div className="text-center mb-10">
              <Lock size={40} className="mx-auto text-[#C1121F] mb-4" />
              <h1 className="text-3xl md:text-4xl font-bold text-[#373435]">Panel <span className="text-[#C1121F]">Admin</span></h1>
              <p className="text-[#373435] opacity-70 mt-2">Ingresá con tus credenciales</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[#373435] font-semibold mb-1">Usuario</label>
                <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError('') }} required
                  className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 bg-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#C1121F]" />
              </div>
              <div>
                <label className="block text-[#373435] font-semibold mb-1">Contraseña</label>
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} required
                  className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 bg-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#C1121F]" />
              </div>
              {error && <p className="text-[#C1121F] text-sm">{error}</p>}
              <button type="submit" disabled={cargando}
                className="w-full flex items-center justify-center gap-2 bg-[#C1121F] text-[#FEFEFE] py-3 rounded-md font-semibold hover:bg-[#5A0B15] transition-colors cursor-pointer disabled:opacity-60">
                <LogIn size={18} /> {cargando ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </section>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO title="Panel Admin" />
      <div className="bg-[#F5F1EC] min-h-screen">
        <section className="pt-30 pb-20 px-4 max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#373435]">
              Panel de <span className="text-[#C1121F]">Administración</span>
            </h1>
            <button onClick={cerrarSesion}
              className="flex items-center gap-2 border-2 border-[#373435] text-[#373435] px-4 py-2 rounded-md font-semibold hover:bg-[#373435] hover:text-[#FEFEFE] transition-colors cursor-pointer">
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#FEFEFE] rounded-lg shadow-sm p-6 border-l-4 border-[#373435]">
              <div className="flex items-center gap-3">
                <BarChart3 size={28} className="text-[#373435]" />
                <div>
                  <p className="text-sm text-[#373435] opacity-60">Reservas Activas</p>
                  <p className="text-3xl font-bold text-[#373435]">{kpis.reservas_activas}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#FEFEFE] rounded-lg shadow-sm p-6 border-l-4 border-[#C1121F]">
              <div className="flex items-center gap-3">
                <TrendingUp size={28} className="text-[#C1121F]" />
                <div>
                  <p className="text-sm text-[#373435] opacity-60">Ingresos Registrados</p>
                  <p className="text-3xl font-bold text-[#C1121F]">${kpis.ingresos_registrados.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#FEFEFE] rounded-lg shadow-sm p-6 border-l-4 border-[#C1121F] border-opacity-50">
              <div className="flex items-center gap-3">
                <AlertCircle size={28} className="text-[#C1121F]" />
                <div>
                  <p className="text-sm text-[#373435] opacity-60">Cobro Pendiente</p>
                  <p className="text-3xl font-bold text-[#373435]">${kpis.cobro_pendiente.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md mb-6">{error}</div>}

          {/* Acciones */}
          <div className="flex justify-end mb-4">
            <button onClick={() => setModalManual(true)}
              className="flex items-center gap-2 bg-[#C1121F] text-[#FEFEFE] px-5 py-2.5 rounded-md font-semibold hover:bg-[#5A0B15] transition-colors cursor-pointer">
              <Plus size={18} /> Añadir Turno Manual
            </button>
          </div>

          {/* Tabla */}
          {cargandoDatos ? (
            <div className="flex items-center justify-center py-20 bg-[#FEFEFE] rounded-lg">
              <Loader2 size={32} className="text-[#C1121F] animate-spin" />
            </div>
          ) : reservas.length === 0 ? (
            <div className="text-center py-20 bg-[#FEFEFE] rounded-lg">
              <p className="text-xl text-[#373435] opacity-60">No hay reservas registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-[#FEFEFE] rounded-lg shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#373435] text-[#FEFEFE]">
                    <th className="text-left px-4 py-3 text-sm font-semibold">Cliente</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Servicio</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Fecha</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Horario</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Contacto</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Total</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Abonado</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Estado</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((r, i) => (
                    <tr key={r.id} className={`${i % 2 === 0 ? 'bg-[#F5F1EC]' : 'bg-[#FEFEFE]'} hover:bg-[#E5E5E5] transition-colors`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#373435]">{r.nombre}</p>
                        {r.mensaje && <p className="text-xs text-[#373435] opacity-50 mt-0.5">"{r.mensaje}"</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#373435]">{r.servicio}</td>
                      <td className="px-4 py-3 text-sm text-[#373435]">{new Date(r.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                      <td className="px-4 py-3 text-sm text-[#373435]">{r.horario}</td>
                      <td className="px-4 py-3 text-sm text-[#373435]">
                        <p>{r.email}</p>
                        <p className="opacity-70">{r.telefono}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#373435]">${r.total?.toLocaleString() || '—'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#C1121F]">${r.abonado?.toLocaleString() || '$0'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeColor(r.estado)}`}>
                          {r.estado === 'completado' ? 'Completado' : r.estado === 'señado' ? 'Señado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {r.estado !== 'completado' && (
                            <button onClick={() => setModalCobro(r.id)}
                              className="flex items-center gap-1 bg-[#C1121F] text-[#FEFEFE] px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#5A0B15] transition-colors cursor-pointer">
                              <DollarSign size={14} /> Cobrar
                            </button>
                          )}
                          <button onClick={() => handleEliminar(r.id)}
                            className="p-1.5 rounded text-[#373435] hover:bg-red-100 hover:text-[#C1121F] transition-colors cursor-pointer"
                            title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Modal Cobro */}
        {modalCobro && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-[#FEFEFE] rounded-lg p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#373435]">Registrar Cobro</h2>
                <button onClick={() => { setModalCobro(null); setMontoCobro('') }} className="cursor-pointer">
                  <X size={20} className="text-[#373435]" />
                </button>
              </div>
              <p className="text-sm text-[#373435] opacity-70 mb-4">Ingresá el monto que el cliente abonó hoy.</p>
              <input type="number" value={montoCobro} onChange={(e) => setMontoCobro(e.target.value)} placeholder="0"
                className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#C1121F]" />
              <div className="flex gap-3">
                <button onClick={() => { setModalCobro(null); setMontoCobro('') }}
                  className="flex-1 border-2 border-[#373435] text-[#373435] py-2.5 rounded-md font-semibold hover:bg-[#373435] hover:text-[#FEFEFE] transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button onClick={handleCobro}
                  className="flex-1 bg-[#C1121F] text-[#FEFEFE] py-2.5 rounded-md font-semibold hover:bg-[#5A0B15] transition-colors cursor-pointer">
                  Confirmar Cobro
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Añadir Manual */}
        {modalManual && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
            <div className="bg-[#FEFEFE] rounded-lg p-6 w-full max-w-lg shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#373435]">Añadir Turno Manual</h2>
                <button onClick={() => { setModalManual(false); setFormManual({ servicio: '', fecha: '', horario: '', nombre: '', email: '', telefono: '', mensaje: '', total: '' }) }} className="cursor-pointer">
                  <X size={20} className="text-[#373435]" />
                </button>
              </div>
              <form onSubmit={handleManual} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#373435] mb-1">Servicio</label>
                  <select value={formManual.servicio} onChange={(e) => setFormManual({ ...formManual, servicio: e.target.value })} required
                    className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 bg-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#C1121F]">
                    <option value="">Seleccionar...</option>
                    {serviciosList.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#373435] mb-1">Fecha</label>
                    <input type="date" value={formManual.fecha} onChange={(e) => setFormManual({ ...formManual, fecha: e.target.value })} required
                      className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1121F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#373435] mb-1">Horario</label>
                    <input type="time" value={formManual.horario} onChange={(e) => setFormManual({ ...formManual, horario: e.target.value })} required
                      className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1121F]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#373435] mb-1">Nombre Completo</label>
                  <input type="text" value={formManual.nombre} onChange={(e) => setFormManual({ ...formManual, nombre: e.target.value })} required placeholder="Ej: Juan Pérez"
                    className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1121F]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#373435] mb-1">Email</label>
                    <input type="email" value={formManual.email} onChange={(e) => setFormManual({ ...formManual, email: e.target.value })} required placeholder="correo@ejemplo.com"
                      className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1121F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#373435] mb-1">Teléfono</label>
                    <input type="tel" value={formManual.telefono} onChange={(e) => setFormManual({ ...formManual, telefono: e.target.value })} required placeholder="+54 9"
                      className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1121F]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#373435] mb-1">Monto Total ($)</label>
                  <input type="number" value={formManual.total} onChange={(e) => setFormManual({ ...formManual, total: e.target.value })} placeholder="0"
                    className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1121F]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#373435] mb-1">Mensaje (opcional)</label>
                  <textarea value={formManual.mensaje} onChange={(e) => setFormManual({ ...formManual, mensaje: e.target.value })} rows={2} placeholder="Notas..."
                    className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1121F] resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setModalManual(false); setFormManual({ servicio: '', fecha: '', horario: '', nombre: '', email: '', telefono: '', mensaje: '', total: '' }) }}
                    className="flex-1 border-2 border-[#373435] text-[#373435] py-2.5 rounded-md font-semibold hover:bg-[#373435] hover:text-[#FEFEFE] transition-colors cursor-pointer">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="flex-1 bg-[#C1121F] text-[#FEFEFE] py-2.5 rounded-md font-semibold hover:bg-[#5A0B15] transition-colors cursor-pointer">
                    Guardar Turno
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ScrollToTop />
      </div>
    </>
  )
}

export default Admin
