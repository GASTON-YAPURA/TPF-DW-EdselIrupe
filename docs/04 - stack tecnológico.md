import os

# ⚙️Stack Tecnológico y Escalabilidad.

Este documento detalla la fundamentación técnica del ecosistema de software seleccionado para **Edsellrupe**, analizando su comportamiento ante el crecimiento de la demanda, la mitigación de fallas y la consistencia de los datos según las directivas de la cátedra.

---

## 🛠️ 1. Definición y Justificación del Stack Tecnológico

El stack seleccionado está compuesto por herramientas sólidas, **100% gratuitas y de código abierto (Open Source)**, garantizando costos cero de licenciamiento y una alta adopción comunitaria.

| Capa | Tecnología Seleccionada | Licencia / Costo | Justificación Técnica |
| :--- | :--- | :--- | :--- |
| **Frontend** | **React.js** | MIT / Gratis | Continuidad del desarrollo iniciado en la Etapa 1. Proporciona una arquitectura basada en componentes reutilizables y un DOM virtual eficiente para actualizaciones rápidas. |
| **Backend** | **Node.js + Express.js** | MIT / Gratis | Entorno de ejecución ligero y modular sobre el motor V8 de Google. Permite unificar el lenguaje de desarrollo (JavaScript/TypeScript) en todo el stack y proporciona un rendimiento óptimo en aplicaciones orientadas a APIs de alto rendimiento. |
| **Base de Datos**| **PostgreSQL** | PostgreSQL / Gratis | Sistema de gestión de bases de datos relacionales (RDBMS) maduro, con soporte nativo para transacciones complejas, restricciones de integridad estrictas y extensibilidad avanzada. |
| **Caching** | **Redis** | BSD / Gratis | Almacenamiento de estructura de datos en memoria intermedia, utilizado como base de datos clave-valor de baja latencia (sub-milisegundo) para aliviar la carga de lectura del motor principal. |

---

## ⚙️ 2. Modelo de Concurrencia en el Backend

Se ha seleccionado **Node.js**, cuyo núcleo se basa en un modelo de **I/O No Bloqueante y Asíncrono (Event-Driven)**, gestionado por un único hilo principal (*Single-Threaded Event Loop*).

### 🔄 Comparativa de Modelos: Multihilo vs. Asíncrono

* **Modelo Tradicional I/O Bloqueante / Multihilo (ej. Java, PHP clásico):**
  * Asigna un hilo de ejecución independiente por cada petición entrante.
  * Si el proceso requiere consultar la disponibilidad de turnos en la base de datos, el hilo se "bloquea" esperando la respuesta de la red.
  * Ante picos de tráfico simultáneos (concurrencia masiva), la memoria RAM del servidor se agota rápidamente intentando crear y alternar entre cientos de hilos (costo de *Context Switching*).
* **Modelo Asíncrono I/O No Bloqueante (Node.js):**
  * Utiliza un único hilo que recibe todas las solicitudes de manera ininterrumpida.
  * Cuando se inicia una operación pesada de Entrada/Salida (I/O) —como leer registros de pagos o agendar un turno—, Node.js delega la tarea a los hilos internos del sistema operativo (*Libuv*) y el hilo principal queda **inmediatamente libre** para atender la siguiente petición (ej. renderizar el catálogo a otro usuario).
  * Al completarse la tarea en segundo plano, se dispara un evento que retoma la ejecución del flujo original.

### 🎯 Justificación para Edsellrupe
El negocio de fotografía experimenta demandas en forma de ráfagas (por ejemplo, cuando se abren las agendas para sesiones navideñas o infantiles de fin de año en Tinogasta, decenas de clientes intentan acceder en simultáneo). El modelo asíncrono permite procesar miles de conexiones concurrentes concurrentes con recursos de hardware mínimos y económicos, evitando la degradación de la velocidad del sitio.

---

## 🗄️ 3. Justificación del Motor de Base de Datos (SQL vs. NoSQL)

Para la persistencia de datos de Edsellrupe se determinó el uso exclusivo de un **motor Relacional (SQL) mediante PostgreSQL**, descartando opciones NoSQL (como MongoDB o Cassandra) por las siguientes razones operativas:

1. **Garantía y Cumplimiento estricto de ACID:**
   * **Atomicidad:** Si ocurre un error al registrar un pago de seña, toda la operación de reserva se cancela (no quedan turnos reservados "a medias").
   * **Consistencia:** Las reglas del negocio se validan a nivel motor (ej. no se permite registrar un turno con un ID de servicio que no existe).
   * **Aislamiento:** Dos transacciones simultáneas no interfieren; esto evita de forma matemática el **Overbooking** (impedir que dos clientes congelen y reserven exactamente el mismo slot de horario a la misma milésima de segundo).
   * **Durabilidad:** Una vez confirmada la reserva, los datos quedan grabados de forma permanente ante fallas eléctricas del servidor.
2. **Naturaleza Estructurada de las Relaciones:** El dominio del problema cuenta con un esquema de datos rígido y conectado, óptimo para la realización de consultas cruzadas complejas (JOINs):
   * Un *Cliente* posee múltiples *Reservas*.
   * Una *Reserva* está estrictamente vinculada a un *Servicio* (Infantil, Temática, Evento) y genera un *Estado de Pago*.

Las bases de datos NoSQL priorizan la flexibilidad de esquemas polimórficos y la escalabilidad horizontal masiva, características innecesarias para un modelo de negocio transaccional y controlado como el de un estudio fotográfico.

---

## ⚡ 4. Estrategia de Caching

La conectividad móvil en el interior de Catamarca suele presentar problemas de latencia. Para reducir los tiempos de respuesta, se incorpora **Redis** como memoria intermedia de acceso ultra rápido.

### 📥 Distribución de la Estrategia de Datos

* **Datos Cacheables (Lectura masiva, baja actualización):**
  * **Catálogo de Servicios:** Los precios, condiciones y detalles de las sesiones cambian muy rara vez al mes. Se almacenan en Redis con un **TTL (Time-To-Live) de 24 horas**. Si el administrador modifica un precio, el sistema invalida manualmente la caché del backend.
  * **Estructura Visual de Disponibilidad:** Los slots de fechas del calendario se calculan y guardan por un **TTL de 3 a 5 minutos**. Aliviana el procesamiento repetitivo de fechas de la base de datos cada vez que un usuario abre el calendario.
* **Datos NO Cacheables (Alta criticidad o Dinámicos):**
  * Proceso de logueo de usuarios, guardado de contraseñas, inserción de reservas y actualización del listado de saldos e ingresos en el panel administrativo. Estos deben leerse y escribirse **siempre en tiempo real directamente sobre PostgreSQL** para evitar inconsistencias de caja.

---

## 📈 5. Análisis de Escalabilidad y Tolerancia a Fallas

### 🧱 A. Punto Único de Falla (SPOF - Single Point of Failure)
En una arquitectura básica, si la base de datos PostgreSQL corre en la misma instancia del backend y esta se apaga, todo el negocio queda inoperativo. 
* **Mitigación del SPOF:** El sistema se diseña de forma desacoplada. Se propone alojar la base de datos en un servicio gestionado independiente (con copias de seguridad automatizadas diarias) y la lógica de Node.js en contenedores separados. Si el servidor web se cae, los datos quedan intactos y el servicio se levanta en segundos.

### 🗺️ B. El Teorema CAP (Consistencia, Disponibilidad, Tolerancia al Particionado)
De acuerdo al principio de Eric Brewer, un sistema distribuido solo puede garantizar dos de las tres propiedades simultáneamente: