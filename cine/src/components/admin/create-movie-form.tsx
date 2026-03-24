"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

const movieStatuses = [
  { value: "DRAFT", label: "Borrador" },
  { value: "PUBLISHED", label: "Publicada" },
  { value: "ARCHIVED", label: "Archivada" },
];

export function CreateMovieForm() {
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
      const response = await fetch("/api/admin/movies", {
        method: "POST",
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
        setError(result.message ?? "No fue posible crear la película.");
        return;
      }

      setFeedback("Película creada correctamente.");
      form.reset();
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.26)]"
    >
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-white/45">Nueva película</p>
        <h2 className="mt-3 text-3xl text-white">Alta de cartelera</h2>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm text-white/75">
          Título
          <input
            name="title"
            required
            className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-white/75">
            Género
            <input
              name="genre"
              required
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
              placeholder="+13, +15, Familiar..."
              className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
            />
          </label>
          <label className="grid gap-2 text-sm text-white/75">
            Estado
            <select
              name="status"
              defaultValue="DRAFT"
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
            className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
          />
        </label>

        <label className="grid gap-2 text-sm text-white/75">
          URL del hero
          <input
            name="heroImageUrl"
            type="url"
            className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
          />
        </label>

        <label className="grid gap-2 text-sm text-white/75">
          Sinopsis
          <textarea
            name="synopsis"
            rows={4}
            className="rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-white outline-none transition focus:border-[#E50914]"
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white/75">
          <input type="checkbox" name="isFeatured" className="h-4 w-4 accent-[#E50914]" />
          Marcar como destacada en la landing
        </label>
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

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#E50914] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#F6121D] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
      >
        {isPending ? "Creando..." : "Crear película"}
      </button>
    </form>
  );
}
