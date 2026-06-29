import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SEO from '../components/SEO'
import ScrollToTop from '../components/ScrollToTop'
import fondoMain from '../assets/fondo main.png'
import eventos from '../assets/eventos.png'
import particulares from '../assets/particulares.png'
import tematica from '../assets/temática.png'
import infantil from '../assets/infantil.png'
import grupales from '../assets/individuales y grupales.png'

const jsonLdLocalBusiness = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Edsellrupe - Fotografía',
  description: 'Estudio fotográfico profesional en Tinogasta, Catamarca. Sesiones de eventos, particulares, temáticas, infantiles, individuales y grupales.',
  url: 'https://tpf-dw-edsel-irupe.vercel.app',
  telephone: '+54 9 1234 56-789',
  email: 'info@edsellrupe.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Copiapó, Eva Perón',
    addressLocality: 'Tinogasta',
    addressRegion: 'Catamarca',
    postalCode: 'K5340',
    addressCountry: 'AR',
  },
  sameAs: [
    'https://instagram.com/edsellrupe',
    'https://facebook.com/edsellrupe',
  ],
  priceRange: '$$',
  image: 'https://tpf-dw-edsel-irupe.vercel.app/icono.png',
}

const slides = [
  { imagen: eventos, label: 'Sesiones de Eventos' },
  { imagen: particulares, label: 'Sesiones Particulares' },
  { imagen: tematica, label: 'Sesiones Temáticas' },
  { imagen: infantil, label: 'Sesiones Infantiles' },
  { imagen: grupales, label: 'Sesiones Individuales y Grupales' },
]

const masPedidos = [
  {
    titulo: 'Sesiones Particulares',
    descripcion: 'Sesiones personalizadas para individuos o parejas.',
    imagen: particulares,
  },
  {
    titulo: 'Sesiones Infantiles',
    descripcion: 'Sesiones para niños, escuelas y jardines de infantes.',
    imagen: infantil,
  },
  {
    titulo: 'Sesiones de Eventos',
    descripcion: 'Cobertura completa de fiestas, celebraciones y eventos sociales.',
    imagen: eventos,
  },
]

function FilosofiaSlider() {
  const [actual, setActual] = useState(0)

  const anterior = useCallback(() => {
    setActual((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }, [])

  const siguiente = useCallback(() => {
    setActual((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }, [])

  useEffect(() => {
    const interval = setInterval(siguiente, 4000)
    return () => clearInterval(interval)
  }, [siguiente])

  return (
    <div className="relative w-full h-72 md:h-96 rounded-lg overflow-hidden shadow-md">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === actual ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.imagen}
            alt={slide.label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <span className="absolute inset-0 flex items-center justify-center text-[#FEFEFE] text-2xl font-semibold text-center px-4">
            {slide.label}
          </span>
        </div>
      ))}

      {/* Flechas */}
      <button
        onClick={anterior}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-[#FEFEFE] p-2 rounded-full hover:bg-black/60 transition-colors cursor-pointer z-10"
        aria-label="Anterior"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={siguiente}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-[#FEFEFE] p-2 rounded-full hover:bg-black/60 transition-colors cursor-pointer z-10"
        aria-label="Siguiente"
      >
        <ChevronRight size={20} />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActual(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
              i === actual ? 'bg-[#C1121F]' : 'bg-[#FEFEFE] bg-opacity-60'
            }`}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function Home() {
  return (
    <>
      <SEO
        title="Inicio"
        description="Edsellrupe - Fotografía profesional en Tinogasta, Catamarca. Sesiones de eventos, particulares, temáticas, infantiles y grupales."
        jsonLd={jsonLdLocalBusiness}
      />
    <div className="bg-[#F5F1EC]">
      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4 pt-30 pb-20 md:py-55 bg-cover bg-center"
        style={{ backgroundImage: `url(${fondoMain})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-3xl md:text-5xl lg:text-6xl font-bold text-[#FEFEFE] leading-tight max-w-4xl " >
          Capturamos la esencia de las{' '}
          <span className="text-[#C1121F]">personas</span>
          <br />
          en cada etapa de la vida
        </h1>
        <p className="relative z-10 mt-7 text-lg md:text-xl text-[#FEFEFE] max-w-2xl">
          Creamos retratos cálidos, empáticos y profesionales de recién
          nacidos, niños, familias y eventos íntimos de Tinogasta -
          Catamarca.
        </p>
        <div className="relative z-10 mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/reservar"
            className="bg-[#C1121F] text-[#FEFEFE] px-6 py-2.5 rounded-md font-semibold text-base hover:bg-[#5A0B15] transition-colors"
          >
            Reservar Turno
          </Link>
          <Link
            to="/servicios"
            className="border-2 border-[#FEFEFE] text-[#FEFEFE] px-6 py-2.5 rounded-md font-semibold text-base hover:bg-[#FEFEFE] hover:text-[#373435] transition-colors"
          >
            Explorar Servicios
          </Link>
        </div>
      </section>

      {/* Filosofía */}
      <section className="px-4 py-16 md:py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#373435] mb-10 text-center">
          Nuestra{' '}
         Filosofía: <span className="text-[#C1121F]">¿Quienes Somos?</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Texto */}
          <div>
            <p className="text-[#373435] text-lg md:text-xl leading-relaxed opacity-80">
              Edsellrupe es un proyecto fotográfico que nace desde lo más íntimo:
              el deseo de preservar instantes únicos y significativos. Iniciamos
              como una pareja apasionada por la fotografía, descubriendo que
              podíamos transformar ese hobby en algo hermoso, auténtico y
              profesional. Lo que comenzó como una inquietud artística hoy se ha
              convertido en una propuesta con identidad propia, donde cada toma
              busca dejar huella.
            </p>
            <p className="mt-6 text-[#373435] text-lg md:text-xl leading-relaxed opacity-80">
              Nos destacamos por una atención cercana, sensible y empática.
              Nuestro enfoque no es solo técnico, sino también emocional:
              entendemos que detrás de cada sesión hay una historia que merece
              ser contada con calidez, creatividad y respeto. Desde recién
              nacidos hasta adultos mayores, nos inspira capturar la esencia de
              las personas en todas las etapas de la vida.
            </p>
          </div>

          {/* Slider */}
          <FilosofiaSlider />
        </div>
      </section>

      {/* Sesiones Más Pedidas */}
      <SesionesMasPedidas />
      <ScrollToTop />
    </div>
    </>
  )
}

function SesionesMasPedidas() {
  const navigate = useNavigate()

  return (
    <section className="px-4 py-16 md:py-24 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-[#373435] mb-10 text-center">
        Sesiones{' '}
        <span className="text-[#C1121F]">Más Pedidas</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {masPedidos.map((s) => (
          <div
            key={s.titulo}
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
  )
}

export default Home
