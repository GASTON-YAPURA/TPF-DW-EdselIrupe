import { useState, useEffect } from 'react'
import SEO from '../components/SEO'
import ScrollToTop from '../components/ScrollToTop'
import { API_URL, urlImagenServicio } from '../lib/api'
import { coleccionesGaleria } from '../components/galeriaData'
import {
  LogIn, LogOut, Lock, Plus, Trash2, DollarSign, BarChart3, TrendingUp, AlertCircle,
  X, Loader2, Pencil, Upload, Images, Briefcase, CalendarRange, Image as ImageIcon,
} from 'lucide-react'

const serviciosList = [
  'Sesiones de Eventos',
  'Sesiones Particulares',
  'Sesiones Temáticas',
  'Sesiones Infantiles',
  'Sesiones Individuales y Grupales',
]

const TAMANIO_MAX_IMAGEN = 6 * 1024 * 1024
const MIMES_VALIDOS = ['image/jpeg', 'image/png', 'image/webp']

function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem('token'))
  const [logueado, setLogueado] = useState(Boolean(token))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('reservas')
  const [cargando, setCargando] = useState(false)
  const [cargandoDatos, setCargandoDatos] = useState(false)

  // Reservas
  const [reservas, setReservas] = useState([])
  const [kpis, setKpis] = useState({ reservas_activas: 0, ingresos_registrados: 0, cobro_pendiente: 0 })
  const [modalCobro, setModalCobro] = useState(null)
  const [montoCobro, setMontoCobro] = useState('')
  const [modalManual, setModalManual] = useState(false)
  const [formManual, setFormManual] = useState({ servicio: '', fecha: '', horario: '', nombre: '', email: '', telefono: '', mensaje: '' })

  // Servicios
  const [servicios, setServicios] = useState([])
  const [modalServicio, setModalServicio] = useState(null)
  const [imagenServicio, setImagenServicio] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // Galería
  const [fotosDb, setFotosDb] = useState([])
  const [coleccionesDb, setColeccionesDb] = useState([])
  const [coleccionSel, setColeccionSel] = useState('bebes')
  const [nuevaColeccion, setNuevaColeccion] = useState('')
  const [pending, setPending] = useState([])
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    if (token) cargarDatos(token)
  }, [token])

  async function cargarDatos(token) {
    setCargandoDatos(true)
    try {
      const [resReservas, resKpis, resServicios, resGaleria] = await Promise.all([
        fetch(`${API_URL}/reservas`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/kpis`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/servicios`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/galeria`),
      ])
      if (resReservas.ok) setReservas(await resReservas.json())
      if (resKpis.ok) setKpis(await resKpis.json())
      if (resServicios.ok) setServicios(await resServicios.json())
      if (resGaleria.ok) {
        const g = await resGaleria.json()
        setFotosDb(g.fotos || [])
        setColeccionesDb(g.colecciones || [])
      }
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
      setToken(data.token)
      setLogueado(true)
    } catch { setError('Error de conexión') }
    finally { setCargando(false) }
  }

  function cerrarSesion() {
    sessionStorage.removeItem('token')
    setToken(null)
    setLogueado(false)
    setReservas([])
    setKpis({ reservas_activas: 0, ingresos_registrados: 0, cobro_pendiente: 0 })
    setServicios([])
    setFotosDb([])
  }

  async function handleCobro() {
    if (!montoCobro || montoCobro <= 0) return
    try {
      const res = await fetch(`${API_URL}/reservas/${modalCobro}/cobro`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ monto: Number(montoCobro) }),
      })
      if (res.ok) {
        setModalCobro(null)
        setMontoCobro('')
        await cargarDatos(token)
      }
    } catch { setError('Error al registrar cobro') }
  }

  async function handleEliminar(id) {
    if (!window.confirm('¿Eliminar esta reserva?')) return
    try {
      const res = await fetch(`${API_URL}/reservas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) await cargarDatos(token)
    } catch { setError('Error al eliminar') }
  }

  async function handleManual(e) {
    e.preventDefault()
    if (!formManual.servicio || !formManual.fecha || !formManual.horario || !formManual.nombre || !formManual.email || !formManual.telefono) return
    try {
      const res = await fetch(`${API_URL}/reservas/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formManual),
      })
      if (res.ok) {
        setModalManual(false)
        setFormManual({ servicio: '', fecha: '', horario: '', nombre: '', email: '', telefono: '', mensaje: '' })
        await cargarDatos(token)
      }
    } catch { setError('Error al crear reserva') }
  }

  function badgeColor(estado) {
    if (estado === 'completado') return 'bg-green-100 text-green-800'
    if (estado === 'señado') return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  // --- Servicios ---
  function abrirNuevoServicio() {
    setError('')
    setModalServicio({ id: null, titulo: '', descripcion: '', duracion: '', precio: '' })
    setImagenServicio(null)
  }

  function abrirEditarServicio(s) {
    setError('')
    setModalServicio({ id: s.id, titulo: s.titulo, descripcion: s.descripcion, duracion: s.duracion, precio: s.precio })
    setImagenServicio(null)
  }

  function manejarArchivoServicio(files) {
    const file = files[0]
    if (!file) return
    if (!MIMES_VALIDOS.includes(file.type)) { setError('Formato no permitido (solo JPG, PNG o WebP)'); return }
    if (file.size > TAMANIO_MAX_IMAGEN) { setError('La imagen no puede superar los 6 MB'); return }
    const reader = new FileReader()
    reader.onload = () => {
      setImagenServicio({ data: reader.result.split(',')[1], mime: file.type, preview: reader.result })
      setError('')
    }
    reader.readAsDataURL(file)
  }

  async function guardarServicio(e) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      const res = modalServicio.id
        ? await fetch(`${API_URL}/servicios/${modalServicio.id}`, {
            method: 'PUT', headers,
            body: JSON.stringify({
              titulo: modalServicio.titulo,
              descripcion: modalServicio.descripcion,
              duracion: modalServicio.duracion,
              precio: modalServicio.precio,
            }),
          })
        : await fetch(`${API_URL}/servicios`, {
            method: 'POST', headers,
            body: JSON.stringify({
              titulo: modalServicio.titulo,
              descripcion: modalServicio.descripcion,
              duracion: modalServicio.duracion,
              precio: modalServicio.precio,
            }),
          })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al guardar el servicio'); return }
      const id = modalServicio.id || data.id
      if (imagenServicio) {
        await fetch(`${API_URL}/servicios/${id}/imagen`, {
          method: 'POST', headers,
          body: JSON.stringify({ mime: imagenServicio.mime, data: imagenServicio.data }),
        })
      }
      setModalServicio(null)
      setImagenServicio(null)
      await cargarDatos(token)
    } catch { setError('Error de conexión') }
    finally { setGuardando(false) }
  }

  async function eliminarServicio(id) {
    if (!window.confirm('¿Eliminar este servicio? Ya no estará disponible para reservar.')) return
    try {
      const res = await fetch(`${API_URL}/servicios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) await cargarDatos(token)
    } catch { setError('Error al eliminar servicio') }
  }

  // --- Galería ---
  function manejarArchivosGaleria(files) {
    setError('')
    const archivos = []
    for (const file of files) {
      if (!MIMES_VALIDOS.includes(file.type)) { setError(`Formato no permitido: ${file.name}`); continue }
      if (file.size > TAMANIO_MAX_IMAGEN) { setError(`La foto supera los 6 MB: ${file.name}`); continue }
      archivos.push(file)
    }
    if (archivos.length === 0) return
    const leidas = []
    let fin = 0
    archivos.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        leidas.push({ data: reader.result.split(',')[1], mime: file.type, nombre: file.name })
        fin += 1
        if (fin === archivos.length) setPending((p) => [...p, ...leidas])
      }
      reader.readAsDataURL(file)
    })
  }

  function coleccionActual() {
    return (nuevaColeccion.trim() || coleccionSel).trim().toLowerCase()
  }

  async function subirFotos() {
    const coleccion = coleccionActual()
    if (!coleccion) { setError('Elegí una colección o escribí el nombre de una nueva'); return }
    if (pending.length === 0) return
    setSubiendo(true)
    setError('')
    try {
      for (const foto of pending) {
        await fetch(`${API_URL}/galeria`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ coleccion, mime: foto.mime, nombre_archivo: foto.nombre, data: foto.data }),
        })
      }
      setPending([])
      setNuevaColeccion('')
      setColeccionSel(coleccion)
      await cargarDatos(token)
    } catch { setError('Error al subir las fotos') }
    finally { setSubiendo(false) }
  }

  async function eliminarFoto(id) {
    if (!window.confirm('¿Eliminar esta foto de la galería?')) return
    try {
      const res = await fetch(`${API_URL}/galeria/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) await cargarDatos(token)
    } catch { setError('Error al eliminar la foto') }
  }

  const idsFijos = new Set(coleccionesGaleria.map((c) => c.id))
  const opcionesColecciones = [
    ...coleccionesGaleria.map((c) => c.id),
    ...coleccionesDb.filter((c) => !idsFijos.has(c)),
  ]
  const fotoPrevia = (f) => `${API_URL}/galeria/${f.id}/imagen`
  const fotosDeEsta = coleccionActual()
    ? fotosDb.filter((f) => f.coleccion === coleccionActual())
    : fotosDb

  if (!logueado && !token) {
    return (
      <>
        <SEO title="Panel Admin" noindex />
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
      <SEO title="Panel Admin" noindex />
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

          {/* Pestañas */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { id: 'reservas', label: 'Reservas', Icon: CalendarRange },
              { id: 'servicios', label: 'Servicios', Icon: Briefcase },
              { id: 'galeria', label: 'Galería', Icon: Images },
            ].map(({ id, label, Icon }) => (
              <button key={id} onClick={() => { setTab(id); setError('') }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  tab === id
                    ? 'bg-[#C1121F] text-[#FEFEFE]'
                    : 'bg-[#FEFEFE] text-[#373435] border border-[#E5E5E5] hover:border-[#C1121F]'
                }`}>
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>

          {error && <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md mb-6">{error}</div>}

          {/* ===== PESTAÑA RESERVAS ===== */}
          {tab === 'reservas' && (
            <>
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
            </>
          )}

          {/* ===== PESTAÑA SERVICIOS ===== */}
          {tab === 'servicios' && (
            <div className="bg-[#FEFEFE] rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#373435]">Servicios</h2>
                  <p className="text-sm text-[#373435] opacity-60 mt-1">Los cambios se reflejan al instante en la página Servicios y en el formulario de reserva.</p>
                </div>
                <button onClick={abrirNuevoServicio}
                  className="flex items-center gap-2 bg-[#C1121F] text-[#FEFEFE] px-5 py-2.5 rounded-md font-semibold hover:bg-[#5A0B15] transition-colors cursor-pointer">
                  <Plus size={18} /> Nuevo Servicio
                </button>
              </div>

              {cargandoDatos ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={32} className="text-[#C1121F] animate-spin" />
                </div>
              ) : servicios.length === 0 ? (
                <p className="text-center text-[#373435] opacity-60 py-16">No hay servicios cargados</p>
              ) : (
                <div className="space-y-3">
                  {servicios.map((s) => (
                    <div key={s.id} className="flex items-center gap-4 border border-[#E5E5E5] rounded-lg p-3 hover:border-[#C1121F] transition-colors">
                      <div className="w-24 h-16 rounded-md overflow-hidden bg-[#F5F1EC] flex-shrink-0">
                        {s.tiene_imagen ? (
                          <img src={urlImagenServicio(s.id)} alt={s.titulo} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#373435] opacity-30">
                            <ImageIcon size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#373435]">{s.titulo}</p>
                        <p className="text-sm text-[#373435] opacity-70 truncate">{s.descripcion}</p>
                        <p className="text-xs text-[#373435] opacity-50 mt-1">{s.duracion}</p>
                      </div>
                      <p className="font-bold text-[#C1121F] whitespace-nowrap">{s.precio}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => abrirEditarServicio(s)}
                          className="p-2 rounded text-[#373435] hover:bg-[#F5F1EC] transition-colors cursor-pointer" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => eliminarServicio(s.id)}
                          className="p-2 rounded text-[#373435] hover:bg-red-100 hover:text-[#C1121F] transition-colors cursor-pointer" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== PESTAÑA GALERÍA ===== */}
          {tab === 'galeria' && (
            <div className="space-y-6">
              <div className="bg-[#FEFEFE] rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-[#373435] mb-2">Subir fotos a la galería</h2>
                <p className="text-sm text-[#373435] opacity-60 mb-6">
                  Las fotos se guardan en la base de datos y aparecen automáticamente en el Home, dentro de su colección. Máximo 6 MB por foto (JPG, PNG o WebP).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#373435] mb-1">Colección</label>
                    <select value={coleccionSel} onChange={(e) => { setColeccionSel(e.target.value); setNuevaColeccion('') }}
                      className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 bg-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#C1121F]">
                      {opcionesColecciones.map((c) => (
                        <option key={c} value={c}>
                          {coleccionesGaleria.find((x) => x.id === c)?.titulo || c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#373435] mb-1">¿Colección nueva? (opcional)</label>
                    <input type="text" value={nuevaColeccion} onChange={(e) => { setNuevaColeccion(e.target.value); setError('') }}
                      placeholder="Ej: Carnaval, Ensayos, 15 años..."
                      className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1121F]" />
                  </div>
                </div>

                <label className="block border-2 border-dashed border-[#E5E5E5] rounded-lg p-8 text-center cursor-pointer hover:border-[#C1121F] transition-colors">
                  <Upload size={28} className="mx-auto text-[#C1121F] mb-2" />
                  <span className="font-semibold text-[#373435]">Elegí una o varias fotos</span>
                  <span className="block text-sm text-[#373435] opacity-60 mt-1">Se pueden seleccionar varias a la vez</span>
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden"
                    onChange={(e) => manejarArchivosGaleria(e.target.files)} />
                </label>

                {pending.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-[#373435] mb-2">{pending.length} foto(s) pendiente(s)</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pending.map((p, i) => (
                        <div key={i} className="relative">
                          <img src={`data:${p.mime};base64,${p.data}`} alt={p.nombre} className="w-20 h-20 object-cover rounded-md border border-[#E5E5E5]" />
                          <button onClick={() => setPending((arr) => arr.filter((_, j) => j !== i))}
                            className="absolute -top-2 -right-2 bg-[#C1121F] text-white rounded-full p-1 cursor-pointer hover:bg-[#5A0B15]" title="Quitar">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={subirFotos} disabled={subiendo}
                      className="flex items-center gap-2 bg-[#C1121F] text-[#FEFEFE] px-5 py-2.5 rounded-md font-semibold hover:bg-[#5A0B15] transition-colors cursor-pointer disabled:opacity-60">
                      <Upload size={18} /> {subiendo ? 'Subiendo...' : 'Subir a la galería'}
                    </button>
                  </div>
                )}
              </div>

              {cargandoDatos ? (
                <div className="flex items-center justify-center py-16 bg-[#FEFEFE] rounded-lg">
                  <Loader2 size={32} className="text-[#C1121F] animate-spin" />
                </div>
              ) : fotosDeEsta.length === 0 ? (
                <div className="text-center py-16 bg-[#FEFEFE] rounded-lg">
                  <p className="text-lg text-[#373435] opacity-60">
                    {coleccionActual() ? `La colección "${coleccionActual()}" no tiene fotos subidas todavía` : 'Elegí una colección para ver sus fotos'}
                  </p>
                </div>
              ) : (
                <div className="bg-[#FEFEFE] rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold text-[#373435] mb-1">
                    Fotos en "{coleccionActual()}"
                  </h3>
                  <p className="text-sm text-[#373435] opacity-60 mb-4">
                    {fotosDeEsta.length} foto(s) desde la base de datos
                    {idsFijos.has(coleccionActual()) && ` · la colección local tiene ${coleccionesGaleria.find((c) => c.id === coleccionActual())?.fotos.length || 0} fotos propias`}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {fotosDeEsta.map((f) => (
                      <div key={f.id} className="relative group rounded-md overflow-hidden">
                        <img src={fotoPrevia(f)} alt={f.nombre_archivo || 'foto'} loading="lazy" className="w-full h-32 md:h-40 object-cover" />
                        <button onClick={() => eliminarFoto(f.id)}
                          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-[#C1121F] transition-opacity" title="Eliminar foto">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                <button onClick={() => { setModalManual(false); setFormManual({ servicio: '', fecha: '', horario: '', nombre: '', email: '', telefono: '', mensaje: '' }) }} className="cursor-pointer">
                  <X size={20} className="text-[#373435]" />
                </button>
              </div>
              <form onSubmit={handleManual} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#373435] mb-1">Servicio</label>
                  <select value={formManual.servicio} onChange={(e) => setFormManual({ ...formManual, servicio: e.target.value })} required
                    className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 bg-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#C1121F]">
                    <option value="">Seleccionar...</option>
                    {(servicios.length ? servicios.map((s) => s.titulo) : serviciosList).map((s) => <option key={s} value={s}>{s}</option>)}
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
                  <label className="block text-sm font-semibold text-[#373435] mb-1">Mensaje (opcional)</label>
                  <textarea value={formManual.mensaje} onChange={(e) => setFormManual({ ...formManual, mensaje: e.target.value })} rows={2} placeholder="Notas..."
                    className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1121F] resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setModalManual(false); setFormManual({ servicio: '', fecha: '', horario: '', nombre: '', email: '', telefono: '', mensaje: '' }) }}
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

        {/* Modal Servicio */}
        {modalServicio && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
            <div className="bg-[#FEFEFE] rounded-lg p-6 w-full max-w-lg shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#373435]">
                  {modalServicio.id ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h2>
                <button onClick={() => { setModalServicio(null); setImagenServicio(null) }} className="cursor-pointer">
                  <X size={20} className="text-[#373435]" />
                </button>
              </div>
              <form onSubmit={guardarServicio} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#373435] mb-1">Título</label>
                  <input type="text" value={modalServicio.titulo} onChange={(e) => setModalServicio({ ...modalServicio, titulo: e.target.value })} required maxLength={100} placeholder="Ej: Sesiones de Cumpleaños"
                    className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1121F]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#373435] mb-1">Descripción</label>
                  <textarea value={modalServicio.descripcion} onChange={(e) => setModalServicio({ ...modalServicio, descripcion: e.target.value })} required maxLength={1000} rows={3}
                    className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1121F] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#373435] mb-1">Duración</label>
                    <input type="text" value={modalServicio.duracion} onChange={(e) => setModalServicio({ ...modalServicio, duracion: e.target.value })} required maxLength={50} placeholder="Ej: 3 horas"
                      className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1121F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#373435] mb-1">Precio</label>
                    <input type="text" value={modalServicio.precio} onChange={(e) => setModalServicio({ ...modalServicio, precio: e.target.value })} required maxLength={20} placeholder="Ej: $25.000"
                      className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1121F]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#373435] mb-1">Imagen (opcional)</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 border-2 border-dashed border-[#E5E5E5] rounded-lg p-4 text-center cursor-pointer hover:border-[#C1121F] transition-colors">
                      <Upload size={20} className="mx-auto text-[#C1121F] mb-1" />
                      <span className="block text-sm font-semibold text-[#373435]">
                        {imagenServicio ? 'Cambiar imagen' : modalServicio.id && servicios.find((s) => s.id === modalServicio.id)?.tiene_imagen ? 'Reemplazar imagen' : 'Seleccionar imagen'}
                      </span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                        onChange={(e) => manejarArchivoServicio(e.target.files)} />
                    </label>
                    {imagenServicio ? (
                      <img src={imagenServicio.preview} alt="Nueva imagen" className="w-20 h-20 rounded-md object-cover border border-[#E5E5E5]" />
                    ) : modalServicio.id && servicios.find((s) => s.id === modalServicio.id)?.tiene_imagen ? (
                      <img src={urlImagenServicio(modalServicio.id)} alt="Imagen actual" className="w-20 h-20 rounded-md object-cover border border-[#E5E5E5]" />
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setModalServicio(null); setImagenServicio(null) }}
                    className="flex-1 border-2 border-[#373435] text-[#373435] py-2.5 rounded-md font-semibold hover:bg-[#373435] hover:text-[#FEFEFE] transition-colors cursor-pointer">
                    Cancelar
                  </button>
                  <button type="submit" disabled={guardando}
                    className="flex-1 bg-[#C1121F] text-[#FEFEFE] py-2.5 rounded-md font-semibold hover:bg-[#5A0B15] transition-colors cursor-pointer disabled:opacity-60">
                    {guardando ? 'Guardando...' : 'Guardar Servicio'}
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