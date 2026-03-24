import { CreateScreeningForm } from "@/components/admin/create-screening-form";
import { db } from "@/lib/db";
import { formatCurrency, formatDateTime, formatOccupancy } from "@/lib/formatters";
import {
  getScreeningCreationLookups,
  listScreenings,
} from "@/server/services/admin.service";

export default async function AdminScreeningsPage() {
  const [screenings, lookups] = await Promise.all([
    listScreenings(db),
    getScreeningCreationLookups(db),
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
      <CreateScreeningForm movies={lookups.movies} rooms={lookups.rooms} />

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/45">Programación</p>
            <h2 className="mt-3 text-3xl text-white">Funciones registradas</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            {screenings.length} funciones
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {screenings.length > 0 ? (
            screenings.map((screening) => (
              <article
                key={screening.id}
                className="rounded-3xl border border-white/10 bg-[#181818] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-2xl text-white">{screening.movie.title}</h3>
                    <p className="mt-2 text-sm text-white/60">
                      {screening.room.name} · {formatDateTime(screening.startsAt)}
                    </p>
                    <p className="mt-3 text-sm text-white/55">
                      {screening._count.ticketSeats} / {screening.capacity} sillas vendidas ·{" "}
                      {formatOccupancy(screening._count.ticketSeats, screening.capacity)}
                    </p>
                  </div>

                  <div className="text-right text-sm text-white/65">
                    <p>{screening.status}</p>
                    <p>{formatCurrency(screening.price)}</p>
                    <p>{screening.showTime}</p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#181818] p-5 text-sm text-white/60">
              No hay funciones aún. Cuando existan películas y salas activas, podrás programarlas
              aquí.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
