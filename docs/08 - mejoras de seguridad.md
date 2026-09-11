# 🔧 08 - Mejoras Aplicadas al Proyecto

> Documento guía de las mejoras implementadas sobre Edsellrupe.
> Está dividido en **MEJORAS EN EL BACKEND** y **MEJORAS EN EL FRONTEND**.
> Cada mejora incluye: **problemática**, **solución aplicada**, **archivos tocados** y un
> **argumento de 2 minutos** para explicarla en la mesa de examen final.

---

# 🔒 MEJORAS EN EL BACKEND

## 📋 Resumen

| # | Mejora | Impacto |
| :--- | :--- | :--- |
| 1 | Autenticación JWT con librería estándar (`jsonwebtoken`) | Elimina el token "hecho a mano" |
| 2 | Variables de entorno obligatorias (sin credenciales por defecto) | Elimina `admin` / `admin123` |
| 3 | Límite de intentos de login (`express-rate-limit`) | Previene fuerza bruta |
| 4 | El `total` de la reserva se calcula 100% en el backend | Evita manipular precios |
| 5 | Validación de fecha, horario y campos en el servidor | Evita fechas pasadas y datos inválidos |
| 6 | CORS estricto (lista blanca exacta) | Restringe el origen de las peticiones |
| 7 | `helmet` en la API | Endurece las cabeceras HTTP de la API |
| 8 | Catálogo de servicios centralizado en la base de datos | Una sola fuente de verdad para precios |
| 9 | Control de sobrepago en los cobros | El cliente no puede pagar más del saldo |

Archivos tocados:
- `server/index.js`
- `server/package.json` (nuevas dependencias)
- `server/.env.example` (nuevo)
- `eslint.config.js` (soporte de globals de Node para el server)

---

## 1️⃣ Autenticación JWT con librería estándar

### Problemática
El token del panel admin se generaba a mano con `crypto`:
```js
// ANTES
const data = JSON.stringify({ username, exp: Date.now() + 86400000 })
const hash = crypto.createHmac('sha256', SECRETO).update(data).digest('hex')
return Buffer.from(data + '.' + hash).toString('base64')
```
- Firmaba, expiraba y codificaba el token **a mano** (propenso a errores).
- La comparación del hash no era resistente a *timing attacks*.

### Solución
```js
import jwt from 'jsonwebtoken'

function generarToken(username) {
  return jwt.sign({ username }, SECRETO, { expiresIn: '1d' }) // expira en 24hs
}

function verificarToken(token) {
  try { return jwt.verify(token, SECRETO) } catch { return null }
}
```
`jwt.verify` valida firma **y** expiración de forma estándar. El `authMiddleware` sigue igual.

> 🎤 **Argumento para la mesa:** "El acceso admin usa JWT generado y verificado con la librería `jsonwebtoken`. Un JWT es un token autónomo (usuario + expiración) firmado con un secreto. Antes se firmaba a mano con HMAC sobre Base64, lo que era frágil. Con la librería, la validación de firma y vencimiento es estándar y auditada."

---

## 2️⃣ Variables de entorno obligatorias

### Problemática
Si no existían `ADMIN_USER` / `ADMIN_PASS` / `JWT_SECRET`, el servidor usaba `admin` / `admin123` por defecto, o un secreto aleatorio que **invalidaba las sesiones en cada reinicio**:
```js
// ANTES
const SECRETO = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123'
```

### Solución
```js
const SECRETO = process.env.JWT_SECRET
const ADMIN_USER = process.env.ADMIN_USER
const ADMIN_PASS = process.env.ADMIN_PASS

if (!SECRETO || !ADMIN_USER || !ADMIN_PASS) {
  console.error('Faltan variables de entorno obligatorias...')
  process.exit(1) // no arranca
}
```
Se agregó `server/.env.example` como plantilla.

