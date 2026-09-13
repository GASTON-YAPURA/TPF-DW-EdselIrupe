# 🔧 08 - Mejoras Aplicadas al Proyecto

> Guía rápida de las mejoras de Edsellrupe, ordenadas por **BACKEND**, **FRONTEND** y
> **BASE DE DATOS**. Cada ítem explica en pocas palabras qué hace y por qué importa,
> sin entrar en código (para estudiar y explicar en la mesa).

---

# 🖥️ MEJORAS - BACKEND

## Resumen

| # | Mejora | Por qué importa |
| :--- | :--- | :--- |
| 1 | Login con token JWT | El acceso al panel es seguro y con vencimiento |
| 2 | Sin credenciales por defecto | No hay usuario público ni contraseña fácil |
| 3 | Límite de intentos de login | Frena ataques de fuerza bruta |
| 4 | Precio calculado en el servidor | Nadie puede cambiar el total desde el navegador |
| 5 | Validación en el servidor | No se reservan fechas pasadas ni datos inválidos |
| 6 | CORS estricto | Solo nuestra web puede llamar a la API |
| 7 | Cabeceras de seguridad (helmet) | Endurece las respuestas; permite ver las fotos subidas |
| 8 | CRUD de servicios protegido | El panel crea/edita/borra servicios con el token |
| 9 | Subida de imágenes validada | Solo JPG/PNG/WebP de hasta 6 MB |
| 10 | Body JSON amplio (15 MB) | Soporta las fotos sin librerías extra |
| 11 | Control de sobrepago | No se puede cobrar más que el saldo |

Últimos ajustes: `helmet` ahora permite que las fotos del API se vean desde la web
(CORP `cross-origin`) y la CSP agregó `manifest-src`.

Archivos tocados: `server/index.js`, `server/package.json`, `server/.env.example`, `render.yaml`.

## Mejoras

1. **Login seguro con token (JWT)**
   - Qué hace: al entrar al panel se emite un token que vence en 24 h; cada acción lo valida.
   - Por qué importa: sin token no se puede operar el panel, aunque alguien encuentre la ruta.

2. **Sin credenciales por defecto (variables obligatorias)**
   - Qué hace: si faltan `ADMIN_USER`, `ADMIN_PASS` o `JWT_SECRET`, el servidor no arranca.
   - Por qué importa: se elimina el clásico `admin/admin123` y el token deja de reiniciarse solo.

3. **Límite de intentos de login**
   - Qué hace: por IP hay 5 intentos cada 15 minutos; después responde 429.
   - Por qué importa: imposibilita probar contraseñas de a miles (fuerza bruta).

4. **El precio total se calcula solo en el servidor**
   - Qué hace: el total de la reserva se busca en la base, el navegador ya no lo envía.
   - Por qué importa: nadie puede abrir DevTools y poner `total: 0`.

5. **Validación de campos y fechas en el servidor**
   - Qué hace: rechaza fechas pasadas, emails/teléfonos mal escritos y textos demasiado largos.
   - Por qué importa: la regla vale aunque salteen el formulario (la del cliente es solo estética).

6. **CORS estricto**
   - Qué hace: la API acepta pedidos solo desde localhost y el dominio de producción.
   - Por qué importa: ningún otro sitio puede consumir (ni reutilizar) nuestra API.

7. **Cabeceras de seguridad con helmet**
   - Qué hace: agrega las cabeceras estándar (protege de clickjacking, sniffing, fuerza HTTPS).
   - Por qué importa: es un endurecimiento que se logra con una sola línea. Además se ajustó la
     opción *Cross-Origin-Resource-Policy* a `cross-origin` para que las imágenes subidas desde
     el panel se puedan ver en la web (sin ese ajuste el navegador las bloqueaba).

8. **CRUD de servicios protegido por token**
   - Qué hace: crear, editar y eliminar servicios pasa por el token del login y por validación.
   - Por qué importa: el catálogo se administra desde el panel sin tocar código, y solo el dueño.

9. **Subida de imágenes validada**
   - Qué hace: acepta JPG, PNG o WebP hasta 6 MB; valida en el cliente y otra vez en el servidor.
   - Por qué importa: la regla de seguridad vive en el servidor (el cliente es solo comodidad).

10. **Imágenes transportadas por JSON (body de 15 MB)**
    - Qué hace: el límite del body subió a 15 MB para mandar fotos en base64.
    - Por qué importa: sin librerías extra (multer/busboy), suficiente para galerías de estudio.

11. **Control de sobrepago en los cobros**
    - Qué hace: no permite registrar un pago mayor al saldo pendiente.
    - Por qué importa: mantiene consistente la "caja" del estudio.

