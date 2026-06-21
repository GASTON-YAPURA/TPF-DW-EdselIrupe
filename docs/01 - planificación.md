# 📚 FASE DE PLANIFICACIÓN: Roadmap del Proyecto (Enfoque MVP) - RF y RNF.

Para el desarrollo de la solución informática de **Edsellrupe - Fotografía**, se establece una estrategia de desarrollo incremental dividida en tres fases consecutivas. Este enfoque permite poner en producción un Producto Mínimo Viable (MVP) rápidamente para resolver los problemas de comunicación más urgentes, para luego añadir capacidades de gestión financiera y optimización avanzada de escalabilidad.

---


## 📅 ROADMAP DEL PROYECTO (ENFOQUE MVP)

  ### ✔️ Fase 1: Lanzamiento del MVP y Captación de Clientes (Semanas 1 a 4)

* **Objetivo:** Resolver la visibilidad del emprendimiento, centralizar las consultas y permitir la reserva de turnos básica para erradicar la pérdida de mensajes y la falta de disponibilidad pública.

* **Entregables Clave:**
  * Landing page responsive con la identidad visual corporativa (negro, rojo, blanco).

  * Catálogo interactivo de servicios fotográficos (sesiones temáticas, eventos, infantiles).

  * Formulario de contacto centralizado.

  * Sistema básico de reserva de turnos con calendario interactivo en tiempo real.


* **Lista de Tareas (Checklist):**
  - [ ] Maquetar la interfaz SPA con React utilizando la paleta de colores oficial.

  - [ ] Desarrollar el componente de Calendario Interactivo para visualización de días disponibles.

  - [ ] Implementar el formulario de contacto con validaciones nativas en JavaScript.

  - [ ] Desplegar la primera versión funcional en Netlify o Vercel.

---

### ✔️ Fase 2: Módulo de Administración y Gestión Financiera (Semanas 5 a 8)
**Objetivo:** Brindar a Fernanda y Matías las herramientas internas para controlar el negocio, gestionar el estado de las sesiones y transparentar el cobro de señas y saldos.

* **Entregables Clave:**

  * Panel de administración privado (Dashboard) para los dueños.

  * Módulo de gestión financiera (registro de señas, presupuestos enviados y saldos pendientes).

  * Sistema de ABM (Alta, Baja, Modificación) para la disponibilidad horaria del calendario.

  * Motor de notificaciones y recordatorios automáticos por correo electrónico.

* **Lista de Tareas (Checklist):**

  - [ ] Crear las vistas protegidas de administración en la SPA de React.

  - [ ] Desarrollar el módulo de lógica financiera para el cálculo automático de saldos de clientes.

  - [ ] Integrar el servicio de mensajería/mail para el envío automático de recordatorios de sesiones.

  - [ ] Vincular el calendario del frontend con los estados de bloqueo del administrador.

---

### ✔️ Fase 3: Portal del Cliente, Características PWA y Optimización (Semanas 9 a 12).



**Objetivo:** Cerrar el ciclo del servicio permitiendo la entrega digital de los trabajos de forma segura y transformando la plataforma en una PWA instalable y de alto rendimiento.

  ---

  * **Entregables Clave:**

    * Portal del cliente autenticado para el acceso a su historial y estados de cuenta.

    * Galerías privadas de descarga segura de fotografías en alta resolución.

    * Configuración completa de la PWA (Service Workers, manifiesto web e instalación en móviles).
    * Implementación de estrategias de caching y optimización de carga de imágenes (*lazy loading*).

  ---

  * **Lista de Tareas (Checklist):**

    - [ ] Desarrollar el sistema de login y roles para asegurar la privacidad de las fotos por cliente.

    - [ ] Configurar el Service Worker para permitir el funcionamiento de la app con conectividad limitada.

    - [ ] Aplicar compresión adaptativa a las imágenes para optimizar las peticiones por segundo (RPS).

    - [ ] Realizar pruebas de rendimiento finales y auditoría de la PWA.

---

## 📝 REQUERIMIENTOS FUNCIONALES Y NO FUNCIONALES (RF - RNF)

## Especificación de Requerimientos del Sistema - Edsellrupe

El presente documento detalla los Requerimientos Funcionales y No Funcionales para el desarrollo de la solución informática del emprendimiento fotográfico **Edsellrupe**. El sistema se concibe como una aplicación web moderna basada en las tecnologías SPA (Single Page Application) y PWA (Progressive Web App).

---

## 📗 Requerimientos Funcionales (RF)
*Definen las funciones, servicios y acciones específicas que el sistema debe ejecutar para satisfacer las necesidades del negocio y resolver las problemáticas detectadas.*

