import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { formatCurrency, formatDateTime, formatOccupancy } from "@/lib/formatters";
import { getPublicMovieDetail } from "@/server/services/catalog.service";

function heroBackground(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return "linear-gradient(145deg, rgba(122, 9, 20, 0.92), rgba(22, 22, 22, 0.95))";
  }

  return `linear-gradient(180deg, rgba(0,0,0,0.28), rgba(7,7,7,0.9)), url(${imageUrl}) center/cover`;
}

type PageProps = {
  params: Promise<{
    movieId: string;
  }>;
};

export default async function MovieDetailPage({ params }: PageProps) {
  const { movieId } = await params;
  const movie = await getPublicMovieDetail(db, Number(movieId));

  if (!movie) {
    notFound();
  }

  return (
    <main className="pb-20">
      <section
        className="border-b border-white/10"
        style={{
          background: heroBackground(movie.heroImageUrl ?? movie.imageUrl),
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white transition hover:bg-black/30"
          >
            Volver a cartelera
          </Link>

          <div className="mt-8 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.45em] text-white/55">Detalle de película</p>
            <h1 className="mt-5 text-6xl leading-none text-white sm:text-7xl">{movie.title}</h1>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/70">
              <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2">
                {movie.genre}
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2">
                {movie.durationMinutes} min
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2">
                {movie.classification}
              </span>
            </div>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
              {movie.synopsis || "Consulta las funciones disponibles y compra tus boletas desde esta película."}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/45">Funciones</p>
            <h2 className="mt-3 text-4xl text-white">Compra tus boletas desde aquí</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/65">
            La compra solo se habilita entrando a una película y luego eligiendo una función
            específica.
          </p>
        </div>

        {movie.screenings.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {movie.screenings.map((screening) => (
              <Link
                key={screening.id}
                href={`/funciones/${screening.id}`}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6 transition hover:border-[#E50914]/35 hover:bg-white/[0.07]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-white/45">Función</p>
                    <h3 className="mt-3 text-3xl text-white">{formatDateTime(screening.startsAt)}</h3>
                    <p className="mt-3 text-sm text-white/60">{screening.room.name}</p>
                  </div>
                  <div className="text-right text-sm text-white/65">
                    <p>{formatCurrency(screening.price)}</p>
                    <p>{screening._count.ticketSeats} boletas vendidas</p>
                    <p>
                      {formatOccupancy(screening._count.ticketSeats, screening.capacity)} de ocupación
                    </p>
                  </div>
                </div>
                <div className="mt-6 inline-flex rounded-full bg-[#E50914] px-5 py-3 text-sm font-semibold text-white">
                  Elegir esta función
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-[#181818] p-6 text-sm text-white/60">
            Esta película aún no tiene funciones programadas. Puedes crearlas desde el panel
            administrador.
          </div>
        )}
      </section>
    </main>
  );
}
