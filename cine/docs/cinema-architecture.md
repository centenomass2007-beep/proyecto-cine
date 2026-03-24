# Arquitectura Propuesta

## Objetivo

Construir una aplicacion web de cartelera y venta de tiquetes con tres focos criticos:

- Publicacion centralizada de peliculas y funciones.
- Prevencion de sobreventa para una sala fija de 150 sillas.
- Validacion operativa de tiquetes por codigo en taquilla o acceso.

## Decision Tecnica

- Frontend: Next.js con App Router para separar landing, compra, admin y validacion.
- UI: Radix UI para Dialog, Tooltip y Toggle Group con accesibilidad solida.
- Estilos: Tailwind CSS con paleta oscura inspirada en Netflix.
- Persistencia: Prisma ORM sobre PostgreSQL. Si prefieres MySQL, cambia `provider = "postgresql"` por `provider = "mysql"` en `prisma/schema.prisma`.
- Concurrencia: la compra se resuelve con transaccion `Serializable` y la restriccion unica `@@unique([screeningId, seatId])` en `TicketSeat`.

## Regla Critica Anti-Sobreventa

La regla "un asiento no puede venderse dos veces para la misma funcion" se garantiza en dos capas:

1. Capa de negocio: antes de crear el tiquete, el backend consulta si alguno de los asientos ya esta reservado.
2. Capa de base de datos: `TicketSeat` tiene una llave unica compuesta por `screeningId` y `seatId`, por lo que dos transacciones concurrentes no pueden confirmar el mismo asiento.

Esto evita que la UI dependa de validaciones solo en cliente.

## Estructura Recomendada de Next.js

```text
src/
  app/
    (public)/
      page.tsx                    // Landing estilo Netflix
      peliculas/[movieId]/page.tsx
      funciones/[screeningId]/page.tsx
    checkout/[screeningId]/page.tsx
    admin/
      page.tsx                    // Dashboard de ventas y ocupacion
      peliculas/page.tsx
      funciones/page.tsx
    validacion/page.tsx           // Escaneo/ingreso de codigo
    api/
      purchases/route.ts          // POST compra de tiquetes
      tickets/validate/route.ts   // POST validacion de codigo
  components/
    cinema/
      cinema-seat-grid.tsx
      purchase-summary.tsx
      movie-hero.tsx
      movie-row.tsx
    ui/
      price-badge.tsx
      stat-card.tsx
  lib/
    auth.ts
    db.ts
    formatters.ts
    seat-status.ts
  server/
    services/
      ticket-purchase.service.ts
      ticket-validation.service.ts
      dashboard.service.ts
    repositories/
      screenings.repository.ts
      tickets.repository.ts
  types/
    cinema.ts
prisma/
  schema.prisma
  seed.ts
```

## Flujos Principales

### Landing Page

- Hero con pelicula destacada (`Movie.isFeatured = true`).
- Filas de posters por genero.
- CTA directo a funciones disponibles.

### Selector de Asientos

- Grid de 10 filas por 15 columnas.
- Estados visuales:
  - Disponible
  - Ocupado
  - Seleccionado
- La consulta de disponibilidad debe salir desde `TicketSeat` filtrando por `screeningId`.

### Compra

- El usuario elige asientos.
- Se abre `Radix Dialog` con resumen: pelicula, funcion, asientos y total.
- El backend ejecuta una transaccion:
  - valida asientos
  - crea `Ticket`
  - crea `TicketSeat`
  - marca la funcion como `SOLD_OUT` si llega a 150

### Panel Admin

- KPI de ventas totales.
- KPI de ocupacion por funcion.
- CRUD simple para peliculas y funciones.

### Validacion de Tiquetes

- Input manual o lector QR/barcode.
- El sistema busca `Ticket.code`.
- Si esta `ACTIVE`, cambia a `USED` y registra `validatedAt` y `validatedById`.

## Modelo de Datos

- `Movie`: cartelera, estado y metadata visual.
- `Screening`: funcion con fecha, hora, precio y capacidad.
- `Seat`: inventario fijo de la sala.
- `Ticket`: compra confirmada con codigo unico.
- `TicketSeat`: detalle de asientos reservados para una funcion.

## Suposicion de Negocio

Este diseno asume que un codigo de tiquete puede agrupar varios asientos dentro de una misma compra. Si necesitas un QR independiente por silla, conviene volver `TicketSeat` la unidad escaneable y generar un codigo por asiento.
