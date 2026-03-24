"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

type ScreeningMovieOption = {
  id: number;
  title: string;
  status: string;
};

type ScreeningRoomOption = {
  id: number;
  name: string;
  capacity: number;
};

type CreateScreeningFormProps = {
  movies: ScreeningMovieOption[];
  rooms: ScreeningRoomOption[];
};

export function CreateScreeningForm({
  movies,
  rooms,
}: CreateScreeningFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const canCreate = movies.length > 0 && rooms.length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setFeedback(null);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/screenings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId: Number(formData.get("movieId")),
          roomId: Number(formData.get("roomId")),
          showDate: formData.get("showDate"),
          showTime: formData.get("showTime"),
          price: Number(formData.get("price")),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "No fue posible crear la función.");
        return;
      }

      setFeedback("Función programada correctamente.");
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
        <p className="text-sm uppercase tracking-[0.35em] text-white/45">Nueva función</p>
        <h2 className="mt-3 text-3xl text-white">Programación comercial</h2>
      </div>

      {!canCreate && (
        <div className="mt-6 rounded-2xl border border-[#E50914]/25 bg-[#E50914]/10 px-4 py-3 text-sm text-white">
          Antes de crear funciones necesitas al menos una película y una sala activa.
        </div>
      )}

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm text-white/75">
          Película
          <select
            name="movieId"
            required
            disabled={!canCreate}
            defaultValue=""
            className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914] disabled:opacity-50"
          >
            <option value="" disabled>
              Selecciona una película
            </option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title} · {movie.status}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-white/75">
          Sala
          <select
            name="roomId"
            required
            disabled={!canCreate}
            defaultValue=""
            className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914] disabled:opacity-50"
          >
            <option value="" disabled>
              Selecciona una sala
            </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} · {room.capacity} sillas
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-white/75">
            Fecha
            <input
              name="showDate"
              type="date"
              required
              disabled={!canCreate}
              className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914] disabled:opacity-50"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/75">
            Hora
            <input
              name="showTime"
              type="time"
              required
              disabled={!canCreate}
              className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914] disabled:opacity-50"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm text-white/75">
          Precio en COP
          <input
            name="price"
            type="number"
            min={1000}
            step={1000}
            defaultValue={18000}
            required
            disabled={!canCreate}
            inputMode="numeric"
            placeholder="18000"
            className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914] disabled:opacity-50"
          />
          <span className="text-xs text-white/45">
            Ingresa el valor en pesos colombianos, sin puntos ni comas. Ejemplo: `18000`.
          </span>
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
        disabled={isPending || !canCreate}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#E50914] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#F6121D] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
      >
        {isPending ? "Programando..." : "Crear función"}
      </button>
    </form>
  );
}
