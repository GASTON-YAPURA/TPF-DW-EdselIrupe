import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import logo from '../assets/logo.png'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 w-full bg-[#FEFEFE] shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <img
              src={logo}
              alt="Edsellrupe - Fotografía"
              className="h-10 md:h-12 w-auto"
            />
          </a>

          {/* Nav - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="/"
              className="text-[#373435] hover:text-[#C1121F] font-medium transition-colors"
            >
              Inicio
            </a>
            <a
              href="/servicios"
              className="text-[#373435] hover:text-[#C1121F] font-medium transition-colors"
            >
              Servicios
            </a>
            <a
              href="/reservar"
              className="bg-[#C1121F] text-[#FEFEFE] px-5 py-2.5 rounded-md font-medium hover:bg-[#5A0B15] transition-colors"
            >
              Reservar Turno
            </a>
          </nav>

          {/* Hamburger - Mobile */}
          <button
            className="md:hidden text-[#373435] p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#FEFEFE] border-t border-[#E5E5E5]">
          <nav className="flex flex-col px-4 py-4 gap-3">
            <a
              href="/"
              className="text-[#373435] hover:text-[#C1121F] py-2 font-medium transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </a>
            <a
              href="/servicios"
              className="text-[#373435] hover:text-[#C1121F] py-2 font-medium transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Servicios
            </a>
            <a
              href="/reservar"
              className="bg-[#C1121F] text-[#FEFEFE] text-center px-5 py-2.5 rounded-md font-medium hover:bg-[#5A0B15] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Reservar Turno
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
