import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import ScrollToTop from '../components/ScrollToTop'
import eventos from '../assets/eventos.png'
import particulares from '../assets/particulares.png'
import tematica from '../assets/temática.png'
import infantil from '../assets/infantil.png'
import grupales from '../assets/individuales y grupales.png'

const servicios = [
  {
    id: 1,
    titulo: 'Sesiones de Eventos',
    descripcion: 'Cobertura completa de fiestas, celebraciones y eventos sociales.',
    duracion: '4 horas',
    precio: '$25.000',
    imagen: eventos,
  },
  {
    id: 2,
    titulo: 'Sesiones Particulares',
    descripcion: 'Sesiones personalizadas para individuos o parejas.',
    duracion: '2 horas',
    precio: '$15.000',
    imagen: particulares,
  },
  {
    id: 3,
    titulo: 'Sesiones Temáticas',
    descripcion: 'Sesiones con escenografía y vestuario acorde a la temática elegida.',
    duracion: '3 horas',
    precio: '$20.000',
    imagen: tematica,
  },
  {
    id: 4,
    titulo: 'Sesiones Infantiles',
    descripcion: 'Sesiones para niños, escuelas y jardines de infantes.',
    duracion: '2 horas',
    precio: '$18.000',
    imagen: infantil,
  },
  {
    id: 5,
    titulo: 'Sesiones Individuales y Grupales',
    descripcion: 'Sesiones para fotografía individual o grupal.',
    duracion: '2 horas',
    precio: '$12.000',
    imagen: grupales,
  },
]

function Servicios() {
  const navigate = useNavigate()

  return (
    <>
      <SEO
        title="Servicios"
        description="Conocé todos los servicios fotográficos de Edsellrupe: sesiones de eventos, particulares, temáticas, infantiles y grupales en Tinogasta, Catamarca."
      />
    <div className="bg-[#F5F1EC]">
      <section className="pt-30 pb-20 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl md:text-5xl font-bold text-[#373435] mb-4">
        Nuestros <span className="text-[#C1121F]">Servicios</span>
      </h1>
      <p className="text-lg text-[#373435] opacity-80 max-w-3xl mb-12">
        Conocé todos los servicios fotográficos que ofrecemos. Cada sesión
        está pensada para capturar la esencia de tu historia.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {servicios.map((s) => (
          <div
            key={s.id}
            className="rounded-lg overflow-hidden shadow-md bg-[#FEFEFE] border border-[#E5E5E5]"
          >
            <img
              src={s.imagen}
              alt={s.titulo}
              className="h-48 w-full object-cover"
            />
            <div className="p-5">
              <h3 className="text-xl font-bold text-[#373435] mb-2">
                {s.titulo}
              </h3>
              <p className="text-[#373435] opacity-70 mb-4">
                {s.descripcion}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[#373435] opacity-60">
                  Duración: {s.duracion}
                </span>
                <span className="text-lg font-bold text-[#C1121F]">
                  {s.precio}
                </span>
              </div>
              <button
                onClick={() => navigate('/reservar', { state: { servicio: s.titulo } })}
                className="w-full text-center bg-[#C1121F] text-[#FEFEFE] py-2.5 rounded-md font-semibold hover:bg-[#5A0B15] transition-colors cursor-pointer"
              >
                Agendar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>

      <ScrollToTop />
    </div>
    </>
  )
}

export default Servicios