> 🎤 **Argumento para la mesa:** "Quitamos todo valor por defecto: si el `.env` no define `ADMIN_USER`, `ADMIN_PASS` y `JWT_SECRET`, el servidor se niega a iniciar. Así no quedan credenciales públicas y el secreto del token es estable entre reinicios."

---

## 3️⃣ Límite de intentos de login (rate limiting)

### Problemática
El login aceptaba intentos infinitos → fuerza bruta sin freno.

### Solución
```js
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // ventana de 15 minutos
  max: 5,                     // máximo 5 intentos
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intentalo en 15 minutos.' },
})

app.post('/api/auth/login', loginLimiter, (req, res) => { ... })
```

> 🎤 **Argumento para la mesa:** "El login está protegido por rate limiting: por IP solo hay 5 intentos cada 15 minutos. Pasado ese límite, el servidor responde 429 y bloquea. Así se mitiga el ataque de fuerza bruta sobre las credenciales del administrador."

---

## 4️⃣ El precio total se calcula solo en el backend

### Problemática
El formulario enviaba el `total` calculado con JS del cliente:
```js
// ANTES (frontend)
body: JSON.stringify({ ...form, total: obtenerPrecioNumerico(form.servicio) })
```
Cualquiera podía abrir DevTools y cambiar `total: 0`.

### Solución
- El frontend **ya no envía** `total`.
- El backend lo busca en la tabla `servicios`:
```js
async function totalDeServicio(titulo) {
  const result = await pool.query(
    'SELECT precio FROM servicios WHERE LOWER(titulo) = LOWER($1)', [titulo]
  )
  if (result.rows.length === 0) return null
  return precioNumerico(result.rows[0].precio) // "$25.000" -> 25000
}
```
- Si el servicio no existe → `400`.
- Al arrancar, el servidor **siembra el catálogo** con los 5 servicios (`INSERT ... ON CONFLICT (titulo) DO NOTHING`), con un índice único sobre `titulo`.

> 🎤 **Argumento para la mesa:** "El precio nunca viaja desde el cliente: el servidor lo toma de la tabla `servicios`. Esto impide manipular el `total`. Además centralizamos el catálogo en la base de datos: una sola fuente de verdad."

---

## 5️⃣ Validación de fecha, horario y campos en el servidor

### Problemática
Se podían reservar fechas pasadas y no se validaban formatos ni longitudes en el servidor.

### Solución
```js
function validarCampos(nombre, email, telefono) {
  if (!nombre || nombre.trim().length === 0 || nombre.length > 150) return 'El nombre es obligatorio (máx. 150)'
  if (!email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido'
  if (!telefono || telefono.length > 50 || !/^[\d\s+()-]{7,20}$/.test(telefono)) return 'Teléfono inválido'
  return null
}

function validarFecha(fecha) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  const f = new Date(`${fecha}T00:00:00`)
  if (isNaN(f.getTime())) return 'Fecha inválida'
  if (f < hoy) return 'La fecha no puede ser anterior a hoy'
  return null
}
```
Se aplican a `POST /api/reservas` y a `POST /api/reservas/manual`.

> 🎤 **Argumento para la mesa:** "La validación se hace en el cliente (usabilidad) y en el servidor (seguridad). El servidor rechaza fechas pasadas, emails/teléfonos inválidos y longitudes excesivas. La regla 'no se reserva en el pasado' queda garantizada aunque alguien saltee el formulario."

---

## 6️⃣ CORS estricto

### Problemática
Antes se aceptaba **cualquier subdominio de Vercel** (cualquiera puede crearlos gratis):
```js
// ANTES
origin.endsWith('.vercel.app')
```

### Solución
```js
app.use(cors({
  origin: ['http://localhost:5173', 'https://tpf-dw-edsel-irupe.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))
```

> 🎤 **Argumento para la mesa:** "CORS define qué dominios pueden consumir la API desde el navegador. Antes aceptábamos cualquier subdominio `.vercel.app`. Ahora solo el localhost de desarrollo y el dominio de producción."

---

## 7️⃣ Cabeceras de seguridad con helmet

