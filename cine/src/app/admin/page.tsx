import Link from "next/link";

import { db } from "@/lib/db";
import { formatCurrency, formatDateTime, formatOccupancy } from "@/lib/formatters";
import { getAdminDashboard } from "@/server/services/admin.service";

export default async function AdminPage() {
  const dashboard = await getAdminDashboard(db);

  const metrics = [
    {
      label: "Películas publicadas",
      value: `${dashboard.metrics.publishedMovieCount}/${dashboard.metrics.movieCount}`,
      helper: "Control editorial y disponibilidad comercial",
    },
    {
      label: "Salas activas",
      value: `${dashboard.metrics.activeRoomCount}`,
      helper: "Infraestructura disponible para programación",
    },
    {
      label: "Funciones próximas",
      value: `${dashboard.metrics.upcomingScreeningCount}`,
      helper: "Programación futura registrada en el sistema",
    },
    {
      label: "Ventas acumuladas",
      value: formatCurrency(dashboard.metrics.revenue),
      helper: `${dashboard.metrics.ticketsSold} tiquetes vendidos`,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.26)]"
          >
            <p className="text-sm text-white/55">{metric.label}</p>
            <h2 className="mt-4 text-4xl text-white">{metric.value}</h2>
            <p className="mt-3 text-sm text-white/60">{metric.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/45">Accesos rápidos</p>
              <h2 className="mt-3 text-3xl text-white">Flujo operativo</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Link
              href="/admin/peliculas"
              className="rounded-3xl border border-white/10 bg-[#181818] p-5 transition hover:border-[#E50914]/35"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Paso 1</p>
              <h3 className="mt-3 text-2xl text-white">Películas</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Da de alta títulos, controla estado y define cuál se destaca en la landing.
              </p>
            </Link>

            <Link
              href="/admin/salas"
              className="rounded-3xl border border-white/10 bg-[#181818] p-5 transition hover:border-[#E50914]/35"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Paso 2</p>
              <h3 className="mt-3 text-2xl text-white">Salas</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Crea la sala y el sistema genera automáticamente su mapa de asientos.
              </p>
            </Link>

            <Link
              href="/admin/funciones"
              className="rounded-3xl border border-white/10 bg-[#181818] p-5 transition hover:border-[#E50914]/35"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Paso 3</p>
              <h3 className="mt-3 text-2xl text-white">Funciones</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Programa película, sala, horario y precio sin pisar horarios de una misma sala.
              </p>
            </Link>
          </div>
        </article>

        <article className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-white/45">Capacidad instalada</p>
          <h2 className="mt-3 text-3xl text-white">Salas registradas</h2>

          <div className="mt-6 space-y-4">
            {dashboard.rooms.length > 0 ? (
              dashboard.rooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-3xl border border-white/10 bg-[#181818] p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl text-white">{room.name}</h3>
                      <p className="mt-2 text-sm text-white/60">
                        {room.rowsCount} filas x {room.columnsCount} columnas
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75">
                      {room.capacity} sillas
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-white/55">
                    {room._count.screenings} funciones programadas
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-[#181818] p-5 text-sm text-white/60">
                Aún no hay salas creadas. Comienza por el módulo de salas para generar la
                infraestructura del cine.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl text-white">Próximas funciones</h2>
          <span className="text-sm uppercase tracking-[0.35em] text-white/35">
            {dashboard.metrics.soldSeatsCount} sillas vendidas
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {dashboard.upcomingScreenings.length > 0 ? (
            dashboard.upcomingScreenings.map((screening) => {
              const occupancy = formatOccupancy(
                screening._count.ticketSeats,
                screening.capacity,
              );

              return (
                <article
                  key={screening.id}
                  className="rounded-3xl border border-white/10 bg-[#181818] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-2xl text-white">{screening.movie.title}</h3>
                      <p className="mt-2 text-sm text-white/60">
                        {screening.room.name} · {formatDateTime(screening.startsAt)}
                      </p>
                    </div>
                    <div className="flex min-w-[240px] flex-col gap-2">
                      <div className="flex items-center justify-between text-sm text-white/65">
                        <span>Ocupación</span>
                        <span>{occupancy}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#E50914]"
                          style={{ width: occupancy }}
                        />
                      </div>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                        {screening._count.ticketSeats} / {screening.capacity} sillas vendidas
                      </p>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#181818] p-5 text-sm text-white/60">
              Todavía no hay funciones programadas. El flujo recomendado es: película, sala y
              luego función.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
