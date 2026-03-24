import Link from "next/link";

import { CreateMovieForm } from "@/components/admin/create-movie-form";
import { db } from "@/lib/db";
import { formatDateOnly } from "@/lib/formatters";
import { listMovies } from "@/server/services/admin.service";

export default async function AdminMoviesPage() {
  const movies = await listMovies(db);

  return (
    <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
      <CreateMovieForm />

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/45">Cartelera</p>
            <h2 className="mt-3 text-3xl text-white">Películas registradas</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            {movies.length} títulos
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <article
                key={movie.id}
                className="rounded-3xl border border-white/10 bg-[#181818] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div
                    className="h-36 w-full rounded-3xl border border-white/10 lg:w-28"
                    style={{
                      background: movie.imageUrl
                        ? `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(7,7,7,0.88)), url(${movie.imageUrl}) center/cover`
                        : "linear-gradient(145deg, rgba(122, 9, 20, 0.92), rgba(22, 22, 22, 0.95))",
                    }}
                  />
                  <div>
                    <h3 className="text-2xl text-white">{movie.title}</h3>
                    <p className="mt-2 text-sm text-white/60">
                      {movie.genre} · {movie.durationMinutes} min · {movie.classification}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/55">
                      {movie.synopsis || "Sin sinopsis cargada."}
                    </p>
                  </div>
                  <div className="space-y-2 text-right text-sm text-white/65">
                    <p>{movie.status}</p>
                    <p>{movie._count.screenings} funciones</p>
                    <p>Actualizada {formatDateOnly(movie.updatedAt)}</p>
                    <Link
                      href={`/admin/peliculas/${movie.id}`}
                      className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                    >
                      Editar portada y datos
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#181818] p-5 text-sm text-white/60">
              No hay películas aún. Crea la primera para habilitar luego la programación de
              funciones.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