### Problemática
La API no enviaba cabeceras de seguridad.

### Solución
```js
app.use(helmet())
```
`helmet` agrega `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, CSP por defecto, etc.

> 🎤 **Argumento para la mesa:** "El backend usa `helmet`, que agrega de una vez las cabeceras de seguridad estándar: evita el clickjacking (X-Frame-Options), el MIME sniffing y fuerza HTTPS (HSTS)."

---

## 8️⃣ 9️⃣ Extras de backend

- **8. Catálogo en BD:** los 5 servicios viven en la tabla `servicios` (seed automático + índice único) y se sirven por `GET /api/servicios`. Los precios se actualizan en un solo lugar.
- **9. Control de sobrepago:** `PUT /api/reservas/:id/cobro` rechaza montos `<= 0` y valida que `monto <= (total - abonado)`. Antes era posible abonar más que el total.

> 🎤 **Argumento para la mesa (sobrepago):** "El endpoint de cobro ahora valida el saldo pendiente: no se puede registrar un pago mayor a lo que falta pagar. Esto mantiene la consistencia de la 'caja' del estudio."

---

# 🎨 MEJORAS EN EL FRONTEND

## 📋 Resumen

| Área | Mejora | Impacto |
| :--- | :--- | :--- |
| SEO | Canonical dinámico por página | Corrige canonical repetidos |
| SEO | JSON-LD real + tipo `Photographer` + FAQPage | Mejores rich results |
| SEO | `noindex` en Admin y 404 | No indexa páginas privadas |
| SEO | Favicon, `theme-color`, Twitter Cards, `og:locale`, robots.txt, sitemap `<lastmod>` | Meta completo |
| UX | Botón flotante de WhatsApp | Canal de contacto directo |
| UX | Galería con lightbox | Muestra el trabajo |
| UX | Testimonios de clientes | Confianza social |
| UX | Sección FAQ (visual + JSON-LD) | Resuelve dudas + SEO |
| UX | Mapa de ubicación embebido | Contexto local |
| UX | Animaciones suaves al scroll (`Reveal`) | Toque profesional (accesible) |
| PWA | Manifest + Service Worker + iconos | Instalable y offline (meta del TP) |

Archivos tocados/creados:
- `src/components/SEO.jsx`, `src/components/{WhatsAppButton,Galeria,Testimonios,Faq,Reveal}.jsx`, `src/components/faqData.js`
- `src/pages/Home.jsx`, `src/pages/Servicios.jsx`, `src/pages/Admin.jsx`, `src/pages/NotFound.jsx`
- `src/App.jsx`, `src/main.jsx`, `src/components/Footer.jsx`
- `index.html`, `public/manifest.webmanifest`, `public/sw.js`, `public/robots.txt`, `public/sitemap.xml`, `vercel.json`

---

## 🔍 SEO

### 1. Canonical dinámico por página (bug corregido)

**Problemática:** `SEO.jsx` hacía `url || SITIO` y ninguna página pasaba `url`. Resultado: en `/servicios`, `/reservar` y `/admin` el `canonical` apuntaba a la **raíz** del sitio → Google podía tratarlas como duplicadas.

**Solución:** el componente deriva el canonical de la ruta actual con `useLocation()`:
```jsx
import { useLocation } from 'react-router-dom'
const location = useLocation()
const canonical = url || `${SITIO}${location.pathname}`
```

> 🎤 **Argumento para la mesa:** "El canonical indica a Google la URL canónica de cada página. Antes todas apuntaban a la raíz porque el componente usaba una URL por defecto. Ahora se calcula desde la ruta con `useLocation`: cada página declara su propia URL canónica."

### 2. JSON-LD real + tipo `Photographer` + FAQPage

**Problemática:** la API del LocalBusiness tenía teléfono y email **ficticios** (`+54 9 1234...`, `info@edsellrupe.com`) que no coincidían con el footer, y el tipo `LocalBusiness` es menos específico.

**Solución:**
- Tipo **`Photographer`** (subtipo de LocalBusiness, más preciso para un estudio fotográfico).
- Datos reales: `+54 3837 430319` e `irupevilla57@gmail.com`, y redes sociales reales.
- Nuevo bloque **`FAQPage`** construido a partir de las mismas preguntas del componente FAQ (una sola fuente de verdad). `SEO.jsx` ahora acepta un array de JSON-LD.

```jsx
const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: preguntasFaq.map((faq) => ({ '@type': 'Question', name: faq.pregunta, ... })),
}
```

> 🎤 **Argumento para la mesa:** "Los datos estructurados deben ser reales y consistentes con el sitio, si no Google los descarta (Rich Results). Usamos el tipo `Photographer` por ser más específico que `LocalBusiness`, y agregamos un `FAQPage` generado desde la misma lista de preguntas que se muestran en pantalla."

### 3. `noindex` en Admin y 404

```jsx
<SEO title="Panel Admin" noindex />
```
`SEO.jsx` acepta la prop `noindex` para emitir `<meta name="robots" content="noindex, nofollow">`. El panel admin y la página 404 no deben aparecer en los resultados de búsqueda.

### 4. Meta tags completos + favicon

En `index.html`:
```html
<meta name="theme-color" content="#373435" />
<link rel="icon" type="image/png" href="/icono.png" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.webmanifest" />
```
En `SEO.jsx` se agregaron: **Twitter Cards** (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`), `og:locale` (`es_AR`) y dimensiones `og:image:width/height`.

