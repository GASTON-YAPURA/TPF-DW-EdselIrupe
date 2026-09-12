

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

 7. Conexión frontend-backend + CORS:
        - Formulario de Reserva envía datos al backend via fetch
        - Estado de carga y manejo de errores en el envío
        - Variable de entorno VITE_API_URL para la URL del API
        - Fix: URL de Vercel agregada al CORS del backend
        - Fix: fallback de API_URL cambiado a Render
        - Fix: CORS dinámico acepta cualquier subdominio .vercel.app

 8. Panel Administrativo:
        - Login con autenticación mediante token
        - KPIs: reservas activas, ingresos registrados, cobro pendiente
        - Tabla de reservas con estados (pendiente/señado/completado)
        - Modal de cobro (registrar pagos)
        - Botón eliminar reserva
        - Modal "Añadir Turno Manual" para agendar clientes externos
        - Fix: rewrites en vercel.json para SPA routing (ruta /admin)

 9. Footer - Redes Sociales y Contacto:
        - Iconos SVG de Instagram y Facebook con enlaces reales
        - Email actualizado: irupevilla57@gmail.com (abre Gmail)
        - Teléfono actualizado: +54 3837 430319 (abre WhatsApp)

 10. JSON-LD:
         - Fix: agregar streetAddress y postalCode al bloque LocalBusiness
         - Validado sin errores en Google Rich Results Test

 11. Header:
         - Ajuste de espaciado entre enlaces de navegación

 12. Servicios:
         - Botón "Agendar" redirige a Reservar con el servicio preseleccionado

 13. Core Web Vitals (Lighthouse):
         - Performance: 98 🟢
         - Accesibilidad: 90 🟢
         - Buenas Prácticas: 100 🟢
         - SEO: 100 🟢
         - Capturas en src/assets/metricas01.png y metricas02.png

 14. Documentación:
         - docs/07-ia-aplicada.md (bitácora de IA, Skills/Tool Calling, reflexión crítica)
         - docs/06-changelog.md actualizado
         - README.md actualizado con URL de producción, captura y enlace a docs

 15. Fix: fecha formateada dd/mm/yyyy y total con precio de sesión:
         - Admin.jsx: fecha en formato local argentino (dd/mm/yyyy)
         - Reservar.jsx: envía el precio del servicio como total al backend
         - server/index.js: guarda el campo total al crear reserva pública

 16. Fix: centrar verticalmente mensaje de éxito al solicitar turno:
         - Reservar.jsx: min-h-screen + flex center en vista de confirmación

 17. Fix: corregir "Quien" por "Quienes" en título de Filosofía:
          - Home.jsx: ¿Quien Somos? → ¿Quienes Somos?

 18. Imágenes reales en cards de Servicios y slider del Home:
          - Servicios.jsx: reemplaza colores sólidos por imágenes reales
          - Home.jsx: reemplaza colores sólidos por imágenes en slider Filosofía
          - Agrega 5 imágenes: eventos, particulares, temática, infantil, individuales y grupales

 19. Nueva sección "Sesiones Más Pedidas" en el Home:
          - Sección con 3 cards (Particulares, Infantiles, Eventos)
          - Cada card con imagen y botón Agendar que redirige a /reservar

 20. Divider entre Filosofía y Sesiones Más Pedidas:
          - Home.jsx: agrega línea divisoria <hr> entre ambas secciones

 21. Página 404:
          - Crea NotFound.jsx con mensaje amigable y botón Volver al Inicio
          - App.jsx: agrega ruta catch-all con <Route path="*" />

22. Limpieza y mejoras finales:
         - Elimina componente Main.jsx (código sin uso)
         - Admin.jsx: agrega spinner (Loader2) mientras se cargan datos
         - README.md: agrega instrucciones de instalación, variables de entorno y API endpoints

