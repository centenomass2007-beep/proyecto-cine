import Link from "next/link";

import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/formatters";
import { getPublicHomepageData } from "@/server/services/catalog.service";

export const dynamic = "force-dynamic";

function posterBackground(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return "linear-gradient(145deg, rgba(122, 9, 20, 0.92), rgba(22, 22, 22, 0.95))";
  }

  return `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(7,7,7,0.88)), url(${imageUrl}) center/cover`;
}

export default async function HomePage() {
  const { featuredMovie, genreRows } = await getPublicHomepageData(db);

  return (
    <main className="pb-20">
      <section className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-white/45">CineScope</p>
            <h1 className="mt-2 text-3xl text-white">Cartelera y compra online</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-full border border-[#E50914]/30 bg-[#E50914]/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E50914]/15"
            >
              Panel admin
            </Link>
            <Link
              href="/validacion"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Validar boleta
            </Link>
          </div>
        </div>
      </section>

      {featuredMovie ? (
        <section className="relative isolate overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-hero-radial opacity-90" />
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background: posterBackground(featuredMovie.heroImageUrl ?? featuredMovie.imageUrl),
            }}
          />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.5em] text-white/55">Película destacada</p>
              <h2 className="mt-5 max-w-xl text-6xl leading-none text-white sm:text-7xl">
                {featuredMovie.title}
              </h2>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/70">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {featuredMovie.genre}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {featuredMovie.durationMinutes} min
                </span>
                <span className="rounded-full border border-[#E50914]/30 bg-[#E50914]/10 px-4 py-2 text-white">
                  Clasificación {featuredMovie.classification}
                </span>
              </div>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/72">
                {featuredMovie.synopsis || "Explora la cartelera y compra tus boletas en línea."}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/peliculas/${featuredMovie.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-[#E50914] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#F6121D]"
                >
                  Ver funciones y comprar
                </Link>
                <Link
                  href="/admin/peliculas"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Actualizar cartelera
                </Link>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6 shadow-glow">
              <div
                className="poster-sheen rounded-[28px] border border-white/10 p-8"
                style={{
                  background: posterBackground(featuredMovie.imageUrl),
                }}
              >
                <p className="text-xs uppercase tracking-[0.45em] text-white/55">Compra guiada</p>
                <div className="mt-20 rounded-3xl border border-white/10 bg-black/35 p-5 backdrop-blur-sm">
                  {featuredMovie.screenings[0] ? (
                    <>
                      <p className="text-sm text-white/60">Próxima función</p>
                      <p className="mt-2 text-3xl text-white">
                        {formatDateTime(featuredMovie.screenings[0].startsAt)}
                      </p>
                      <p className="mt-2 text-sm text-white/65">
                        {featuredMovie.screenings[0].room.name} · Compra desde la portada
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-white/60">Disponibilidad</p>
                      <p className="mt-2 text-3xl text-white">Sin funciones</p>
                      <p className="mt-2 text-sm text-white/65">
                        Programa horarios desde el panel administrador.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="rounded-[32px] border border-dashed border-white/10 bg-white/5 p-10 text-center">
            <p className="text-sm uppercase tracking-[0.45em] text-white/45">Cartelera vacía</p>
            <h2 className="mt-4 text-5xl text-white">Aún no hay películas publicadas</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/65">
              Crea o publica películas desde el panel administrador. En cuanto publiques una,
              aparecerá aquí con su portada real y el flujo de compra por película.
            </p>
            <Link
              href="/admin/peliculas"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-[#E50914] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#F6121D]"
            >
              Ir a administración de películas
            </Link>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="space-y-10">
          {genreRows.length > 0 ? (
            genreRows.map((row) => (
              <div key={row.genre}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-3xl text-white">{row.genre}</h2>
                  <span className="text-sm uppercase tracking-[0.35em] text-white/35">
                    {row.movies.length} títulos
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {row.movies.map((movie) => (
                    <Link
                      key={movie.id}
                      href={`/peliculas/${movie.id}`}
                      className="poster-sheen group rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4 transition hover:-translate-y-1 hover:border-[#E50914]/40"
                    >
                      <div
                        className="h-56 rounded-3xl"
                        style={{
                          background: posterBackground(movie.imageUrl),
                        }}
                      />
                      <h3 className="mt-4 text-2xl text-white">{movie.title}</h3>
                      <p className="mt-2 text-sm text-white/60">
                        {movie._count?.screenings
                          ? `${movie._count.screenings} funciones programadas`
                          : "Entra para ver horarios y comprar boletas."}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#181818] p-6 text-sm text-white/60">
              La cartelera aún no tiene títulos publicados. Cuando agregues películas desde admin,
              aquí aparecerán las portadas clicables para iniciar la compra.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
