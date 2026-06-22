import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

function ScrollToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setShow(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`md:hidden fixed bottom-6 right-6 z-50 bg-[#C1121F] text-[#FEFEFE] p-3 rounded-full shadow-lg hover:bg-[#5A0B15] transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Volver arriba"
    >
      <ArrowUp size={24} />
    </button>
  )
}

export default ScrollToTop
