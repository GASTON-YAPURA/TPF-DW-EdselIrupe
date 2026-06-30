import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

function NotFound() {
  return (
    <>
      <SEO title="Página no encontrada" />
      <div className="bg-[#F5F1EC] min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center px-4">
        <span className="text-8xl md:text-9xl font-bold text-[#C1121F]">404</span>
        <h1 className="text-3xl md:text-4xl font-bold text-[#373435] mt-4">
          Página no encontrada
        </h1>
        <p className="text-[#373435] opacity-70 text-lg mt-2 max-w-md">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          to="/"
          className="mt-8 bg-[#C1121F] text-[#FEFEFE] px-6 py-2.5 rounded-md font-semibold text-base hover:bg-[#5A0B15] transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    </>
  )
}

export default NotFound