## Frases para la mesa (BACKEND)

> 🎤 "El acceso al panel usa JWT: un token firmado que vence en 24 h. Además hay 5 intentos de
> login cada 15 minutos, no hay credenciales por defecto y el precio nunca viaja desde el
> navegador: lo calcula el servidor contra la base de datos."

> 🎤 "Todo lo que entra al servidor se valida de nuevo: fechas, campos, tipos de imagen y tamaño.
> Las reglas del cliente son solo para dar aviso rápido; las que importan están en el servidor."

---

# 🗄️ MEJORAS - BASE DE DATOS

## Resumen

| # | Mejora | Por qué importa |
| :--- | :--- | :--- |
| 1 | PostgreSQL en Render | Los datos quedan guardados en la nube, no en la PC |
| 2 | Fotos de galería en la base (`BYTEA`) | Las fotos subidas "viven" en la base |
| 3 | Foto propia por servicio | Cada servicio puede tener su imagen |
| 4 | Esquema que se crea solo | Sin migraciones manuales |
| 5 | Índices | Consultas rápidas y sin duplicados |

Archivos tocados: `server/index.js` (creación de tablas), `render.yaml`, `server/.env.example`.

## Mejoras

1. **PostgreSQL en la nube (Render)**
   - Qué hace: la base corre en Render (plan free) y se conecta por `DATABASE_URL`.
   - Por qué importa: las reservas, servicios y fotos subidas persisten en producción.

2. **Fotos de galería guardadas en la base**
   - Qué hace: las fotos subidas desde el panel se guardan como binario (`BYTEA`) con su tipo.
   - Por qué importa: la base es la única fuente de verdad y se sirven tal cual con su formato.

3. **Foto propia por servicio**
   - Qué hace: cada servicio puede tener su imagen y su formato en la base.
   - Por qué importa: el panel puede poner/cambiar/quitar la foto de cada servicio.

4. **El esquema se crea solo al arrancar**
   - Qué hace: al iniciar, el servidor crea las tablas y columnas que falten (idempotente) y
     siembra el catálogo de los 5 servicios.
   - Por qué importa: un deploy sobre una base nueva o existente funciona sin pasos manuales.

5. **Índices**
   - Qué hace: índice por colección en la galería y título único en servicios.
   - Por qué importa: consultas rápidas y sin servicios duplicados.

## Frases para la mesa (BASE DE DATOS)

> 🎤 "Las fotos de galería las guardo como binario dentro de PostgreSQL: no dependo de servicios
> externos (Cloudinary/S3) y el TP pide datos en base de datos. El listado de fotos no trae los
> binarios: cada foto se pide por su propia URL."

> 🎤 "El esquema se autogestiona: al arrancar crea lo que falta y siembra el catálogo inicial.
> No hace falta correr migraciones a mano en los deploys."

---

# 🎨 MEJORAS - FRONTEND

## Resumen

| Área | Mejora |
| :--- | :--- |
| SEO | Canonical por página, datos estructurados, `noindex`, metas y favicon completos |
| UX | WhatsApp flotante, página de galería, visor tipo Pixieset, tipografía móvil, animaciones, testimonios, FAQ, mapa, menú hamburguesa |
| Panel | Pestañas Reservas/Servicios/Galería, mostrar/ocultar contraseña, ruta oculta, servicios sin foto y fallback offline |

Archivos tocados: componentes `SEO`, `Header`, `Footer`, `GaleriaSesiones`, `WhatsAppButton`,
`Testimonios`, `Faq`, `Reveal`; páginas `Home`, `Galeria`, `Servicios`, `Reservar`, `Admin`;
`index.html`, `public/{manifest, sw, robots.txt, sitemap.xml}`, `vercel.json`, `src/assets/galeria/`.

## SEO

1. **Canonical y datos estructurados**
   - Qué hace: cada página declara su URL canónica (tomada de la ruta) y se emitieron datos
     estructurados tipo `Photographer` y `FAQPage` con datos reales del estudio.
   - Por qué importa: Google no mezcla páginas duplicadas y puede mostrar el sitio como "rich result".

2. **Panel y 404 fuera de Google + metas completas**
   - Qué hace: el panel y el 404 llevan `noindex`; hay favicon, `theme-color`, manifest,
     Twitter Cards y `og:locale`. `robots.txt` excluye la ruta del panel y `sitemap.xml` tiene `lastmod`.
   - Por qué importa: lo privado no se indexa y el resto se ve bien al compartir.

## UX / Visual

3. **Botón flotante de WhatsApp**
   - Qué hace: botón fijo abajo a la izquierda que abre WhatsApp con mensaje precargado.
   - Por qué importa: es el canal que más usa el público local; un clic y ya escriben.

