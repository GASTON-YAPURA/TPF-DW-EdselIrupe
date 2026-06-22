import { MapPin, Mail, Phone, Camera, Globe } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-[#373435] text-[#FEFEFE]">
      <div className="max-w-7xl mx-auto px-15 py-12 md:py-15">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-25">

          {/* Ubicación */}
          <div>
            <h3 className="text-lg font-semibold text-[#C1121F] mb-4">Ubicación</h3>
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-[#C1121F]" />
              <p className="opacity-80">
                Copiapó, Eva Perón
                <br />
                Tinogasta, Catamarca
              </p>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-[#C1121F] mb-4">Contacto</h3>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:info@edsellrupe.com"
                className="flex items-center gap-2 opacity-80 hover:opacity-100 hover:text-[#C1121F] transition-colors"
              >
                <Mail className="w-5 h-5" />
                info@edsellrupe.com
              </a>
              <a
                href="tel:+549123456789"
                className="flex items-center gap-2 opacity-80 hover:opacity-100 hover:text-[#C1121F] transition-colors"
              >
                <Phone className="w-5 h-5" />
                +54 9 1234 56-789
              </a>
            </div>
          </div>

          {/* Redes Sociales */}
          <div>
            <h3 className="text-lg font-semibold text-[#C1121F] mb-4">Redes Sociales</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="bg-[#C1121F] p-2.5 rounded-full hover:bg-[#5A0B15] transition-colors"
                aria-label="Instagram"
              >
                <Camera className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-[#C1121F] p-2.5 rounded-full hover:bg-[#5A0B15] transition-colors"
                aria-label="Facebook"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
            <p className="mt-4 text-sm opacity-60">
              Villa Fernanda Irupé & Matías Ezequiel Velazquez
            </p>
          </div>

        </div>

        {/* Frase inspiradora */}
        <div className="mt-10 pt-8 border-t border-[#E5E5E5] border-opacity-20 text-center">
          <p className="italic text-lg opacity-70">
            &ldquo;Cada instante tiene una historia, nosotros la capturamos&rdquo;
          </p>
          <p className="mt-4 text-sm opacity-50">
            &copy; {new Date().getFullYear()} Edsellrupe - Fotografía. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
