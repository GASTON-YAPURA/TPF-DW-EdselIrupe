# TRABAJO PRÁCTICO N° 3 — Desarrollo Web II

**Edsellrupe — Estudio Fotográfico**  
Diseño Visual, SEO, Seguridad, IA e Integración de Datos

**Institución:** Instituto de Educación Superior "Gobernador José Cubas"  
**Carrera:** Desarrollo de Software  
**Espacio Curricular:** Desarrollo Web II  
**Docente:** Carla Marrone  
**Alumno:** Gastón Yapura  
**Fecha:** Julio de 2026

---

## 1. Introducción

El presente trabajo práctico tiene como objetivo la implementación y documentación de un sitio web completo para un estudio fotográfico llamado "Edsellrupe — Fotografía", ubicado en la ciudad de Tinogasta, Catamarca. El proyecto abarca cinco ejes fundamentales: diseño visual responsivo, optimización para motores de búsqueda (SEO), seguridad en aplicaciones web, aplicación de inteligencia artificial en el proceso de desarrollo, e integración de datos con base de datos y backend.

El sitio fue desarrollado utilizando React con Vite como bundler, Tailwind CSS v4 para el diseño visual, React Router v7 para la navegación, y un backend en Node.js con Express y PostgreSQL alojado en Neon.tech. El frontend se encuentra desplegado en Vercel y el backend en Render.com.

A lo largo de este informe se detallan las decisiones técnicas, la implementación de cada componente, los resultados obtenidos en las auditorías de Lighthouse, y una reflexión crítica sobre el uso de herramientas de inteligencia artificial para la generación y depuración de código.

---

## 2. Diseño Visual (Opción C)

### 2.1 Stack de Diseño

Se optó por Tailwind CSS v4 junto con React para el diseño visual del sitio. Esta combinación permite un desarrollo ágil con utilidades directas en el marcado, evitando la fragmentación de estilos en archivos CSS separados. Se utilizaron componentes funcionales de React con estado local y hooks para la interfaz de usuario.

### 2.2 Paleta de Colores

La paleta cromática fue definida a partir del wireframe original, manteniendo consistencia en todas las secciones:

- **#F5F1EC** — fondo general de las páginas (beige claro)
- **#373435** — color principal para textos y elementos oscuros
- **#C1121F** — color de acento para botones, enlaces activos y detalles (rojo)
- **#FEFEFE** — fondo de tarjetas, formularios y tabla del panel admin

### 2.3 Componentes Principales

**Header.** Barra de navegación con logo "Edsellrupe Fotografía" y enlaces a Inicio, Servicios, Reservar Turno y Admin. Utiliza NavLink de React Router para resaltar la sección activa con fondo rojo y texto blanco.

**Home.** Hero con imagen de fondo y capa oscura superpuesta, sección "Filosofía" con slider automático de colores, y presentación del estudio.

**Servicios.** Grilla de tarjetas con los cinco servicios ofrecidos: Sesiones de Eventos, Particulares, Temáticas, Infantiles, e Individuales y Grupales. Cada tarjeta incluye descripción, duración, precio y botón "Agendar".

**Reservar Turno.** Formulario multi-paso con tres etapas: selección de servicio → fecha y horario → datos del cliente. Incluye indicadores de progreso, navegación entre pasos, y validación en cada etapa.

**Footer.** Pie de página con información de contacto real: correo electrónico (irupevilla57@gmail.com con enlace a Gmail), teléfono (+54 3837 430319 con enlace a WhatsApp), e iconos SVG de Instagram y Facebook con enlaces a las cuentas reales del estudio.

### 2.4 Framework CSS: Tailwind CSS v4

Se utilizó Tailwind CSS v4, la versión más reciente del framework que incorpora el motor de generación oxidativo (Oxide) para build speeds más rápidos. A diferencia de v3, la configuración se realiza mediante la directiva `@import "tailwindcss"` en el CSS principal sin necesidad de `tailwind.config.js`. Las variantes y utilidades se aplican directamente en las `className` de JSX, permitiendo un diseño responsivo con los breakpoints `sm`, `md`, `lg` y utilidades como `flex`, `grid`, `gap`, `padding`, `margin`, etc.

### 2.5 Captura del Sitio en Producción

*[INSERTAR CAPTURA: sitio en producción — pantalla completa]*

---

## 3. SEO (Opción B)

### 3.1 Meta Tags y Open Graph

Se implementó un componente SEO.jsx reutilizable que utiliza la librería `react-helmet-async` para inyectar etiquetas meta dinámicamente en cada página. Cada ruta del sitio (Home, Servicios, Reservar, Admin) define su propio título, descripción y propiedades Open Graph (`og:title`, `og:description`, `og:image`, `og:url`). También se incluye la etiqueta canonical para evitar contenido duplicado.

