import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const SITIO = 'https://tpf-dw-edsel-irupe.vercel.app'

function SEO({ title, description, image, url, jsonLd, type = 'website', noindex }) {
  const location = useLocation()
  const canonical = url || `${SITIO}${location.pathname}`
  const tituloCompleto = `${title} | Edsellrupe - Fotografía`
  const desc = description || 'Estudio fotográfico en Tinogasta, Catamarca. Sesiones de eventos, particulares, temáticas e infantiles.'
  const img = image || `${SITIO}/icono.png`
  const bloquesJsonLd = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []

  return (
    <Helmet>
      <title>{tituloCompleto}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={tituloCompleto} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Edsellrupe - Fotografía" />
      <meta property="og:locale" content="es_AR" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={tituloCompleto} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {/* Schema.org JSON-LD */}
      {bloquesJsonLd.map((bloque, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(bloque)}
        </script>
      ))}
    </Helmet>
  )
}

export default SEO