"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

type EditMovieFormProps = {
  movie: {
    id: number;
    title: string;
    genre: string;
    durationMinutes: number;
    classification: string;
    imageUrl: string;
    heroImageUrl: string | null;
    synopsis: string | null;
    status: string;
    isFeatured: boolean;
  };
};

const movieStatuses = [
  { value: "DRAFT", label: "Borrador" },
  { value: "PUBLISHED", label: "Publicada" },
  { value: "ARCHIVED", label: "Archivada" },
];

export function EditMovieForm({ movie }: EditMovieFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setFeedback(null);
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/admin/movies/${movie.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.get("title"),
          genre: formData.get("genre"),
          durationMinutes: Number(formData.get("durationMinutes")),
          classification: formData.get("classification"),
          imageUrl: formData.get("imageUrl"),
          heroImageUrl: formData.get("heroImageUrl"),
          synopsis: formData.get("synopsis"),
          status: formData.get("status"),
          isFeatured: formData.get("isFeatured") === "on",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "No fue posible actualizar la película.");
        return;
      }

      setFeedback("Película actualizada correctamente.");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.26)]"
    >
      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-white/45">Editar película</p>
          <h2 className="mt-3 text-3xl text-white">{movie.title}</h2>
          <div
            className="mt-6 h-[420px] rounded-[28px] border border-white/10"
            style={{
              background: movie.imageUrl
                ? `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(7,7,7,0.88)), url(${movie.imageUrl}) center/cover`
                : "linear-gradient(145deg, rgba(122, 9, 20, 0.92), rgba(22, 22, 22, 0.95))",
            }}
          />
          <p className="mt-4 text-sm leading-6 text-white/60">
            Aquí puedes cambiar título, estado, sinopsis y la portada que se verá en la cartelera.
          </p>
        </div>

        <div className="grid gap-4">
        <label className="grid gap-2 text-sm text-white/75">
          Título
          <input
            name="title"
            required
            defaultValue={movie.title}
            className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-white/75">
            Género
            <input
              name="genre"
              required
              defaultValue={movie.genre}
              className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
            />
          </label>
          <label className="grid gap-2 text-sm text-white/75">
            Duración (min)
            <input
              name="durationMinutes"
              type="number"
              min={1}
              required
              defaultValue={movie.durationMinutes}
              className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-white/75">
            Clasificación
            <input
              name="classification"
              required
              defaultValue={movie.classification}
              className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
            />
          </label>
          <label className="grid gap-2 text-sm text-white/75">
            Estado
            <select
              name="status"
              defaultValue={movie.status}
              className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
            >
              {movieStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm text-white/75">
          URL del póster
          <input
            name="imageUrl"
            type="url"
            required
            defaultValue={movie.imageUrl}
            className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
          />
        </label>

        <label className="grid gap-2 text-sm text-white/75">
          URL del hero
          <input
            name="heroImageUrl"
            type="url"
            defaultValue={movie.heroImageUrl ?? ""}
            className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
          />
        </label>

        <label className="grid gap-2 text-sm text-white/75">
          Sinopsis
          <textarea
            name="synopsis"
            rows={4}
            defaultValue={movie.synopsis ?? ""}
            className="rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-white outline-none transition focus:border-[#E50914]"
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white/75">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={movie.isFeatured}
            className="h-4 w-4 accent-[#E50914]"
          />
          Marcar como destacada en la landing
        </label>
      </div>
      </div>

      {(feedback || error) && (
        <div
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
            error
              ? "border-[#E50914]/30 bg-[#E50914]/10 text-white"
              : "border-white/10 bg-white/5 text-white/75"
          }`}
        >
          {error ?? feedback}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#E50914] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#F6121D] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/peliculas")}
          className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Volver
        </button>
      </div>
    </form>
  );
}