## COMMIT E4: MEJORAS DE SEGURIDAD
 23. Autenticación JWT con librería estándar:
         - server/index.js: reemplaza token custom (base64 + HMAC) por jsonwebtoken
         - Firmado con expiresIn '1d' y verificación con jwt.verify (firma + expiración)
         - server/package.json: nueva dependencia jsonwebtoken

 24. Variables de entorno obligatorias:
         - server/index.js: ya no existen valores por defecto (admin/admin123)
         - Si faltan ADMIN_USER, ADMIN_PASS o JWT_SECRET el servidor no arranca (process.exit)
         - server/.env.example: plantilla de configuración (nuevo)

 25. Rate limiting en el login:
         - server/index.js: express-rate-limit con 5 intentos cada 15 minutos
         - Respuesta 429 al exceder el límite (previene fuerza bruta)

 26. Precio total calculado solo en el backend:
         - Reservar.jsx: deja de enviar el total (ya no viaja desde el cliente)
         - Admin.jsx: elimina campo "Monto Total" del turno manual
         - server/index.js: totalSeDeServicio() obtiene el precio desde la tabla servicios
         - Seed automático del catálogo con ON CONFLICT (titulo) DO NOTHING

 27. Validación server-side de fecha/horario/campos:
         - server/index.js: funciones validarCampos, validarFecha y validarHorario
         - Reservar.jsx: input date con min=hoy (no permite fechas pasadas)
         - Se rechazan fechas anteriores a hoy, emails/teléfonos inválidos y longitudes excesivas

 28. CORS estricto:
         - server/index.js: lista blanca exacta (localhost:5173 y dominio de producción)
         - Elimina aceptación de cualquier subdominio .vercel.app

 29. Cabeceras de seguridad:
         - server/index.js: middleware helmet() en la API
         - vercel.json: Content-Security-Policy, X-XSS-Protection y Permissions-Policy

 30. Lint y configuración:
         - eslint.config.js: agrega globals de Node para server/**/*.js
         - Corrige imports sin uso en Admin.jsx y escape innecesario en regex
         - Admin.jsx: refactor token a estado (setToken) eliminando setState en effect

 31. Documentación:
         - docs/08 - mejoras de seguridad.md: explicación paso a paso para la mesa final

## COMMIT E5: MEJORAS EN EL FRONTEND (SEO + UX + PWA)
 32. SEO - Canonical dinámico:
         - SEO.jsx: canonical derivado de useLocation() (antes apuntaba a la raíz)
         - Soporte para múltiples bloques JSON-LD y prop noindex

 33. SEO - Datos estructurados:
         - Home.jsx: tipo Photographer (en vez de LocalBusiness) + tel/email reales
         - Nuevo bloque JSON-LD FAQPage generado desde faqData.js

 34. SEO - Meta tags y archivos:
         - SEO.jsx: Twitter Cards, og:locale es_AR, dimensiones og:image
         - Admin.jsx y NotFound.jsx: noindex, nofollow
         - index.html: favicon, theme-color, manifest, metas iOS
         - robots.txt: Disallow /admin
         - sitemap.xml: lastmod

 35. Botón flotante de WhatsApp:
         - WhatsAppButton.jsx: fijo abajo a la izquierda, wa.me con mensaje precargado
         - App.jsx: montado globalmente

 36. Galería con lightbox:
         - Galeria.jsx: grilla responsive + visor con navegación por teclado
         - Navegación prev/next, Escape para cerrar, bloqueo de scroll

 37. Testimonios y FAQ:
         - Testimonios.jsx: reseñas con estrellas
         - Faq.jsx + faqData.js: acordeón accesible alimentando el JSON-LD FAQPage

 38. Mapa de ubicación:
         - Footer.jsx: iframe de Google Maps embebido (lazy)

 39. Animaciones de scroll:
         - Reveal.jsx: IntersectionObserver + prefers-reduced-motion
         - Aplicado en Home (filosofía, más pedidas, galería, testimonios, FAQ) y Servicios

 40. PWA:
         - public/manifest.webmanifest + iconos 192/512 generados en public/icons/
         - public/sw.js: service worker network-first con fallback a caché
         - main.jsx: registro del SW solo en producción (import.meta.env.PROD)
         - vercel.json: worker-src 'self' en la CSP
         - index.html: apple-mobile-web-app metas

 41. Documentación:
         - docs/08: reestructurado en MEJORAS EN EL BACKEND y MEJORAS EN EL FRONTEND
         - README.md: link a docs/08 actualizado

## COMMIT E6: FIX DEPLOY EN RENDER (API)
 42. Diagnóstico:
         - El servidor exige JWT_SECRET, ADMIN_USER y ADMIN_PASS (process.exit(1) si faltan)
         - Si Render no tiene esas variables configuradas, el proceso muere al arrancar -> Deploy failed

 43. Solución:
         - render.yaml (raíz): blueprint con rootDir: server, build npm install,
           start npm start, healthCheckPath /api/servicios y las 4 variables
           (DATABASE_URL, JWT_SECRET, ADMIN_USER, ADMIN_PASS) con sync: false
         - docs/08: nueva sección "Deploy de la API en Render" con pasos del Dashboard

