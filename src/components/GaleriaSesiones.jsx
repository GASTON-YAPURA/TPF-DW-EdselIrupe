import { useEffect, useMemo, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { coleccionesGaleria } from './galeriaData'
import { obtenerRecurso, urlImagenGaleria } from '../lib/api'

function GaleriaSesiones() {
  const [coleccion, setColeccion] = useState(null)
  const [indice, setIndice] = useState(0)
  const [fotosDb, setFotosDb] = useState([])
  const cerrarVisor = useRef(null)
  const miniaturaActiva = useRef(null)

  useEffect(() => {
    let activo = true
    obtenerRecurso('/galeria').then((data) => {
      if (activo && data && Array.isArray(data.fotos)) setFotosDb(data.fotos)
    })
    return () => {
      activo = false
    }
  }, [])

  const colecciones = useMemo(() => {
    const porGrupo = {}
    for (const f of fotosDb) {
      if (!porGrupo[f.coleccion]) porGrupo[f.coleccion] = []
      porGrupo[f.coleccion].push(f)
    }
    const estaticas = coleccionesGaleria.map((col) => ({
      ...col,
      fotos: [...col.fotos, ...(porGrupo[col.id] || []).map((f) => urlImagenGaleria(f.id))],
    }))
    const idsEstaticas = new Set(coleccionesGaleria.map((c) => c.id))
    const nuevas = Object.entries(porGrupo)
      .filter(([nombre]) => !idsEstaticas.has(nombre))
      .map(([nombre, fotos]) => ({
        id: nombre,
        titulo: nombre.charAt(0).toUpperCase() + nombre.slice(1),
        portada: urlImagenGaleria(fotos[0].id),
        fotos: fotos.map((f) => urlImagenGaleria(f.id)),
      }))
    return [...estaticas, ...nuevas]
  }, [fotosDb])

  useEffect(() => {
    if (!coleccion) return
    function onKey(e) {
      if (e.key === 'Escape') setColeccion(null)
      if (e.key === 'ArrowLeft') {
        setIndice((i) => (i - 1 + coleccion.fotos.length) % coleccion.fotos.length)
      }
      if (e.key === 'ArrowRight') {
        setIndice((i) => (i + 1) % coleccion.fotos.length)
      }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [coleccion])

  useEffect(() => {
    if (coleccion) cerrarVisor.current?.focus()
  }, [coleccion])

  useEffect(() => {
    miniaturaActiva.current?.scrollIntoView({ block: 'nearest' })
  }, [indice])

  const anterior = () =>
    setIndice((i) => (i - 1 + coleccion.fotos.length) % coleccion.fotos.length)
  const siguiente = () =>
    setIndice((i) => (i + 1) % coleccion.fotos.length)

  return (
    <section id="galeria" className="px-4 py-16 md:py-24 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-[#373435] mb-10 text-center">
        Nuestra <span className="text-[#C1121F]">Galería</span>
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {colecciones.map((col) => (
          <button
            key={col.id}
            onClick={() => {
              setIndice(0)
              setColeccion(col)
            }}
            className="group relative overflow-hidden rounded-lg shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C1121F]"
            aria-label={`Ver galería de ${col.titulo}`}
          >
            <img
              src={col.portada}
              alt={`Portada de la sesión ${col.titulo}`}
              loading="lazy"
              className="w-full h-40 md:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute bottom-0 left-0 right-0 p-4 text-left">
              <span className="block text-white text-lg md:text-xl font-semibold">{col.titulo}</span>
              <span className="block text-white/70 text-sm mt-0.5">{col.fotos.length} fotos</span>
            </span>
          </button>
        ))}
      </div>

      {coleccion && (
        <div
          className="fixed inset-0 z-[60] bg-[#171515] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de ${coleccion.titulo}`}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 md:px-6 py-4 bg-[#171515]/95 backdrop-blur">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white">{coleccion.titulo}</h3>
              <p className="text-sm text-white/60">
                {indice + 1} / {coleccion.fotos.length} fotos
              </p>
            </div>
            <button
              ref={cerrarVisor}
              onClick={() => setColeccion(null)}
              aria-label="Cerrar galería"
              className="text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X size={28} />
            </button>
          </div>

          {coleccion.fotos.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-white/60 p-8">
              Esta colección todavía no tiene fotos.
            </div>
          ) : (
            <>
              <div className="flex-1 flex flex-col md:flex-row min-h-0">
                <div className="relative flex-1 flex items-center justify-center bg-black/60 min-h-0">
                  <button
                    onClick={anterior}
                    aria-label="Foto anterior"
                    className="absolute left-2 md:left-4 z-10 text-white p-2 rounded-full bg-black/40 hover:bg-black/70 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <ChevronLeft size={30} />
                  </button>
                  <img
                    src={coleccion.fotos[indice]}
                    alt={`${coleccion.titulo} - foto ${indice + 1}`}
                    className="max-w-full max-h-[75vh] md:max-h-[80vh] rounded-lg object-contain shadow-2xl px-14 md:px-10"
                  />
                  <button
                    onClick={siguiente}
                    aria-label="Foto siguiente"
                    className="absolute right-2 md:right-4 z-10 text-white p-2 rounded-full bg-black/40 hover:bg-black/70 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <ChevronRight size={30} />
                  </button>
                </div>

                <aside className="hidden md:flex flex-col w-40 lg:w-56 overflow-y-auto bg-[#171515] border-l border-white/10 shrink-0">
                  {coleccion.fotos.map((src, i) => (
                    <button
                      key={src}
                      ref={i === indice ? miniaturaActiva : null}
                      onClick={() => setIndice(i)}
                      aria-label={`Ver foto ${i + 1} de ${coleccion.titulo}`}
                      aria-current={i === indice}
                      className={`relative shrink-0 h-16 m-1.5 rounded-md overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C1121F] ${
                        i === indice ? 'ring-2 ring-[#C1121F] opacity-100' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={src}
                        alt={`${coleccion.titulo} - foto ${i + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </aside>
              </div>

              <div className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-3 border-t border-white/10 shrink-0">
                {coleccion.fotos.map((src, i) => (
                  <button
                    key={src}
                    ref={i === indice ? miniaturaActiva : null}
                    onClick={() => setIndice(i)}
                    aria-label={`Ver foto ${i + 1} de ${coleccion.titulo}`}
                    aria-current={i === indice}
                    className={`relative shrink-0 w-14 h-14 rounded-md overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C1121F] ${
                      i === indice ? 'ring-2 ring-[#C1121F] opacity-100' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${coleccion.titulo} - foto ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}

export default GaleriaSesiones