Ejemplo de implementación en la página Home:

```jsx
<SEO
  title="Edsellrupe - Estudio Fotográfico"
  description="Estudio fotográfico profesional en Tinogasta, Catamarca."
/>
```

### 3.2 JSON-LD y Datos Estructurados

Se incorporó un bloque JSON-LD con Schema.org de tipo `LocalBusiness` en la página principal. Los datos incluyen: nombre del estudio, descripción, dirección (con `streetAddress` y `postalCode`), número de teléfono, correo electrónico, URL del sitio, horarios de atención, y coordenadas geográficas.

El JSON-LD fue validado exitosamente en Google Rich Results Test sin errores ni advertencias, lo que garantiza que los motores de búsqueda pueden interpretar correctamente la información del negocio local.

### 3.3 Archivos para Motores de Búsqueda

- **robots.txt** — permitiendo el acceso a todos los crawlers (`Allow: /`) y señalizando la ubicación del sitemap.
- **sitemap.xml** — con las URLs principales del sitio (`/`, `/servicios`, `/reservar`) y sus fechas de última modificación.

### 3.4 Resultados Lighthouse

Se realizó una auditoría completa con Google Lighthouse, obteniendo los siguientes puntajes:

- **Performance:** 98/100 🟢
- **Accesibilidad:** 90/100 🟢
- **Buenas Prácticas:** 100/100 🟢
- **SEO:** 100/100 🟢

*[INSERTAR CAPTURA: informe Lighthouse completo]*

*[INSERTAR CAPTURA: JSON-LD validado en Google Rich Results Test]*

---

## 4. Seguridad (Opción B)

### 4.1 Headers HTTP de Seguridad

Se configuraron los siguientes headers de seguridad en el archivo `vercel.json`:

- **X-Content-Type-Options: nosniff** — evita que el navegador interprete archivos con un tipo MIME diferente al declarado.
- **X-Frame-Options: DENY** — protege contra clickjacking al impedir que el sitio sea cargado en un iframe.
- **Referrer-Policy: strict-origin-when-cross-origin** — controla la información de referencia enviada en las solicitudes.

### 4.2 Sanitización y Validación de Formularios

El formulario de reserva implementa las siguientes medidas:

- **Sanitización XSS:** los campos de texto se sanean escapando caracteres HTML peligrosos (`&`, `<`, `>`, `"`, `'`) antes de ser procesados.
- **Validación de email:** se verifica el formato mediante expresión regular antes de enviar la solicitud.
- **Validación de teléfono:** se permite solo dígitos, espacios, `+`, paréntesis y guiones (7-20 caracteres).
- **Validación en backend:** todos los campos obligatorios se verifican nuevamente en el servidor antes de insertar en la base de datos.

### 4.3 Variables de Entorno

Las credenciales sensibles se almacenan exclusivamente en variables de entorno. En el frontend se utiliza `VITE_API_URL` (con prefijo `VITE_` expuesto por Vite). En el backend, las variables `DATABASE_URL`, `ADMIN_USER`, `ADMIN_PASS` y `JWT_SECRET` se configuran en el panel de Render y se leen mediante `dotenv`. Los archivos `.env` y `.env.local` están incluidos en `.gitignore`.

---

## 5. IA Aplicada (Opción B)

### 5.1 Herramienta Utilizada

Se utilizó **opencode** como asistente de codificación basado en inteligencia artificial. OpenCode es una herramienta CLI que opera como agente conversacional con acceso al sistema de archivos, terminal, y capacidades de búsqueda y edición de código. Funciona con un modelo de lenguaje avanzado (claude-sonnet-4-20250514) y dispone de herramientas especializadas (Skills) para tareas como lectura de archivos, búsqueda de contenido, ejecución de comandos, y edición precisa de código.

### 5.2 Usos de la IA Durante el Desarrollo

**Uso 1: Creación del proyecto base y componentes.** Se utilizó la IA para generar la estructura inicial del proyecto React + Vite + Tailwind CSS, incluyendo la configuración del enrutador, los componentes principales (Header, Footer, Hero, Servicios, Reservar), y el diseño responsivo con Tailwind CSS v4. La IA interpretó las instrucciones del wireframe y generó el código correspondiente, reduciendo significativamente el tiempo de desarrollo inicial.

**Uso 2: Debugging de CORS y configuración del backend.** Al desplegar el backend en Render y el frontend en Vercel, surgieron problemas de CORS debido a que Vercel genera URLs preview dinámicas con hashes aleatorios en cada deploy. La IA propuso una solución de CORS dinámico utilizando `endsWith('.vercel.app')` en lugar de una lista fija de orígenes, resolviendo el problema sin necesidad de actualizar la configuración en cada deploy.

