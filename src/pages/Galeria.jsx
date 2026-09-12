import SEO from '../components/SEO'
import ScrollToTop from '../components/ScrollToTop'
import GaleriaSesiones from '../components/GaleriaSesiones'

function Galeria() {
  return (
    <>
      <SEO
        title="Galería"
        description="Galería de sesiones fotográficas de Edsellrupe: bebés, paisajes, bodas, infantiles, embarazo y bautismos en Tinogasta, Catamarca."
      />
      <div className="bg-[#F5F1EC]">
        <GaleriaSesiones />
        <ScrollToTop />
      </div>
    </>
  )
}

export default Galeria