4. **Galería en página propia + visor estilo Pixieset**
   - Qué hace: la galería pasó a `/galeria` (enlace en el menú) y al abrir una colección se entra
     directo a la **foto en grande** con tira de miniaturas, flechas y teclado (←/→/Escape).
   - Por qué importa: replica la experiencia de las galerías reales del estudio (pixieset.com) y
     funciona con clic y teclado.

5. **Tipografía más compacta en móvil**
   - Qué hace: en pantallas chicas (≤767px) la letra base baja a 14 px.
   - Por qué importa: el sitio se ve proporcionado en el celular sin tocar cada componente.

6. **Animaciones suaves al scroll**
   - Qué hace: al entrar en pantalla, secciones y tarjetas aparecen con un leve movimiento.
   - Por qué importa: da un toque profesional; respeta `prefers-reduced-motion` (accesible).

7. **Testimonios y FAQ**
   - Qué hace: sección con 3 reseñas con estrellas y acordeón de preguntas frecuentes.
   - Por qué importa: genera confianza y las preguntas también aparecen como datos estructurados.

8. **Mapa de ubicación (OpenStreetMap)**
   - Qué hace: el footer embebe un mapa de OpenStreetMap centrado en el estudio.
   - Por qué importa: ubica al negocio y, a diferencia de Google Maps, no aparece "bloqueado".

9. **Menú hamburguesa animado**
   - Qué hace: las 3 rayitas del menú celular se transforman en una X y el menú baja con animación.
   - Por qué importa: mejora la sensación de calidad del sitio sin librerías.

## Panel

10. **Panel en pestañas (Reservas · Servicios · Galería)**
    - Qué hace: administra reservas (KPIs, cobros, borrar, alta manual), servicios con su foto y
      galería (subir/borrar fotos). Con sesión iniciada aparece el enlace "👤 Panel Administrativo".
    - Por qué importa: el dueño gestiona todo sin tocar código ("mini-CMS").

11. **Contraseña visible y ruta del panel oculta**
    - Qué hace: el login tiene un "ojito" para mostrar/ocultar la contraseña, y la ruta del panel
      ya no es `/admin` sino una no adivinable (elegida por el dueño y excluida de robots.txt).
    - Por qué importa: evita errores al tipear la clave y agrega una capa de discreción.

12. **Servicios sin foto y datos con respaldo**
    - Qué hace: un servicio nuevo sin imagen ya no muestra una foto ajena (queda sin imagen hasta
      subir la suya) y toda la web usa la API con un respaldo con datos locales.
    - Por qué importa: nada rompe si la API tarda en responder y el panel refleja los cambios al toque.

## Frases para la mesa (FRONTEND)

> 🎤 "La galería replica Pixieset, el sitio de entregas de fotos del estudio: se entra a la foto en
> grande con miniaturas, teclas ←/→/Escape y acumulada con las fotos que se suben desde el panel."

> 🎤 "El panel es un mini-CMS en pestañas (reservas, servicios y galería) protegido por el login.
> Cada acción usa el token y el servidor valida todo de nuevo."

> 🎤 "El frontend consume la API pero no depende de ella: hay un respaldo con los datos por
> defecto, así la demo funciona siempre y además es instalable como PWA."

---

## 📦 Anexo: Deploy de la API en Render (resumen)

1. Crear el Web Service con **Root Directory** `server`, build `npm install`, start `npm start`.
2. Crear la base PostgreSQL (mismo comando de Render) y copiar la *Internal Connection String*.
3. En **Environment** cargar: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`.
4. Deploy → el backend crea las tablas solo al arrancar.
5. Alternativa reproducible: blueprint `render.yaml` (la base y los valores secretos se completan
   en el Dashboard).
6. Ojo: al cambiar `ADMIN_PASS` después, los tokens viejos siguen válidos hasta 24 h.

## ❓ Preguntas que te pueden hacer

- **¿Por qué las fotos se guardan en la base y no en Cloudinary/S3?** Porque el TP pide base de
  datos y así todo queda en un solo lugar. Suficiente para las fotos del panel.
- **¿Por qué las 60 fotos de la galería NO están en la base?** Es una decisión de diseño: la
  galería base vive en el código para que se muestre siempre aunque la API tarde. Se probó
  migrarlas (E12) y se revirtió; en la base quedan solo las fotos extra que se suben desde el panel.
- **¿El service worker cachea la API?** No: solo peticiones del mismo sitio, para no interferir
  con CORS ni con datos sensibles.
- **¿Por qué el precio no viaja desde el navegador?** Porque cualquiera podría cambiarlo con
  DevTools; lo calcula el servidor desde la tabla de servicios.