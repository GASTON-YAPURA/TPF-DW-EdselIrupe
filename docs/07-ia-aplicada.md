# IA Aplicada al Desarrollo — Edsellrupe

## Bitácora de uso de IA

### Instancia 1: Generación de estructura del servidor backend
- **Herramienta usada:** opencode (Claude)
- **Tarea delegada:** Crear el servidor Express con PostgreSQL, incluyendo endpoints GET /api/servicios y POST /api/reservas, con manejo de errores y conexión a base de datos.
- **Prompt enviado:** "Creá un servidor Express con conexión a PostgreSQL que tenga dos endpoints: GET /api/servicios para listar servicios y POST /api/reservas para guardar turnos. Incluí validación de campos obligatorios, CORS y creación automática de tablas."
- **Resultado obtenido:** Código completo del servidor con pool de conexiones, inicialización de tablas, endpoints funcionales y manejo de errores básico.
- **Revisiones realizadas:** Se ajustó el CORS para incluir tanto localhost como la URL de producción de Vercel. Se agregó verificación de campos obligatorios antes de insertar en la base de datos.

### Instancia 2: Implementación de SEO técnico
- **Herramienta usada:** opencode (Claude)
- **Tarea delegada:** Implementar meta tags, Open Graph, JSON-LD Schema.org, robots.txt y sitemap.xml.
- **Prompt enviado:** "Creá un componente SEO.jsx usando react-helmet-async que maneje title, description, Open Graph y JSON-LD. También creá robots.txt y sitemap.xml para el proyecto."
- **Resultado obtenido:** Componente SEO reutilizable con Helmet, estructura JSON-LD para LocalBusiness, y archivos de configuración para motores de búsqueda.
- **Revisiones realizadas:** Se añadió la etiqueta canonical y se ajustaron las URLs para que apunten al dominio de producción en Vercel.

### Instancia 3: Sanitización y validación de formularios
- **Tarea delegada:** Agregar validación del lado del cliente con sanitización XSS y verificación de formatos.
- **Prompt enviado:** "Agregá validación al formulario multi-paso de reserva: sanitizar entrada para prevenir XSS, validar formato de email, teléfono, y mostrar mensajes de error específicos por campo."
- **Resultado obtenido:** Funciones de sanitización, validación de email con regex, validación de teléfono, y mensajes de error visuales en cada campo.
- **Revisiones realizadas:** Se mejoró el regex de teléfono para aceptar formatos argentinos con +54 y espacios. Se agregó estado de carga al botón de envío.

---

## Skills y Tool Calling

### ¿Qué es una Skill?
Una Skill es un módulo de instrucciones especializadas que se le proporciona a un asistente de IA para que pueda realizar tareas específicas de manera más precisa y segura. Funciona como un "manual de instrucciones" que la IA sigue al pie de la letra cuando detecta que la tarea del usuario coincide con la descripción de la Skill. Por ejemplo, si existe una Skill para "Personalizar opencode", la IA solo la activa cuando el usuario está modificando la configuración de opencode, y no cuando trabaja en el código de su proyecto.

### Flujo técnico de 4 pasos
1. **Definición:** Se crea una Skill con un nombre, una descripción del tipo de tarea que cubre, y un conjunto de instrucciones detalladas que la IA debe seguir. Estas se definen en un archivo de configuración (como opencode.json).
2. **Intención:** El usuario envía un mensaje o solicitud al asistente. La IA analiza la intención del usuario y la compara con las descripciones de las Skills disponibles.
3. **Argumento:** Si la intención del usuario coincide con la descripción de una Skill, la IA "carga" esa Skill, inyectando las instrucciones especializadas en su contexto de trabajo actual.
4. **Ejecución:** La IA ejecuta la tarea siguiendo las instrucciones de la Skill, utilizando las herramientas y restricciones específicas que esta define.

### Tres vectores de seguridad principales
1. **Permisos de herramientas:** Las Skills pueden restringir qué herramientas tiene permitido usar la IA (por ejemplo, una Skill de "solo lectura" puede prohibir la modificación de archivos). Esto evita que la IA ejecute acciones destructivas en contextos donde no corresponde.
2. **Sandboxing de archivos:** Las Skills pueden limitar el acceso de la IA a directorios o archivos específicos. Por ejemplo, una Skill para editar la configuración de opencode solo permite modificar archivos dentro de .opencode/ y no el código del proyecto del usuario.
3. **Validación de comandos:** Las Skills pueden definir reglas sobre qué comandos de terminal puede ejecutar la IA, filtrando aquellos que podrían ser peligrosos (como rm -rf, sudo, etc.) y exigiendo confirmación del usuario antes de ejecutarlos.

---

## Reflexión crítica

El uso de herramientas de IA en este proyecto fue una experiencia reveladora que cambió mi forma de encarar el desarrollo web. Lo que más valoro es la velocidad con la que pude pasar de una idea a código funcional. Tareas que antes me hubieran llevado horas investigando documentación, como configurar un servidor Express con PostgreSQL o implementar etiquetas Open Graph para SEO, las resolví en minutos delegándoselas a la IA.

Sin embargo, no todo fue beneficioso automático. La IA me generó trabajo extra en varios aspectos. Por ejemplo, el código del backend venía con configuraciones genéricas de CORS que permitían cualquier origen, lo que es inseguro para producción. Tuve que investigar y ajustar manualmente para restringir los orígenes permitidos. También noté que la IA tendía a usar librerías o funciones que no estaban actualizadas a las versiones que tengo en el proyecto, como cuando generó código para Tailwind v3 con sintaxis que ya cambió en v4. Eso me obligó a leer la documentación actualizada para corregirlo.

Otro aspecto que me hizo pensar fue la validación de formularios. La IA generó una función de sanitización básica que escapaba caracteres HTML, pero no cubría todos los casos de seguridad posibles (como inyección en atributos). Si bien para un proyecto educativo está bien, me hizo entender que la IA no reemplaza el criterio de seguridad de un desarrollador. Hay que revisar siempre el código generado con una mirada crítica.

En definitiva, la IA actuó como un "acelerador de prototipado": me permitió construir la estructura del proyecto mucho más rápido, pero el trabajo fino de adaptación, corrección y seguridad lo tuve que hacer yo. Creo que esa es la forma correcta de usarla: como una herramienta que potencia mi trabajo, no como un reemplazo de mi criterio técnico. Aprendí que programar con IA no es solo saber pedirle cosas, sino también saber revisar, cuestionar y mejorar lo que produce. Eso, lejos de hacer más fácil la programación, la vuelve más responsable y exigente.
