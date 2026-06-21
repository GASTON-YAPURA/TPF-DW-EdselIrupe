function Main() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 bg-[#F5F1EC]">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#373435] leading-tight max-w-4xl">
          Preservamos tus{' '}
          <span className="text-[#C1121F]">momentos únicos</span>
          <br />
          con alma de fotógrafos
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[#373435] max-w-2xl opacity-80">
          Cada sesión es una historia que merece ser contada con calidez,
          creatividad y respeto.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <a
            href="/reservar"
            className="bg-[#C1121F] text-[#FEFEFE] px-8 py-3.5 rounded-md font-semibold text-lg hover:bg-[#5A0B15] transition-colors"
          >
            Reservar Turno
          </a>
          <a
            href="/servicios"
            className="border-2 border-[#373435] text-[#373435] px-8 py-3.5 rounded-md font-semibold text-lg hover:bg-[#373435] hover:text-[#FEFEFE] transition-colors"
          >
            Explorar Servicios
          </a>
        </div>
      </section>

      {/* Filosofía */}
      <section className="px-4 py-16 md:py-24 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#373435] mb-6">
          Nuestra{' '}
          <span className="text-[#C1121F]">Filosofía</span>
        </h2>
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
      </section>
    </>
  )
}

export default Main