**Uso 3: Generación de documentación y archivos SEO.** La IA asistió en la creación de la documentación del proyecto (README.md, changelog, bitácora de IA), los archivos de SEO (robots.txt, sitemap.xml, JSON-LD), y la configuración de seguridad (headers HTTP, sanitización de inputs).

### 5.3 Skills y Tool Calling

OpenCode utiliza un sistema de Skills que permite ejecutar tareas especializadas mediante herramientas específicas:

- **Read:** lectura de archivos existentes para entender el código base antes de modificarlo.
- **Edit:** edición precisa de código mediante reemplazo de texto exacto en archivos.
- **Write:** creación de nuevos archivos (componentes, documentación, configuración).
- **Bash:** ejecución de comandos de terminal (npm install, git, etc.).
- **Grep / Glob:** búsqueda de archivos y contenido dentro del código fuente.
- **WebFetch / WebSearch:** consulta de documentación oficial y recursos en línea.

### 5.4 Reflexión Crítica

La experiencia de utilizar un asistente de IA para el desarrollo de este proyecto revela tanto ventajas como limitaciones importantes. Por un lado, la IA acelera significativamente tareas repetitivas como la generación de estructuras de componentes, la creación de formularios con validación, y la redacción de documentación técnica. También resulta muy útil para debugging, especialmente cuando se necesita identificar rápidamente patrones de error en configuraciones complejas (como CORS + deploy multi-plataforma).

Sin embargo, la IA no reemplaza el conocimiento fundamental del desarrollador. Para utilizar eficazmente estas herramientas, es necesario: (a) comprender el problema que se quiere resolver para poder formular instrucciones precisas, (b) evaluar críticamente el código generado antes de incorporarlo, y (c) tener la capacidad de modificar y adaptar las soluciones propuestas cuando no se ajustan exactamente al contexto del proyecto.

En particular, se observó que la IA puede generar código que funciona pero no sigue exactamente las convenciones del proyecto existente, por lo que siempre es necesario revisar y ajustar el estilo para mantener la consistencia. Asimismo, la IA puede sugerir soluciones que parecen correctas pero que requieren verificación manual, especialmente en lo relativo a seguridad y configuración de despliegue.

En conclusión, la IA se posiciona como una herramienta complementaria de alta productividad, pero no como un sustituto del juicio técnico del desarrollador. El equilibrio ideal consiste en delegar tareas mecánicas y de generación inicial a la IA, mientras que el diseñador/desarrollador conserva el control sobre las decisiones arquitectónicas, de seguridad y de experiencia de usuario.

---

## 6. Integración de Datos (Opción A)

### 6.1 Backend

El backend fue desarrollado con Node.js y Express, utilizando PostgreSQL como base de datos relacional alojada en Neon.tech (plan gratuito).

#### 6.1.1 Conexión a Base de Datos

Se utiliza un pool de conexiones de la librería `pg` para gestionar las conexiones a PostgreSQL. La URL de conexión se obtiene de la variable de entorno `DATABASE_URL`, y las tablas se crean automáticamente al iniciar el servidor mediante el método `inicializarDB()`.

**Tabla `reservas`:**

- `id` (SERIAL PRIMARY KEY)
- `servicio` (VARCHAR 100)
- `fecha` (DATE), `horario` (TIME)
- `nombre`, `email`, `telefono`, `mensaje`
- `total` (INTEGER), `abonado` (INTEGER)
- `estado` (VARCHAR 20): pendiente, señado, completado
- `creada_en` (TIMESTAMP DEFAULT NOW())

#### 6.1.2 Endpoints REST

- `GET /api/servicios` — obtiene la lista de servicios.
- `POST /api/reservas` — crea una nueva reserva desde el formulario público.
- `GET /api/health` — verifica el estado del servidor.
- `POST /api/auth/login` — autentica al administrador y devuelve un token.
- `GET /api/reservas` — obtiene todas las reservas (requiere token).
- `GET /api/admin/kpis` — devuelve KPIs: reservas activas, ingresos, cobro pendiente (requiere token).
- `PUT /api/reservas/:id/cobro` — registra un pago parcial o total (requiere token).
- `DELETE /api/reservas/:id` — elimina una reserva (requiere token).
- `POST /api/reservas/manual` — crea una reserva manualmente desde el panel admin (requiere token).

#### 6.1.3 Autenticación

Se implementó un sistema de autenticación simple basado en HMAC-SHA256 con `crypto` (sin JWT). El token incluye el nombre de usuario y una fecha de expiración de 24 horas, firmado con una clave secreta. Las credenciales del administrador se configuran mediante las variables de entorno `ADMIN_USER` y `ADMIN_PASS` en el panel de Render.