## COMMIT E7: GALERÍA POR COLECCIONES (ESTILO PIXIESET)
 44. Fotos reales desde el CDN de Pixieset:
         - Script de descarga desde el feed interno client/loadphotos/?cuk=&cid=&gs=highlights
         - 10 fotos por colección (Bebés, Paisajes, Bodas, Infantiles, Embarazo, Bautismos)
         - Optimizadas a 1024px / JPEG 82 en src/assets/galeria/<coleccion>/

 45. Datos:
         - galeriaData.js: 6 colecciones con portada + fotos (importadas y tipadas)

 46. Componente GaleriaSesiones.jsx (reemplaza a Galeria.jsx):
         - Grilla de colecciones con portada, gradiente y contador de fotos
         - Click -> overlay a pantalla completa con la grilla de la sesión
         - Click en foto -> lightbox (prev/next, teclado, contador, bloqueo scroll)
         - Accesible: role=dialog, aria-modal, foco gerenciado, Escape cierra visor y luego colección

 47. Integración y docs:
         - Home.jsx usa GaleriaSesiones (mantiene id="galeria" y Reveal)
         - Se elimina Galeria.jsx
         - docs/08: sección de galería actualizada + cómo agregar fotos

## COMMIT E8: PANEL ADMIN CON SERVICIOS Y GALERÍA + FOTOS EN LA BASE DE DATOS
 48. Base de datos:
         - Tabla galeria_fotos (coleccion, nombre_archivo, mime, bytes BYTEA, creada_en) + índice por colección
         - Columnas imagen / imagen_mime en servicios (BYTEA)
         - Auto-creación de esquema en inicializarDB (idempotente)

 49. Backend (server/index.js):
         - express.json({ limit: '15mb' }) para aceptar uploads en JSON sin agregar dependencias
         - CRUD de servicios protegido (POST / PUT / DELETE /api/servicios)
         - Imagen por servicio: POST / DELETE (auth) y GET público /api/servicios/:id/imagen
         - Galería: GET /api/galeria (metadatos, sin bytes), GET /api/galeria/:id/imagen (público),
           POST (auth, validación MIME jpg/png/webp + tope 6 MB) y DELETE (auth)

 50. Frontend:
         - lib/api.js: base de API + helpers para URLs de imágenes
         - Servicios.jsx y Reservar.jsx leen de la API con fallback a los datos estáticos
         - Servicios muestra imagen de la base si el servicio tiene; si no, la PNG local
         - GaleriaSesiones.jsx fusiona las fotos de la base con las locales y agrega colecciones nuevas

 51. Panel Admin (Admin.jsx): 3 pestañas
         - Reservas (como estaba) / Servicios (CRUD + subir imagen) / Galería (subida múltiple + borrado)
         - El dropdown de turno manual usa los servicios de la API
         - Validación de archivos en cliente y servidor

 52. Docs:
         - docs/08 reorganizado en Backend / Frontend / Base de datos con las mejoras nuevas
         - changelog COMMIT E8

## COMMIT E9: GALERÍA COMPLETA EN EL PANEL (FOTOS DEL SITIO + SUBIDAS)
 53. Admin.jsx - Pestaña Galería:
         - Al seleccionar una colección se muestran TODAS sus fotos en dos grupos:
           . Fotos del sitio (base): las 60 originales de galeriaData.js, con etiqueta
             "Base del sitio" y sin botón eliminar (son parte del diseño del build)
           . Fotos subidas desde el panel: con botón eliminar (como estaba)
         - Contador total: "N fotos en total · X del sitio + Y subidas"
         - Texto aclaratorio en la tarjeta de subida (las fotos base no se borran del panel)
         - Las colecciones nuevas solo muestran el grupo de subidas

 54. Docs:
         - docs/08: pestaña Galería (sección 7 del frontend) actualizada
         - changelog COMMIT E9

## COMMIT E9-B: FIX IMAGEN DE SERVICIO NO VISIBLE
 55. Home.jsx:
         - "Sesiones Más Pedidas" ahora lee la API: si un servicio tiene imagen en la
           base se muestra esa; si no, la local. Antes usaba datos estáticos
           (imágenes y precios del código), por eso el cambio hecho en el panel no
           aparecía en esa sección
 56. server/index.js:
         - Cache-Control de imágenes (servicios y galería) de 1 hora a 60 segundos,
           para que al cambiar una imagen se vea al instante y no quede "pegada" la vieja
 57. Docs:
         - docs/08: sección 8 (servicios desde API) actualizada
         - changelog COMMIT E9-B
