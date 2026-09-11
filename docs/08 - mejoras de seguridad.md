# 🔧 08 - Mejoras Aplicadas al Proyecto

> Documento guía de las mejoras implementadas sobre Edsellrupe.
> Está dividido en **MEJORAS EN EL BACKEND**, **MEJORAS EN EL FRONTEND** y
> **MEJORAS EN LA BASE DE DATOS**.
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
| 10 | CRUD de servicios con endpoints protegidos | El panel puede crear/editar/borrar servicios |
| 11 | Subida de imágenes (servicios y galería) con validación | MIME permitido + tope 6 MB por archivo |
| 12 | Límite de tamaño del body JSON (`15mb`) | Admite uploads por JSON sin agregar dependencias |

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

## 🚀 Deploy de la API en Render (importante)

### Problemática
Al subir el backend **con las variables obligatorias** (`JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`), si Render no las tenía configuradas el servidor moría en el arranque (`process.exit(1)`) → **Deploy failed**.

### Solución (Dashboard de Render)

En **dashboard.render.com → tu Web Service** configurar:

1. **Root Directory** → `server` (para que Render use el `package.json` del backend y no el del frontend).
2. **Build Command** → `npm install`
3. **Start Command** → `npm start` (equivale a `node index.js`)
4. **Environment** → agregar estas 4 variables y guardar:

