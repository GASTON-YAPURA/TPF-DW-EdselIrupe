import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import SEO from '../components/SEO'
import ScrollToTop from '../components/ScrollToTop'
import { CalendarDays, Clock, User, Mail, Phone, MessageSquare, Check, ArrowLeft, ArrowRight } from 'lucide-react'

const servicios = [
  {
    id: 1,
    titulo: 'Sesiones de Eventos',
    descripcion: 'Cobertura completa de fiestas, celebraciones y eventos sociales.',
    duracion: '4 horas',
    precio: '$25.000',
  },
  {
    id: 2,
    titulo: 'Sesiones Particulares',
    descripcion: 'Sesiones personalizadas para individuos o parejas.',
    duracion: '2 horas',
    precio: '$15.000',
  },
  {
    id: 3,
    titulo: 'Sesiones Temáticas',
    descripcion: 'Sesiones con escenografía y vestuario acorde a la temática elegida.',
    duracion: '3 horas',
    precio: '$20.000',
  },
  {
    id: 4,
    titulo: 'Sesiones Infantiles',
    descripcion: 'Sesiones para niños, escuelas y jardines de infantes.',
    duracion: '2 horas',
    precio: '$18.000',
  },
  {
    id: 5,
    titulo: 'Sesiones Individuales y Grupales',
    descripcion: 'Sesiones para fotografía individual o grupal.',
    duracion: '2 horas',
    precio: '$12.000',
  },
]

const pasos = [
  { numero: 1, label: 'Servicio' },
  { numero: 2, label: 'Fecha y Hora' },
  { numero: 3, label: 'Tus Datos' },
]