### 5. robots.txt y sitemap

- `robots.txt`: ahora con `Disallow: /admin`.
- `sitemap.xml`: se sumó `<lastmod>` (fecha de última modificación).

---

## 🖥️ UX / Visual

### 1. Botón flotante de WhatsApp
Componente `WhatsAppButton.jsx` montado en `App.jsx` (visible en todo el sitio, fijo abajo a la izquierda). Abre `https://wa.me/543837430319?text=...` con un mensaje precargado. Usa el verde oficial de WhatsApp `#25D366` (es el color de la marca del canal, no de la paleta) y un logo SVG inline.

> 🎤 **Argumento para la mesa:** "Agregamos un botón flotante de WhatsApp con mensaje precargado. Es el canal de contacto que más usa el público local y reduce la fricción para consultar: un clic y ya están escribiendo con el mensaje listo."

### 2. Galería con lightbox
Componente `Galeria.jsx`: grilla responsive con las imágenes reales (2 columnas en mobile, 3 en desktop) y **lightbox** al hacer clic: imagen grande, navegación con flechas prev/next, cierre con `X` o tecla `Escape`, navegación de teclado (`←`/`→`) y bloqueo del scroll de fondo. Las imágenes usan `loading="lazy"` y un `hover` con zoom.

> 🎤 **Argumento para la mesa:** "La galería muestra el trabajo del estudio en grilla y en un visor (lightbox) accesible: se controla con clic y teclado, respeta la semántica y usa lazy loading para no penalizar el rendimiento."

### 3. Testimonios
Componente `Testimonios.jsx`: 3 reseñas con estrellas (iconos `Star` de lucide) y nombre del cliente. Son ejemplos de demostración, listos para reemplazar por opiniones reales.

### 4. FAQ (visual + rich result)
Componente `Faq.jsx` (acordeón con `ChevronDown` rotando) construido desde `faqData.js`. Las mismas preguntas alimentan el JSON-LD `FAQPage` → aparece en Google como *Preguntas frecuentes*.

### 5. Mapa de ubicación
Se agregó un `iframe` de Google Maps (sin API key, con `output=embed`) en el `Footer`, con `loading="lazy"` y `referrerPolicy`. Ubicación: Copiapó, Eva Perón, Tinogasta.

