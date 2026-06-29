import { Helmet } from 'react-helmet-async'

const SITIO = 'https://tpf-dw-edsel-irupe.vercel.app'

function SEO({ title, description, image, url, jsonLd }) {
  const tituloCompleto = `${title} | Edsellrupe - Fotografía`
  const desc = description || 'Estudio fotográfico en Tinogasta, Catamarca. Sesiones de eventos, particulares, temáticas e infantiles.'
  const img = image || `${SITIO}/icono.png`
  const link = url || SITIO

  return (
    <Helmet>
      <title>{tituloCompleto}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={link} />

      {/* Open Graph */}
      <meta property="og:title" content={tituloCompleto} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={link} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Edsellrupe - Fotografía" />

      {/* Schema.org JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}

export default SEO
