import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { preguntasFaq } from './faqData'

function Faq() {
  const [activo, setActivo] = useState(0)

  return (
    <section id="preguntas" className="px-4 py-16 md:py-24 max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-[#373435] mb-10 text-center">
        Preguntas <span className="text-[#C1121F]">Frecuentes</span>
      </h2>
      <div className="space-y-3">
        {preguntasFaq.map((faq, i) => {
          const abierta = activo === i
          return (
            <div key={faq.pregunta} className="bg-[#FEFEFE] border border-[#E5E5E5] rounded-lg">
              <button
                onClick={() => setActivo(abierta ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-[#373435] cursor-pointer"
                aria-expanded={abierta}
              >
                {faq.pregunta}
                <ChevronDown
                  size={20}
                  className={`text-[#C1121F] transition-transform shrink-0 ${abierta ? 'rotate-180' : ''}`}
                />
              </button>
              {abierta && (
                <p className="px-5 pb-4 text-[#373435] opacity-80">{faq.respuesta}</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Faq