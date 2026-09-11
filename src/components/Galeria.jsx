import { useEffect, useCallback, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import eventos from '../assets/eventos.png'
import particulares from '../assets/particulares.png'
import tematica from '../assets/temática.png'
import infantil from '../assets/infantil.png'
import grupales from '../assets/individuales y grupales.png'
import fondoMain from '../assets/fondo main.png'

const imagenes = [
  { src: particulares, alt: 'Sesión particular en estudio' },
  { src: infantil, alt: 'Sesión infantil de Edsellrupe' },
  { src: eventos, alt: 'Cobertura de evento social' },
  { src: tematica, alt: 'Sesión temática con escenografía' },
  { src: grupales, alt: 'Sesión individual y grupal' },
  { src: fondoMain, alt: 'Espacio de trabajo de Edsellrupe' },
]

function Galeria() {
  const [indice, setIndice] = useState(null)

  const cerrar = useCallback(() => setIndice(null), [])
  const anterior = useCallback(
    () => setIndice((i) => (i === null ? i : (i - 1 + imagenes.length) % imagenes.length)),
    []
  )
  const siguiente = useCallback(
    () => setIndice((i) => (i === null ? i : (i + 1) % imagenes.length)),
    []
  )

  useEffect(() => {
    if (indice === null) return
    function onKey(e) {
      if (e.key === 'Escape') cerrar()
      if (e.key === 'ArrowLeft') anterior()
      if (e.key === 'ArrowRight') siguiente()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [indice, cerrar, anterior, siguiente])

  return (
    <section id="galeria" className="px-4 py-16 md:py-24 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-[#373435] mb-10 text-center">
        Nuestra <span className="text-[#C1121F]">Galería</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {imagenes.map((img, i) => (
          <button
            key={img.alt}
            onClick={() => setIndice(i)}
            className="group overflow-hidden rounded-lg shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C1121F]"
            aria-label={`Ver ${img.alt}`}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="w-full h-40 md:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {indice !== null && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] px-4"
          onClick={cerrar}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de galería"
        >
          <button
            onClick={cerrar}
            aria-label="Cerrar galería"
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
          >
            <X size={30} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); anterior() }}
            aria-label="Imagen anterior"
            className="absolute left-2 md:left-6 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
          >
            <ChevronLeft size={30} />
          </button>
          <img
            src={imagenes[indice].src}
            alt={imagenes[indice].alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl"
          />
          <button
            onClick={(e) => { e.stopPropagation(); siguiente() }}
            aria-label="Imagen siguiente"
            className="absolute right-2 md:right-6 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
          >
            <ChevronRight size={30} />
          </button>
        </div>
      )}
    </section>
  )
}

export default Galeria