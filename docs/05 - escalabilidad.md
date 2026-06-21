
# Guía de Evaluación de Escalabilidad y Crecimiento

Este documento detalla la planificación de la infraestructura y el comportamiento del sistema de **Edsellrupe** ante variaciones de la demanda en el tiempo, estructurado rigurosamente bajo los lineamientos y bloques analíticos de la Guía de Evaluación de la cátedra.

---

## 📊 Bloque 1: Escalabilidad de Carga y Tráfico (RPS y Concurrencia)

Este bloque evalúa la capacidad del sistema para procesar solicitudes simultáneas de usuarios sin degradar la velocidad de carga ni comprometer la experiencia del cliente.

---

### 📈 A. Patrón de Tráfico Estimado y RPS
El tráfico del sistema de Edsellrupe no es lineal ni uniforme; se comporta bajo un patrón de **ráfagas estacionales** vinculado al ciclo del negocio fotográfico local en Tinogasta (picos de demanda en fechas festivas, comuniones, fin de año, sesiones navideñas o aperturas mensuales de la agenda de turnos).

* **Tráfico Base (Normal):** Se estiman entre 50 y 100 visitas diarias distribuidas uniformemente en la web pública (visualización del catálogo de servicios). Esto representa un promedio inferior a **1 RPS (Requests Per Second)**.

* **Tráfico Pico (Ráfaga):** Al abrirse la agenda de reservas del mes o lanzar promociones estacionales, se proyecta una concurrencia concentrada de hasta 200 usuarios simultáneos en una ventana de 15 minutos, elevando la demanda a picos técnicos de **15 a 20 RPS** enfocados exclusivamente en operaciones concurrentes de lectura/escritura sobre el calendario.

### ⚙️ B. Modelo de Concurrencia del Backend
Para procesar estas ráfagas de tráfico eficientemente con recursos de hardware económicos, se adoptó el modelo de **I/O No Bloqueante y Asíncrono** provisto nativamente por **Node.js**:
* El hilo único principal de ejecución (*Event Loop*) recibe todas las conexiones entrantes sin detenerse.

* Si un cliente solicita registrar una reserva, la tarea pesada de comunicación con la base de datos se delega al sistema operativo en segundo plano. El hilo principal queda libre de forma instantánea para enviar el catálogo a los siguientes usuarios en la fila.

* Esto evita el desbordamiento de memoria RAM que sufren los servidores multihilo tradicionales cuando intentan abrir hilos bloqueantes dedicados por cada persona conectada.

### 🔄 C. Diseño Stateless (Sin Estado)
Para que el sistema pueda escalar horizontalmente en el futuro (añadir más servidores web idénticos detrás de un balanceador de carga), el backend se diseña de forma estrictamente **Stateless**:
* Los servidores de Node.js no guardan información de sesiones de usuarios ni estados de reservas en su memoria local interna.

* Toda la autenticación se gestiona mediante tokens firmados (por ejemplo, tokens JWT enviados por el Frontend), y los estados de los turnos residen únicamente en la base de datos centralizada.

* Si el servidor se apaga o se duplica para absorber un pico de tráfico, cualquier instancia del backend puede atender a cualquier usuario de forma transparente.

### ⚡ D. Estrategia de Caching
Para mitigar el impacto de las consultas repetitivas en la base de datos y optimizar la velocidad en conexiones de red móviles de alta latencia, se aplica caching a través de **Redis**:

* **Catálogo de Servicios Públicos:** Se cachea por **24 horas (TTL)**, ya que los precios e información de las sesiones fotográficas varían muy pocas veces al mes.

* **Caché de Disponibilidad del Calendario:** Se almacena por un período corto de **5 minutos (TTL)** para agilizar la renderización de los días libres del mes sin rehacer cálculos complejos en PostgreSQL en cada clic, expirando rápido para evitar que dos clientes seleccionen el mismo horario real.

---

## 🗄️ Bloque 2: Escalabilidad de Datos (Teorema CAP y Almacenamiento)

Este bloque analiza cómo el sistema almacena, protege y proyecta el volumen de la información del estudio, garantizando la consistencia transaccional antes que cualquier otra métrica.

### 📌 A. Tipo de Datos del Proyecto
Los datos generados por el ecosistema de Edsellrupe son de naturaleza **altamente estructurada, relacional y crítica**:

* Un **Usuario** (cliente o administrador) realiza una **Reserva** para un **Servicio** específico en una fecha/hora fija, lo que a su vez genera un **Estado de Pago** (monto total, seña abonada, saldo pendiente).

* Hay reglas estrictas de integridad: un turno no puede quedar huérfano (sin cliente asociado), ni un horario puede pertenecer a dos sesiones al mismo tiempo.

### 🗃️ B. Elección del Motor: SQL (PostgreSQL)
Debido a la naturaleza de los datos, se seleccionó un motor **Relacional (SQL) como PostgreSQL**, rechazando de manera fundamentada las bases de datos NoSQL. Las razones críticas son:
1. **Transacciones ACID Estrictas:** Garantiza que los registros de dinero (pagos de señas) y bloqueos de agenda se ejecuten con éxito rotundo o se anulen por completo (Atomicidad). Esto elimina errores contables.

2. **Prevención Matemática de Overbooking:** Al utilizar bloqueos transaccionales a nivel de fila (*Row-Level Locking*), SQL impide de forma absoluta que dos transacciones simultáneas congelen e inscriban a dos personas distintas en el mismo slot horario.

### 🗺️ C. Postura ante el Teorema CAP (Enfoque CP)
Según el Teorema CAP, ante una partición de red (falla de comunicación en los servidores de base de datos), un sistema distribuido debe elegir entre la Consistencia (C) o la Disponibilidad (A).