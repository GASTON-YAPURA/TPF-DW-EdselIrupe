# 📄 Arquitectura de la Información (Sitemap) y Flujo de Usuario (User Flow)

Este documento define la estructura jerárquica de las pantallas de la aplicación web de **Edsellrupe** y modela visualmente la interacción del usuario en los procesos más críticos del negocio.

---

## 🗺️ 1. Arquitectura de la Información (Sitemap)

El sistema está estructurado bajo la arquitectura de una **Single Page Application (SPA)**, organizando las vistas y subcomponentes de forma lógica según el rol del usuario (Público General, Cliente Autenticado y Administrador).

```text
[PÁGINA PRINCIPAL / HOME]
 │
 ├──► [Sección: Quiénes Somos] (Historia y Filosofía)
 │
 ├──► [Vista: Catálogo de Servicios]
 │     │
 │     └───► [Detalle de Tarjetas] (Infantil, Temática, Books, Eventos)
 │
 ├──► [Vista: Contacto] (Formulario de consultas generales)
 │
 ├──► [Portal de Reservas] ──► Requiere [Pantalla: Login / Registro]
 │
 └──► [PANEL ADMINISTRATIVO] (Acceso privado con contraseña)
       │
       ├──► [Métricas / KPIs] (Reservas activas, Ingresos, Saldos)
       ├──► [Tabla de Gestión] (Listado de turnos de clientes)
       └──► [Acciones] (Registrar cobros, Añadir turno manual, Eliminar)
```

---

## 📊 3. Diagrama Visual del Flujo (Mermaid)

### 📅 Diagrama de Flujo: Proceso de Reserva Online

```text
[Pantalla de Inicio] ──► Clic en "Reservar Sesión" ──► ¿Inició Sesión?
                                                            │
                                        ┌───────────────────┴───────────────────┐
                                     SÍ │                                    NO │
                                        ▼                                       ▼
                             [Seleccionar Servicio]                  [Pantalla de Login]
                                        │                                       │
                                        ▼                                       ▼
                             [Elegir Día y Horario]                  (Completa sus datos)
                                        │                                       │
                                        ▼                                       │
[Confirmación de Turno] <── Clic en "Confirmar" <───────────────────────────────┘
            │
            ▼
(Muestra confirmación de reserva pre-registrada exitosamente)
```

---