### 6. Animaciones al scroll (`Reveal`)
Componente `Reveal.jsx`: usa `IntersectionObserver` para animar (fade + slide up) las secciones cuando entran en pantalla.
- Aplicado a: Filosofía, Sesiones más pedidas, Galería, Testimonios, FAQ (Home) y a las cards de Servicios (con `delay` escalonado).
- **Accesible:** si el usuario tiene `prefers-reduced-motion: reduce`, la animación se desactiva y el contenido se muestra directo.

> 🎤 **Argumento para la mesa:** "Las animaciones de entrada las hago con `IntersectionObserver` en lugar de librerías: detecto cuándo un elemento entra al viewport y aplico una transición de opacidad y desplazamiento con CSS. Además respeto la preferencia del usuario: con `prefers-reduced-motion` el contenido aparece sin animación."

---

## 📱 PWA (Progressive Web App)

El README del TP declaraba los objetivos *"aplicar tecnologías SPA y PWA"*, pero no había PWA. Se completó:

### 1. Manifest (`public/manifest.webmanifest`)
Nombre, `short_name`, `theme_color` (`#373435`), `background_color` (`#F5F1EC`), `display: standalone`, `lang: es-AR` e **iconos 192x192 y 512x512**. Los iconos se generaron a partir del logo: cuadrado con fondo gris de la marca y el logo centrado (archivos en `public/icons/`).

### 2. Service Worker (`public/sw.js`)
- **Precache** al instalar: `/`, `/servicios`, `/reservar`, manifest e iconos.
- Estrategia **network-first con fallback a caché**: sirve siempre lo más fresco posible y, sin conexión, devuelve la copia en caché (para navegaciones, cae a `/`).
- Solo procesa requests **GET y same-origin** (no toca la API externa).
- `skipWaiting()` + `clients.claim()` para que la versión nueva tome control de inmediato.

### 3. Registro (`src/main.jsx`)
```js
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
```
Se registra **solo en producción** (`import.meta.env.PROD`) para no interferir en desarrollo.

### 4. Ajustes extra
- `vercel.json`: la CSP ahora incluye `worker-src 'self'` para permitir el service worker.
- `index.html`: metas específicas de iOS (`apple-mobile-web-app-*`) y `apple-touch-icon`.

> 🎤 **Argumento para la mesa:** "Una PWA es una web que se puede instalar como app y funciona con conexión limitada. Implementamos el manifest (metadatos + iconos en 192 y 512) y un service worker con estrategia network-first: si estoy online baja siempre lo nuevo, y si me quedo sin red sirve lo que ya cacheó. El registro corre solo en producción con `import.meta.env.PROD`."

---

## ✅ Cómo verificarlo

1. **Lint y build del proyecto completo** (pasando en limpio):
   ```bash
   npm run lint
   npm run build
   ```
2. **Build:** revisar que `dist/` contenga `manifest.webmanifest`, `sw.js`, `icons/`, `sitemap.xml` y `robots.txt`.
3. **Deploy:** en HTTPS, abrir DevTools → Application → *Manifest* (debe cargar con iconos válidos) y *Service Workers* (registrado y activo).
4. **SEO:** ir a las rutas `/`, `/servicios` y `/reservar` y verificar el `<link rel="canonical">` de cada una; validar el JSON-LD en el [Rich Results Test](https://search.google.com/test/rich-results)

## 🧪 Preguntas que te pueden hacer

- **¿Por qué network-first y no cache-first?** Como hay contenido dinámico (fechas, disponibilidad), preferimos servir lo reciente desde la red y usar la caché solo si la red falla.
- **¿El service worker cachea la API?** No: solo procesa peticiones same-origin para no interferir con el CORS ni con datos sensibles.
- **¿Por qué canonical propio por página?** Para que Google no considere `/servicios` y `/` como contenido duplicado.
- **¿Los testimonios son reales?** Son de ejemplo; se reemplazan por opiniones reales de clientes.
- **¿Las animaciones afectan el rendimiento?** Usan solo `opacity` y `transform` (compositor) y `IntersectionObserver` (no bloquea el hilo principal).