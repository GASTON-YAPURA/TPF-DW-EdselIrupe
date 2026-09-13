import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/icono.png'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const logueado = Boolean(sessionStorage.getItem('token'))
  const enPanel = location.pathname === '/edselirupePanelAdmin'

  return (
    <header className="fixed top-0 left-0 w-full bg-[#373435] shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <NavLink to="/" className="shrink-0 flex items-center gap-2">
            <img
              src={logo}
              alt="Edsellrupe - Fotografía"
              className="h-10 md:h-12 w-auto"
            />
            <div className="flex flex-col leading-tight -mt-0.5">
              <span className="text-base md:text-lg font-bold tracking-wider">
                <span className="text-[#FEFEFE]">EDSEL</span>
                <span className="text-[#C1121F]">IRUPE</span>
              </span>
              <span className="text-[9px] md:text-[11px] text-[#FEFEFE] tracking-[0.2em] uppercase">
                Fotografía
              </span>
            </div>
          </NavLink>

          {/* Nav - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-medium transition-colors px-4 py-1 rounded-md ${isActive ? 'bg-[#C1121F] text-[#FEFEFE]' : 'border border-transparent text-[#FEFEFE] hover:bg-[#C1121F] hover:text-[#FEFEFE]'}`
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/servicios"
              className={({ isActive }) =>
                `font-medium transition-colors px-5 py-3 rounded-md ${isActive ? 'bg-[#C1121F] text-[#FEFEFE]' : 'border border-transparent text-[#FEFEFE] hover:bg-[#C1121F] hover:text-[#FEFEFE]'}`
              }
            >
              Servicios
            </NavLink>
            <NavLink
              to="/galeria"
              className={({ isActive }) =>
                `font-medium transition-colors px-5 py-3 rounded-md ${isActive ? 'bg-[#C1121F] text-[#FEFEFE]' : 'border border-transparent text-[#FEFEFE] hover:bg-[#C1121F] hover:text-[#FEFEFE]'}`
              }
            >
              Galería
            </NavLink>
            <NavLink
              to="/reservar"
              className={({ isActive }) =>
                `font-medium transition-colors px-5 py-3 rounded-md ${isActive ? 'bg-[#C1121F] text-[#FEFEFE]' : 'border border-transparent text-[#FEFEFE] hover:bg-[#C1121F] hover:text-[#FEFEFE]'}`
              }
            >
              Reservar Turno
            </NavLink>
            {logueado && !enPanel && (
              <NavLink
                to="/edselirupePanelAdmin"
                className={({ isActive }) =>
                  `font-semibold transition-colors border-2 border-[#C1121F] rounded-md px-4 py-2 ${isActive ? 'bg-[#C1121F] text-[#FEFEFE]' : 'text-[#FEFEFE] hover:bg-[#C1121F] hover:text-[#FEFEFE]'}`
                }
              >
                👤 Panel Administrativo
              </NavLink>
            )}
          </nav>

          {/* Hamburger - Mobile */}
          <button
            className="md:hidden text-[#FEFEFE] p-2 cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <span className="flex flex-col items-center justify-center">
              <span
                className={`block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                  menuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out my-1 ${
                  menuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                  menuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </span>
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#FEFEFE] border-t border-[#E5E5E5] animate-slide-down">
          <nav className="flex flex-col px-4 py-4 gap-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `py-2 px-3 font-medium transition-colors rounded-md ${isActive ? 'bg-[#C1121F] text-[#FEFEFE]' : 'text-[#373435] hover:bg-[#C1121F] hover:text-[#FEFEFE]'}`
              }
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </NavLink>
            <NavLink
              to="/servicios"
              className={({ isActive }) =>
                `py-2 px-3 font-medium transition-colors rounded-md ${isActive ? 'bg-[#C1121F] text-[#FEFEFE]' : 'text-[#373435] hover:bg-[#C1121F] hover:text-[#FEFEFE]'}`
              }
              onClick={() => setMenuOpen(false)}
            >
              Servicios
            </NavLink>
            <NavLink
              to="/galeria"
              className={({ isActive }) =>
                `py-2 px-3 font-medium transition-colors rounded-md ${isActive ? 'bg-[#C1121F] text-[#FEFEFE]' : 'text-[#373435] hover:bg-[#C1121F] hover:text-[#FEFEFE]'}`
              }
              onClick={() => setMenuOpen(false)}
            >
              Galería
            </NavLink>
            <NavLink
              to="/reservar"
              className={({ isActive }) =>
                `py-2 px-3 font-medium transition-colors rounded-md ${isActive ? 'bg-[#C1121F] text-[#FEFEFE]' : 'text-[#373435] hover:bg-[#C1121F] hover:text-[#FEFEFE]'}`
              }
              onClick={() => setMenuOpen(false)}
            >
              Reservar Turno
            </NavLink>
            {logueado && !enPanel && (
              <>
                <hr className="border-t border-[#E5E5E5]" />
                <NavLink
                  to="/edselirupePanelAdmin"
                  className={({ isActive }) =>
                    `py-2 px-3 text-center font-semibold transition-colors border-2 border-[#C1121F] rounded-md ${isActive ? 'bg-[#C1121F] text-[#FEFEFE]' : 'text-[#373435] hover:bg-[#C1121F] hover:text-[#FEFEFE]'}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  👤 Panel Administrativo
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
