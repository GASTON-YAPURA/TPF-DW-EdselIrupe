import { useEffect, useState, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { coleccionesGaleria } from './galeriaData'

function GaleriaSesiones() {
  const [coleccion, setColeccion] = useState(null)
  const [indice, setIndice] = useState(null)
  const cerrarColeccion = useRef(null)
  const cerrarVisor = useRef(null)

  useEffect(() => {
    if (!coleccion) return
    function onKey(e) {
      if (e.key === 'Escape') {
        if (indice !== null) setIndice(null)
        else setColeccion(null)
      }
      if (e.key === 'ArrowLeft') {
        setIndice((i) => (i === null ? i : (i - 1 + coleccion.fotos.length) % coleccion.fotos.length))
      }
      if (e.key === 'ArrowRight') {
        setIndice((i) => (i === null ? i : (i + 1) % coleccion.fotos.length))
      }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [coleccion, indice])

  useEffect(() => {
    if (coleccion && indice === null) cerrarColeccion.current?.focus()
  }, [coleccion, indice])

  useEffect(() => {
    if (indice !== null) cerrarVisor.current?.focus()
  }, [indice])

  return (
    <section id="galeria" className="px-4 py-16 md:py-24 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-[#373435] mb-10 text-center">
        Nuestra <span className="text-[#C1121F]">Galería</span>
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {coleccionesGaleria.map((col) => (
          <button
            key={col.id}
            onClick={() => {
              setIndice(null)
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
          className="fixed inset-0 z-[60] bg-[#171515] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de ${coleccion.titulo}`}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 md:px-6 py-4 bg-[#171515]/95 backdrop-blur">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white">{coleccion.titulo}</h3>
              <p className="text-sm text-white/60">{coleccion.fotos.length} fotos</p>
            </div>
            <button
              ref={cerrarColeccion}
              onClick={() => setColeccion(null)}
              aria-label="Cerrar galería"
              className="text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X size={28} />
            </button>
          </div>

          <div className="px-4 md:px-6 pb-10 max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {coleccion.fotos.map((src, i) => (
              <button
                key={src}
                onClick={() => setIndice(i)}
                className="group overflow-hidden rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C1121F]"
                aria-label={`Ver foto ${i + 1} de ${coleccion.titulo}`}
              >
                <img
                  src={src}
                  alt={`${coleccion.titulo} - foto ${i + 1}`}
                  loading="lazy"
                  className="w-full h-48 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {coleccion && indice !== null && (
        <div
          className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center px-4"
          onClick={() => setIndice(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Visor de ${coleccion.titulo}`}
        >
          <button
            ref={cerrarVisor}
            onClick={() => setIndice(null)}
            aria-label="Cerrar visor"
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X size={30} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIndice((i) => (i - 1 + coleccion.fotos.length) % coleccion.fotos.length)
            }}
            aria-label="Foto anterior"
            className="absolute left-2 md:left-6 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
          >
            <ChevronLeft size={30} />
          </button>
          <img
            src={coleccion.fotos[indice]}
            alt={`${coleccion.titulo} - foto ${indice + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl"
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIndice((i) => (i + 1) % coleccion.fotos.length)
            }}
            aria-label="Foto siguiente"
            className="absolute right-2 md:right-6 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
          >
            <ChevronRight size={30} />
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {indice + 1} / {coleccion.fotos.length}
          </p>
        </div>
      )}
    </section>
  )
}

export default GaleriaSesiones