### Módulo de Público General y Registrados
* **RF-01: Visualización de Catálogo y Servicios:** El sistema debe permitir a cualquier usuario visitante visualizar los distintos tipos de sesiones ofrecidas (eventos, sesiones particulares, temáticas, infantiles, etc.) junto con su descripción.
* **RF-02: Formulario de Contacto Centralizado:** El sistema debe proveer un formulario de contacto en línea para que las consultas de los clientes no se pierdan entre diferentes plataformas de mensajería.
* **RF-03: Registro y Autenticación de Usuarios:** El sistema debe permitir a los clientes registrarse e iniciar sesión de forma segura para centralizar su información en la base de datos.
* **RF-04: Reserva de Turnos Online (Calendario Interactivo):** El sistema debe permitir a los clientes autenticados seleccionar una fecha, horario y tipo de sesión mediante un calendario interactivo, validando la disponibilidad en tiempo real.
* **RF-05: Visualización y Descarga de Fotografías:** El sistema debe ofrecer un espacio privado y seguro donde cada cliente pueda acceder, visualizar y descargar las fotografías finales de su sesión.

* **RF-06: Consulta de Estados y Finanzas:** El sistema debe permitir al cliente visualizar el estado de sus sesiones contratadas, presupuestos enviados, señas abonadas y saldos pendientes.

---

### Módulo de Administración (Para los dueños del Emprendimiento)
* **RF-07: Gestión de Calendario y Disponibilidad:** El sistema debe permitir a los administradores (Fernanda y Matías) configurar, modificar y bloquear los días y rangos horarios disponibles para la reserva de turnos.

* **RF-08: Gestión de Clientes y Sesiones:** El sistema debe permitir el alta, baja, modificación y seguimiento del estado de los clientes y sus respectivas sesiones fotográficas (ej. "Pendiente", "En edición", "Entregado").

* **RF-09: Gestión Financiera de Administración:** El sistema debe permitir a los administradores registrar la recepción de pagos (señas y totales), emitir comprobantes de pago digitales y controlar saldos pendientes asociados a cada servicio.

* **RF-10: Carga y Asignación de Galerías Privadas:** El sistema debe permitir a los fotógrafos subir los archivos de imagen finales y asignarlos exclusivamente a la cuenta del cliente correspondiente.

* **RF-11: Automatización de Recordatorios:** El sistema debe enviar confirmaciones y recordatorios automáticos de las sesiones contratadas (por correo electrónico o notificaciones integradas) para reducir el ausentismo.

---

## 📕 Requerimientos No Funcionales (RNF)
*Especifican los criterios de calidad, restricciones técnicas, rendimiento y propiedades esenciales que el sistema debe cumplir para garantizar una óptima experiencia de usuario.*

* **RNF-01: Arquitectura Single Page Application (SPA):** La interfaz de usuario debe ser desarrollada utilizando la librería **React**, garantizando una navegación fluida y dinámica mediante la actualización de componentes sin recargar por completo la página.
* **RNF-02: Capacidades de Aplicación Web Progresiva (PWA):** El sistema debe cumplir con los estándares de una PWA, permitiendo ser instalado en dispositivos móviles, optimizando el rendimiento y permitiendo el acceso a ciertas funcionalidades básicas bajo conexiones limitadas a Internet.
* **RNF-03: Diseño Adaptable (Responsive Design):** La interfaz gráfica debe diseñarse con HTML5 y CSS3, asegurando que el sistema sea completamente adaptable y accesible desde smartphones, tablets y computadoras.
* **RNF-04: Consistencia de Identidad Visual:** El diseño de la interfaz web debe respetar rigurosamente la paleta de colores oficial de la marca: Negro (`#373435`), Rojo (`#C1121F` y `#5A0B15`), Blanco (`#FEFEFE`), Gris (`#E5E5E5`) y Marfil (`#F5F1EC`), evitando colores no alineados al estilo gráfico.
* **RNF-05: Seguridad y Privacidad en la Nube:** Almacenar la información de los clientes en una base de datos segura, garantizando mediante roles de usuario que las galerías fotográficas privadas solo sean accesibles por el cliente propietario.
* **RNF-06: Optimización de Carga y Rendimiento (Manejo de Imágenes):** Debido a que el sistema procesa archivos fotográficos profesionales de alta calidad, se deben implementar técnicas de optimización (como compresión adaptativa y carga diferida) para que el rendimiento del sitio no disminuya.
* **RNF-07: Validaciones en el Frontend:** Todos los campos de entrada de datos en formularios (contacto, registro, reservas) deben ser validados en el lado del cliente mediante **JavaScript** antes de enviar la información al backend.