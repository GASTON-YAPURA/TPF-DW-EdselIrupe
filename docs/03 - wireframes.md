# 📄 Interfaz de Usuario: Wireframes y Arquitectura Visual

Este documento presenta los bocetos de baja fidelidad (wireframes) de las pantallas clave de la aplicación web de Edsellrupe. El diseño fue pensado bajo el enfoque Mobile-First, garantizando una navegación intuitiva y una disposición limpia de los elementos tanto en teléfonos celulares como en computadoras.

---

## 📱 1. Wireframe: Vista de Inicio (Home / Landing Page)

Esta es la pantalla de bienvenida. Su objetivo es capturar la atención del cliente mediante un diseño elegante, destacando los accesos directos y una muestra del porfolio fotográfico.

### 📋 Descripción de Componentes

* Barra de Navegación: Fija en la parte superior muestra el Inicio, los servicios y la reserva de los turnos. En móviles se contrae en un menú desplegable (hamburguesa) para no obstruir la vista.

* Sección Principal (Hero): Presenta un eslogan centrado con tipografía destacada y el botón principal de reserva un turno y otro de explorar los servicios del emprendimiento.

* Nuestra filosofía: Una breve descripción del nacimiento de éste emprendimiento.

* Pie de Página: Nos muestra la ubicación y contacto, las redes sociales  y una pequeña frase inspiradora del emprendimiento
 
---

![Wireframe: Inicio de la Página Web - EdselIrupe](../docs/03%20-%20wireframes%20-%20anexo/01%20-%20INICIO.png)

---

## 📅 2. Wireframe: Asistente de Reserva Online.

### 📋 Descripción de Componentes.

* Grilla Adaptable (Grid): Disposición de tarjetas en dos columnas para tablets y computadoras, las cuales se apilan en una sola columna en pantallas móviles para facilitar el scroll vertical.

* Tarjetas de Servicio (Cards): Componentes independientes de React que integran un marcador de imagen de muestra, datos informativos de duración y el precio del servicio.

* Botón de Acción "Agendar": Dirige al usuario de manera directa al formulario de contacto o reserva para agilizar el canal de conversión de clientes.

---

![Wireframe: Servicios de la Página Web - EdselIrupe](../docs/03%20-%20wireframes%20-%20anexo/02%20-%20SERVICIOS.png)

---

## 👤 3. Wireframe: Panel de Administración (Dashboard).

Vista privada exclusiva para Fernanda y Matías, diseñada para una gestión rápida desde teléfonos celulares mientras realizan sesiones en exteriores.

* Reservas Activas: Sirve para saber de un vistazo cuántas sesiones de fotos están confirmadas en la agenda y planificar el volumen de trabajo semanal.

* Ingresos Registrados: Sirve para llevar la contabilidad del dinero que ya ingresó efectivamente a la caja o banco (el cobro de las señas o los pagos completos).

* Cobro Pendiente: Sirve para conocer de inmediato cuánto dinero resta cobrar de las sesiones agendadas, lo que ayuda a Fernanda y Matías a recordar qué saldos deben reclamar antes o durante la sesión.

### 📋 Descripción de Componentes.

* Listado y Seguimiento de Turnos (Grilla Central):

* Identificación del Cliente y Servicio: Sirve para saber quién asistirá a la sesión y qué temática o paquete fotográfico contrató para poder preparar con anticipación la escenografía y las cámaras.

* Fecha y Hora: Sirve para controlar la puntualidad de la agenda de trabajo diaria y evitar superposiciones de clientes.

* Control de Saldos (Total vs. Abonado): Sirve para verificar si el cliente ya pagó la seña del 30% (estado "Señado"), si tiene todo saldado (estado "Completado") o si asiste a la sesión debiendo el total del paquete (estado "Pendiente").

* Botón "[Registrar Cobro]": Sirve para registrar manualmente en el sistema los cobros realizados a los clientes (por transferencia bancaria o efectivo), actualizando los montos y cambiando el estado del turno inmediatamente.

* Botón "[Ícono Eliminar]": Sirve para dar de baja de forma permanente una reserva o turno cancelado, liberando automáticamente esa fecha y horario en el calendario de la web para otros clientes.

* Botón "[+ Añadir Turno Manual]": Sirve para que Fernanda o Matías agenden directamente a un cliente que se contactó de forma externa (como por WhatsApp o llamada directa) sin que este tenga que hacer la reserva por la web.

---

![Wireframe: Panel Administrativo de la Página Web - EdselIrupe](../docs/03%20-%20wireframes%20-%20anexo/03%20-%20PANEL%20ADMIN.png)