| Variable | Ejemplo |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://usuario:password@host:5432/edsellrupe` |
| `JWT_SECRET` | clave de 96 caracteres: `ff441c83...` (generada con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `ADMIN_USER` | `admin` (o el usuario que quieras) |
| `ADMIN_PASS` | una contraseña segura |

5. **Deploy** → **Deploy latest commit**.

> ⚠️ **Ojo:** al cambiar `ADMIN_PASS` después, los tokens viejos siguen válidos 1 día (el token firma solo el `username`). Si querés invalidar sesiones, cambiá también `JWT_SECRET`.

### Alternativa reproducible: `render.yaml`

Dejé un **blueprint** en la raíz del repo (`render.yaml`). Crea la API con los 4 valores de arriba, `rootDir: server`, build `npm install`, start `npm start` y `healthCheckPath: /api/servicios`. Las variables secretas quedan `sync: false`, o sea se completan en el Dashboard.

> 🎤 **Argumento para la mesa:** "El 'fail fast' es intencional: el servidor prefiere no arrancar a funcionar con un secreto vacío o credenciales por defecto. La configuración queda documentada en `render.yaml`, lista para reproducir el deploy."

---

## 🔟 1️⃣0️⃣ CRUD de servicios con endpoints protegidos

### Problemática
La web mostraba los servicios **hardcodeados** en el frontend y la API solo permitía leerlos (`GET /api/servicios`). Para cambiar un servicio había que tocar código y volver a deployar.

### Solución
Nuevos endpoints, todos detrás de `authMiddleware` (JWT):
```js
app.post('/api/servicios', authMiddleware, ...)     // crear
app.put('/api/servicios/:id', authMiddleware, ...)  // editar
app.delete('/api/servicios/:id', authMiddleware, ...) // eliminar
```
Con validación de campos (`validarServicio`: título, descripción, duración, precio numérico `$25.000`) y control del índice único `titulo` (duplicado → `400`). `GET /api/servicios` ahora devuelve `tiene_imagen` en lugar de los bytes de imagen.

> 🎤 **Argumento para la mesa:** "El catálogo de servicios ahora se administra desde el panel con el mismo token JWT del login. Crear, editar o eliminar un servicio es una operación autenticada y validada en el servidor, y se refleja de inmediato en la página Servicios y en el formulario de reserva."

---

## 1️⃣1️⃣ Subida de imágenes con validación (servicios y galería)

### Problemática
Las imágenes llegaban estáticas (PNGs locales en `src/assets`) o como base de datos sin control del tamaño/formato.

### Solución
Función compartida de validación de imágenes (base64 en el body JSON):
```js
const MIMES_VALIDOS = new Set(['image/jpeg', 'image/png', 'image/webp'])
const TAMANIO_MAX_IMAGEN = 6 * 1024 * 1024 // 6 MB

function validarImagen(data, mime) {
  if (!MIMES_VALIDOS.has(mime)) return { error: 'Formato no permitido (solo JPG, PNG o WebP)' }
  const base64 = String(data || '').replace(/^data:[^;]+;base64,/, '')
  const bytes = Buffer.byteLength(base64, 'base64')
  if (!base64) return { error: 'La imagen está vacía' }
  if (bytes > TAMANIO_MAX_IMAGEN) return { error: 'La imagen no puede superar los 6 MB' }
  return { base64, bytes }
}
```
- `POST /api/servicios/:id/imagen` → guarda o reemplaza la foto del servicio; `DELETE` la borra.
- `POST /api/galeria` → guarda una foto de galería en `galeria_fotos`.
- `GET .../imagen` públicos: sirven el archivo con su `Content-Type` real y `Cache-Control`.
- El frontend *también* valida antes de enviar (mismo whitelist y tope), pero la **regla de seguridad vive en el servidor**.

> 🎤 **Argumento para la mesa:** "Las imágenes se validan dos veces: en el cliente para dar feedback inmediato y en el servidor para que nadie pueda subir un archivo de otro tipo o de tamaño excesivo. Solo aceptamos JPG, PNG y WebP de hasta 6 MB."

---

## 1️⃣2️⃣ Body JSON con más capacidad (`15mb`)

### Problemática
`express.json()` sin opciones limita el body a ~100 KB → un upload de foto (base64) fallaba con `413 Payload Too Large`.

### Solución
```js
app.use(express.json({ limit: '15mb' }))
```
Alcanza para varias fotos por request sin recurrir a `multer`/`busboy` ni multipart.

> 🎤 **Argumento para la mesa:** "Elegí transportar las imágenes como base64 dentro del JSON para no agregar dependencias al proyecto: el límite del body se subió a 15 MB. Para el volumen de una galería de estudio es suficiente y simplifica el deploy."

---

# 🗄️ MEJORAS EN LA BASE DE DATOS

> La base de datos da soporte a: catálogo de servicios, reservas cobradas y **galería con fotos almacenadas**.

## 📋 Resumen

| # | Mejora | Impacto |
| :--- | :--- | :--- |
| 1 | PostgreSQL en Render (plan free) | Datos persistentes, no solo en local |
| 2 | Tabla `galeria_fotos` con fotos en `BYTEA` | Las imágenes "viven" en la base |
| 3 | Columnas `imagen` y `imagen_mime` en `servicios` | Foto propia por servicio |
| 4 | Creación automática de tablas al arrancar (`inicializarDB`) | Sin migraciones manuales |
| 5 | Índice por colección e índice único de títulos | Consultas rápidas y sin duplicados |

Archivos tocados:
- `server/index.js` (queries, endpoints y `inicializarDB`)
- `render.yaml` (env `DATABASE_URL` obligatoria, `sync: false`)
- `server/.env` (local, gitignored) + `server/.env.example`

## 1️⃣ Crear la base en Render (1 vez)

1. **dashboard.render.com → New → PostgreSQL** (plan free, mismo comando).
2. Copiar el **Internal Connection String** (así se usa dentro de la red de Render).
3. En el Web Service → **Environment** → pegar ese valor en `DATABASE_URL` (+ `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`).
4. **Manual Deploy** → el backend crea las tablas solo al arrancar.

> ⚠️ El archivo `server/.env` es **solo local** (está gitignoreado): Render no lo lee, los valores van en el Dashboard.

## 2️⃣ Tabla `galeria_fotos` (fotos en la base)

```sql
CREATE TABLE IF NOT EXISTS galeria_fotos (
  id SERIAL PRIMARY KEY,
  coleccion VARCHAR(50) NOT NULL,
  nombre_archivo VARCHAR(150),
  mime VARCHAR(50) NOT NULL,
  bytes BYTEA NOT NULL,
  creada_en TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_galeria_coleccion ON galeria_fotos (coleccion);
```
- La foto se guarda **como binario (`BYTEA`)** junto con su `mime` → se puede servir tal cual con el `Content-Type` correcto.
- `GET /api/galeria` devuelve el listado **sin los bytes** (metadata), y `GET /api/galeria/:id/imagen` sirve el binario.

> 🎤 **Argumento para la mesa:** "Guardamos las fotos como `BYTEA` dentro de PostgreSQL: la base es la única fuente de verdad y no dependemos de un servicio externo de archivos. El listado no trae los binarios, se piden por separado con su propia URL de imagen."

## 3️⃣ Foto por servicio (`imagen`, `imagen_mime`)

```sql
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS imagen BYTEA;
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS imagen_mime VARCHAR(50);
```
Si el servicio tiene imagen en la base, el frontend la muestra; si no, usa la PNG local.

## 4️⃣ Auto-creación de esquema

`inicializarDB()` (en `server/index.js`) ejecuta `CREATE TABLE IF NOT EXISTS` y `ALTER ... ADD COLUMN IF NOT EXISTS` al arrancar: **no hay que correr migraciones a mano**. También siembra los 5 servicios del catálogo (`ON CONFLICT DO NOTHING`).

> 🎤 **Argumento para la mesa:** "El esquema se autogestiona: al desplegar por primera vez, el servidor crea las tablas y siembra el catálogo inicial. Las columnas nuevas se agregan de forma idempotente, así un deploy sobre una base existente no rompe nada."

## 🎤 Preguntas que te pueden hacer (base de datos)

- **¿Por qué `BYTEA` y no Cloudinary/S3?** Porque el TP pide datos en base de datos; así todo queda en un solo lugar y sin cuentas extra. Para una galería de ~100 fotos de <6 MB es más que suficiente.
- **¿Y si la foto es de 5 MB devlo de base?** Se recomienda optimizarla antes de subir (el panel muestra el tope de 6 MB por archivo).
- **¿La API sigue viva si la base no responde?** No: es un estado deliberado; los endpoints devuelven `500` y el log lo registra.

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
| UX | Galería por colecciones (estilo Pixieset) | Muestra el trabajo por sesión |
| UX | Testimonios de clientes | Confianza social |
| UX | Sección FAQ (visual + JSON-LD) | Resuelve dudas + SEO |
| UX | Mapa de ubicación embebido | Contexto local |
| UX | Animaciones suaves al scroll (`Reveal`) | Toque profesional (accesible) |
| PWA | Manifest + Service Worker + iconos | Instalable y offline (meta del TP) |
| Panel | Admin con 3 pestañas: Reservas, Servicios y Galería | Gestiona reservas, catálogo y fotos |
| Datos | Servicios y galería desde la API con fallback offline | Refleja los cambios del panel al instante |

Archivos tocados/creados:
- `src/lib/api.js` (base de la API + helpers de imágenes)
- `src/components/SEO.jsx`, `src/components/{WhatsAppButton,GaleriaSesiones,Testimonios,Faq,Reveal}.jsx`, `src/components/galeriaData.js`
- `src/assets/galeria/` (60 fotos reales, 10 por colección, optimizadas a 1024 px)
- `src/pages/Home.jsx`, `src/pages/Servicios.jsx`, `src/pages/Reservar.jsx`, `src/pages/Admin.jsx`, `src/pages/NotFound.jsx`
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

### 2. Galería por colecciones (estilo Pixieset)
Componente `GaleriaSesiones.jsx` (reemplaza a `Galeria.jsx`), inspirado en el sitio de galerías **Pixieset** de la pareja:

- **Grilla de colecciones**: cards con la foto de portada, gradiente oscuro, nombre de la sesión y cantidad de fotos. Grilla 2 columnas (mobile) / 3 (desktop), hover con zoom.
- **Click en una colección → galería a pantalla completa**: overlay oscuro (`z-[60]`, sobre el header) con el título, contador y una grilla scrollable de las fotos de esa sesión.
- **Click en una foto → lightbox**: imagen grande, flechas prev/next, contador de posición, cierre con `X` o `Escape`, navegación por teclado (`←`/`→`), bloqueo del scroll de fondo, `role="dialog"` + `aria-modal` y foco gestionado (el `Escape` cierra primero el visor y luego la colección).

**Datos:** `galeriaData.js` define 6 colecciones (**Bebés, Paisajes, Bodas, Infantiles, Embarazo, Bautismos**) con **10 fotos reales cada una** bajadas del CDN de las galerías Pixieset del estudio e **optimizadas a 1024 px** (redimensionado + JPEG calidad 82) en `src/assets/galeria/<coleccion>/`.

**Y además:** la galería se **fusiona con la base de datos**. Al montar se consulta `GET /api/galeria`; las fotos subidas desde el panel se agregan a su colección (se muestran después de las locales) y las **colecciones nuevas creadas en el panel aparecen como cards nuevas** en la grilla. Si la API no responde, queda la galería local como fallback.

> 📥 **Cómo agregar más fotos:** copiás la imagen en `src/assets/galeria/COLECCION/`, la importás en `galeriaData.js` y la sumás al array `fotos` de esa colección. La grilla, el contador y el lightbox la incorporan automáticamente. (Las fotos **desde el panel** no necesitan código: se suben a la base y ya aparecen.)

> 🎤 **Argumento para la mesa:** "La galería replica la experiencia de un sitio de entregas de fotos (Pixieset): la clienta entra a su tipo de sesión y navega todas sus fotos en pantalla completa. Todo es accesible por clic y teclado, con lazy loading en cada imagen y sin cargar librerías externas: el visor (lightbox) es un componente propio."

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

### 7. Panel Admin en 3 pestañas (Reservas · Servicios · Galería)

El Admin pasa de ser una sola tabla de reservas a un panel con pestañas:

- **Reservas:** KPIs, cobros, borrar y alta manual (todo como estaba).
- **Servicios:** listado con miniatura, **crear, editar y eliminar** servicios con modal y **subir/cambiar la imagen** de cada uno (FileReader → base64 → preview → `POST /api/servicios/:id/imagen`).
- **Galería:** selector de colección (las 6 fijas + las creadas desde el panel + casilla "colección nueva"), subida **múltiple** de fotos con preview y borrado de cada una (thumbnails desde `GET /api/galeria/:id/imagen`).

> 🎤 **Argumento para la mesa:** "El panel quedó como una mini-CMS: el dueño del estudio gestiona sus reservas, los servicios con su foto y la galería de fotos sin tocar código. Cada acción usa el token JWT del login y el servidor valida todo de nuevo."

### 8. Servicios y galería leídos de la API (con fallback offline)

- `Servicios.jsx` y `Reservar.jsx` dejaron de mostrar un array hardcodeado: al montar consultan `GET /api/servicios`. Si el servicio tiene imagen en la base se muestra esa; si no, la PNG local.
- **Fallback:** si la API no responde (por ejemplo en la demo local sin red, o tras el cold start de Render), se usa el array estático → el sitio nunca queda en blanco.

> 🎤 **Argumento para la mesa:** "El frontend consume la API pero no depende de ella para sobrevivir: hay un fallback con los datos por defecto. Así la demo funciona siempre, pero cuando la API está online los cambios del panel se reflejan al instante."

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