function sanitizar(texto) {
  const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }
  return String(texto).replace(/[&<>"']/g, (c) => mapa[c])
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validarTelefono(tel) {
  return /^[\d\s\+\(\)\-]{7,20}$/.test(tel)
}

const API_URL = import.meta.env.VITE_API_URL || 'https://edsellrupe-api.onrender.com/api'

function Reservar() {
  const location = useLocation()
  const servicioInicial = location.state?.servicio || ''

  const [paso, setPaso] = useState(servicioInicial ? 1 : 1)
  const [enviado, setEnviado] = useState(false)
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)

  const SEOContent = (
    <SEO
      title="Reservar Turno"
      description="Reservá tu sesión fotográfica con Edsellrupe. Completá el formulario multi-paso y te contactaremos para confirmar tu turno en Tinogasta, Catamarca."
    />
  )
  const [form, setForm] = useState({
    servicio: servicioInicial,
    fecha: '',
    horario: '',
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
  })

  function handleChange(e) {
    const valor = e.target.name === 'mensaje' ? e.target.value : sanitizar(e.target.value)
    setForm({ ...form, [e.target.name]: valor })
    setErrores({ ...errores, [e.target.name]: '' })
  }

  function validarPaso(numero) {
    const nuevosErrores = {}
    if (numero === 1 && !form.servicio) {
      nuevosErrores.servicio = 'Seleccioná un servicio'
    }
    if (numero === 2) {
      if (!form.fecha) nuevosErrores.fecha = 'Elegí una fecha'
      if (!form.horario) nuevosErrores.horario = 'Elegí un horario'
    }
    if (numero === 3) {
      if (!form.nombre) nuevosErrores.nombre = 'El nombre es obligatorio'
      if (!form.email) nuevosErrores.email = 'El email es obligatorio'
      else if (!validarEmail(form.email)) nuevosErrores.email = 'Email inválido'
      if (!form.telefono) nuevosErrores.telefono = 'El teléfono es obligatorio'
      else if (!validarTelefono(form.telefono)) nuevosErrores.telefono = 'Teléfono inválido (solo números, +, -)'
    }
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function obtenerPrecioNumerico(titulo) {
    const s = servicios.find(s => s.titulo === titulo)
    if (!s) return 0
    return parseInt(s.precio.replace(/[^0-9]/g, ''))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validarPaso(3)) return
    setCargando(true)
    try {
      const res = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, total: obtenerPrecioNumerico(form.servicio) }),
      })
      if (!res.ok) throw new Error('Error al enviar el turno')
      setEnviado(true)
    } catch {
      setErrores({ general: 'Error al enviar el turno. Intentalo de nuevo.' })
    } finally {
      setCargando(false)
    }
  }

  function avanzar() {
    if (!validarPaso(paso)) return
    setPaso(paso + 1)
  }

  function retroceder() {
    setPaso(paso - 1)
  }

  if (enviado) {
    return (
    <>
      {SEOContent}
    <div className="bg-[#F5F1EC]">
      <section className="pt-30 pb-20 px-4 max-w-3xl mx-auto">
        <div className="border border-[#E5E5E5] rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[#373435] mb-2">
            Turno solicitado correctamente
          </h2>
          <p className="text-lg text-[#373435] opacity-80">
            Nos pondremos en contacto pronto para confirmar tu sesión fotográfica.
          </p>
        </div>
      </section>
      <ScrollToTop />
    </div>
    </>
    )
  }

  return (
    <>
      {SEOContent}
    <div className="bg-[#F5F1EC]">
    <section className="pt-30 pb-20 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-5xl font-bold text-[#373435] mb-4">
        Reservá tu <span className="text-[#C1121F]">Turno</span>
      </h1>
      <p className="text-lg text-[#373435] opacity-80 mb-10">
        Completá los pasos para solicitar tu sesión fotográfica.
      </p>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {pasos.map((p, i) => (
          <div key={p.numero} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                paso === p.numero
                  ? 'bg-[#C1121F] text-[#FEFEFE]'
                  : paso > p.numero
                  ? 'bg-[#5A0B15] text-[#FEFEFE]'
                  : 'bg-[#E5E5E5] text-[#373435]'
              }`}
            >
              {paso > p.numero && <Check size={16} />}
              <span className="hidden sm:inline">{p.label}</span>
            </div>
            {i < pasos.length - 1 && (
              <div className={`w-8 h-0.5 ${paso > p.numero ? 'bg-[#5A0B15]' : 'bg-[#E5E5E5]'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Paso 1: Servicio */}
        {paso === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#373435] mb-4">
              Seleccioná tu servicio
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {servicios.map((s) => (
                <label
                  key={s.id}
                  className={`block rounded-lg border-2 p-4 cursor-pointer transition-all shadow-lg ${
                    form.servicio === s.titulo
                      ? 'border-[#C1121F] bg-[#F5F1EC]'
                      : 'border-[#E5E5E5] bg-[#FEFEFE] hover:border-[#C1121F]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="servicio"
                      value={s.titulo}
                      checked={form.servicio === s.titulo}
                      onChange={handleChange}
                      className="accent-[#C1121F]"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-[#373435]">{s.titulo}</span>
                      <p className="text-sm text-[#373435] opacity-70">{s.descripcion}</p>
                      <div className="flex gap-4 mt-1 text-sm text-[#373435] opacity-60">
                        <span>Duración: {s.duracion}</span>
                        <span className="font-bold text-[#C1121F]">{s.precio}</span>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errores.servicio && (
              <p className="text-[#C1121F] text-sm mt-2">{errores.servicio}</p>
            )}
          </div>
        )}

        {/* Paso 2: Fecha y Hora */}
        {paso === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#373435] mb-4">
              Elegí fecha y horario
            </h2>
            <div>
              <label className="flex items-center gap-2 text-[#373435] font-semibold mb-2">
                <CalendarDays size={18} className="text-[#C1121F]" />
                Fecha
              </label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                required
                className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 text-[#373435] bg-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#C1121F]"
              />
              {errores.fecha && (
                <p className="text-[#C1121F] text-sm mt-1">{errores.fecha}</p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 text-[#373435] font-semibold mb-2">
                <Clock size={18} className="text-[#C1121F]" />
                Horario
              </label>
              <input
                type="time"
                name="horario"
                value={form.horario}
                onChange={handleChange}
                required
                className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 text-[#373435] bg-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#C1121F]"
              />
              {errores.horario && (
                <p className="text-[#C1121F] text-sm mt-1">{errores.horario}</p>
              )}
            </div>
          </div>
        )}

        {/* Paso 3: Datos */}
        {paso === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#373435] mb-4">
              Completá tus datos
            </h2>
            <div>
              <label className="flex items-center gap-2 text-[#373435] font-semibold mb-2">
                <User size={18} className="text-[#C1121F]" />
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Juan Pérez"
                className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 text-[#373435] bg-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#C1121F]"
              />
              {errores.nombre && (
                <p className="text-[#C1121F] text-sm mt-1">{errores.nombre}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-[#373435] font-semibold mb-2">
                  <Mail size={18} className="text-[#C1121F]" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="correo@ejemplo.com"
                  className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 text-[#373435] bg-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#C1121F]"
                />
                {errores.email && (
                  <p className="text-[#C1121F] text-sm mt-1">{errores.email}</p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-[#373435] font-semibold mb-2">
                  <Phone size={18} className="text-[#C1121F]" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  required
                  placeholder="+54 9 1234 56-789"
                  className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 text-[#373435] bg-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#C1121F]"
                />
                {errores.telefono && (
                  <p className="text-[#C1121F] text-sm mt-1">{errores.telefono}</p>
                )}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-[#373435] font-semibold mb-2">
                <MessageSquare size={18} className="text-[#C1121F]" />
                Mensaje (opcional)
              </label>
              <textarea
                name="mensaje"
                value={form.mensaje}
                onChange={handleChange}
                rows={4}
                placeholder="Contanos más sobre tu sesión ideal..."
                className="w-full border border-[#E5E5E5] rounded-md px-4 py-3 text-[#373435] bg-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#C1121F] resize-none"
              />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {paso > 1 ? (
            <button
              type="button"
              onClick={retroceder}
              className="flex items-center gap-2 border-2 border-[#373435] text-[#373435] px-6 py-2.5 rounded-md font-semibold hover:bg-[#373435] hover:text-[#FEFEFE] transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
              Volver
            </button>
          ) : (
            <div />
          )}
          {paso < 3 ? (
            <button
              type="button"
              onClick={avanzar}
              className="flex items-center gap-2 bg-[#C1121F] text-[#FEFEFE] px-6 py-2.5 rounded-md font-semibold hover:bg-[#5A0B15] transition-colors cursor-pointer"
            >
              Siguiente
              <ArrowRight size={18} />
            </button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              {errores.general && (
                <p className="text-[#C1121F] text-sm">{errores.general}</p>
              )}
              <button
                type="submit"
                disabled={cargando}
                className="bg-[#C1121F] text-[#FEFEFE] px-8 py-2.5 rounded-md font-semibold text-base hover:bg-[#5A0B15] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cargando ? 'Enviando...' : 'Solicitar Turno'}
              </button>
            </div>
          )}
        </div>
      </form>
    </section>
      <ScrollToTop />
    </div>
    </>
  )
}

export default Reservar
