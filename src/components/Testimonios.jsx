import { Star } from 'lucide-react'

const testimonios = [
  {
    nombre: 'María L.',
    texto:
      'La sesión de fotos de mi familia fue una experiencia increíble. Nos hicieron sentir súper cómodos y las fotos quedaron hermosas. 100% recomendables.',
    estrellas: 5,
  },
  {
    nombre: 'Juan P.',
    texto:
      'Contratamos la cobertura de la fiesta de 15 de mi hija y fue un acierto total. Captaron cada momento especial con mucha calidez y profesionalismo.',
    estrellas: 5,
  },
  {
    nombre: 'Camila R.',
    texto:
      'Hice una sesión temática y el resultado superó lo que esperaba. Se nota el amor por lo que hacen y el trato es súper cercano.',
    estrellas: 5,
  },
]

function Testimonios() {
  return (
    <section className="px-4 py-16 md:py-24 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-[#373435] mb-10 text-center">
        Lo que dicen <span className="text-[#C1121F]">nuestros clientes</span>
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonios.map((t) => (
          <blockquote
            key={t.nombre}
            className="bg-[#FEFEFE] border border-[#E5E5E5] rounded-lg p-6 shadow-md"
          >
            <div className="flex gap-1 mb-3" aria-label={`${t.estrellas} estrellas`}>
              {Array.from({ length: t.estrellas }).map((_, i) => (
                <Star key={i} size={18} className="text-[#C1121F] fill-[#C1121F]" />
              ))}
            </div>
            <p className="text-[#373435] opacity-80 mb-4 italic">&ldquo;{t.texto}&rdquo;</p>
            <footer className="font-semibold text-[#373435]">— {t.nombre}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}

export default Testimonios