### 6.2 Frontend — Panel de Administración

El panel de administración (`/admin`) permite gestionar las reservas del estudio:

- **Login:** formulario de inicio de sesión con validación de credenciales.
- **KPIs:** tarjetas con indicadores de reservas activas, ingresos registrados y cobro pendiente.
- **Tabla de reservas:** lista completa con cliente, servicio, fecha (formato dd/mm/yyyy), horario, contacto, total, abonado y estado.
- **Botón Cobrar:** modal para registrar pagos; actualiza el estado automáticamente (pendiente → señado → completado).
- **Botón Eliminar:** elimina definitivamente la reserva con confirmación.
- **Añadir Turno Manual:** formulario para registrar reservas de clientes que se comunican por teléfono o WhatsApp.

### 6.3 Despliegue

- **Frontend:** Vercel — https://tpf-dw-edsel-irupe.vercel.app/
- **Backend:** Render.com — https://edsellrupe-api.onrender.com
- **Base de datos:** Neon.tech (PostgreSQL gratuito)

El frontend se conecta al backend mediante la variable de entorno `VITE_API_URL`, con fallback a la URL de producción de Render. Se configuraron rewrites en `vercel.json` para soportar el enrutamiento SPA (incluyendo la ruta `/admin`).

---

## 7. Bibliografía

### 7.1 Referencias Técnicas

American Psychological Association. (2020). *Publication Manual of the American Psychological Association* (7.ª ed.). https://doi.org/10.1037/0000165-000

Google LLC. (s.f.). *Google Rich Results Test*. Recuperado el 28 de junio de 2026, de https://search.google.com/test/rich-results

Google LLC. (s.f.). *Lighthouse | Tools for Web Developers*. Recuperado el 28 de junio de 2026, de https://developer.chrome.com/docs/lighthouse/

Meta Platforms, Inc. (s.f.). *Open Graph Protocol*. Recuperado el 28 de junio de 2026, de https://ogp.me/

Mozilla Corporation. (s.f.). *HTTP Security Headers*. Recuperado el 28 de junio de 2026, de https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers

Neon Inc. (s.f.). *Serverless PostgreSQL — Neon Documentation*. Recuperado el 28 de junio de 2026, de https://neon.tech/docs

Node.js Foundation. (s.f.). *Express.js — API Reference*. Recuperado el 28 de junio de 2026, de https://expressjs.com/en/api.html

OpenAI. (s.f.). *OpenCode — AI CLI Tool*. Recuperado el 28 de junio de 2026, de https://opencode.ai

Schema.org. (s.f.). *LocalBusiness — Schema.org Type*. Recuperado el 28 de junio de 2026, de https://schema.org/LocalBusiness

Tailwind Labs Inc. (s.f.). *Tailwind CSS v4 Documentation*. Recuperado el 28 de junio de 2026, de https://tailwindcss.com/docs

Vercel Inc. (s.f.). *Vercel Documentation — SPA Routing*. Recuperado el 28 de junio de 2026, de https://vercel.com/docs

---

## 8. Anexos

### 8.1 Capturas del Sitio en Producción

*[INSERTAR CAPTURA: Home — Hero y Filosofía]*

*[INSERTAR CAPTURA: Servicios — Grilla de tarjetas]*

*[INSERTAR CAPTURA: Reservar — Formulario multi-paso]*

*[INSERTAR CAPTURA: Admin — Panel de administración]*

*[INSERTAR CAPTURA: Footer — Contacto y redes sociales]*

### 8.2 Captura del Repositorio en GitHub

*[INSERTAR CAPTURA: GitHub — Árbol de commits]*

### 8.3 Estructura de la Carpeta /docs

La carpeta de documentación contiene los siguientes archivos:

- `01 - planificación.md` — planificación general del proyecto
- `02 - arquitectura - info.md` — información de la arquitectura
- `03 - wireframes.md` — descripción de wireframes
- `03 - wireframes - anexo/` — imágenes de wireframes
- `04 - stack tecnológico.md` — detalle del stack tecnológico
- `05 - escalabilidad.md` — consideraciones de escalabilidad
- `06 - changelog.md` — registro de commits del proyecto
- `07-ia-aplicada.md` — bitácora de uso de inteligencia artificial
- `08 - word.md` — contenido del presente documento Word

*[INSERTAR CAPTURA: estructura completa de /docs]*

### 8.4 Resultados Lighthouse

*[INSERTAR CAPTURA: métricas Lighthouse — métrica 1]*

*[INSERTAR CAPTURA: métricas Lighthouse — métrica 2]*

### 8.5 JSON-LD Validado

*[INSERTAR CAPTURA: JSON-LD validado sin errores en Google Rich Results Test]*
