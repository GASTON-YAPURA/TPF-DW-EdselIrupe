

# LINK - REPOSITORIO DEL PROYECTO EN GITHUB

https://github.com/GASTON-YAPURA/TPF-DW-EdselIrupe



# LINK - DESPLIEGUE DEL PROYECTO EN VERCEL
https://tpf-dw-edsel-irupe.vercel.app/


## COMMITS: E1 - E2
 1. Proyecto subido
 2. Solución del error en el componente Main.jsx
 3. Cambios a la página:

        Header:
            - Logo con nombre EDSELIRUPE + "Fotografía" al lado
            - Navegación con NavLink que resalta en rojo (fondo rojo + texto blanco) 
            la sección activa.

        Home:
            - Hero con imagen de fondo, capa oscura, título y texto del wireframe
            - Sección Filosofía en 2 columnas (texto + slider automático con colores
            sólidos).
            - Fondo #F5F1EC en toda la página.

        Servicios:
            - Grilla de tarjetas con servicios, duración, precio, botón Agendar
            - Flecha volver arriba en mobile.

        Reservar Turno:
            - Formulario multi-paso (Servicio → Fecha/Hora → Datos) con navegación
            - Indicadores de paso
            - Sombra en tarjetas de selección

        General:
            - React Router configurado con /, /servicios, /reservar
            - ScrollToTop component compartido
            - Fondo #F5F1EC en todas las páginas


## COMMITS: E3
 4. Backend con Express + PostgreSQL:
        - Carpeta /server con servidor Node.js/Express
        - Conexión a PostgreSQL con pool de conexiones
        - Creación automática de tablas (servicios, reservas)
        - Endpoints: GET /api/servicios, POST /api/reservas, GET /api/health
        - Validación de campos obligatorios en el backend
        - Script SQL de inicialización (init.sql)

 5. SEO Técnico:
        - Componente SEO.jsx con react-helmet-async
        - Meta tags title y description por página
        - Open Graph (og:title, og:description, og:image, og:url)
        - JSON-LD Schema.org LocalBusiness en Home
        - Etiqueta canonical en todas las páginas
        - robots.txt y sitemap.xml en /public

 6. Seguridad:
        - vercel.json con headers X-Content-Type-Options, X-Frame-Options, Referrer-Policy
        - .env.local y .env agregados al .gitignore
        - Sanitización de inputs (escapado HTML contra XSS)
        - Validación de formato email y teléfono
        - Mensajes de error específicos por campo

 7. Conexión frontend-backend:
        - Formulario de Reserva envía datos al backend via fetch
        - Estado de carga y manejo de errores en el envío
        - Variable de entorno VITE_API_URL para la URL del API

 8. Documentación:
        - docs/07-ia-aplicada.md (bitácora de IA, Skills/Tool Calling, reflexión crítica)
        - docs/06-changelog.md actualizado
