"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

export function CreateRoomForm() {
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
      const response = await fetch("/api/admin/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          rowsCount: Number(formData.get("rowsCount")),
          columnsCount: Number(formData.get("columnsCount")),
          isActive: formData.get("isActive") === "on",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "No fue posible crear la sala.");
        return;
      }

      setFeedback("Sala creada y asientos generados correctamente.");
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
        <p className="text-sm uppercase tracking-[0.35em] text-white/45">Nueva sala</p>
        <h2 className="mt-3 text-3xl text-white">Configuración física</h2>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm text-white/75">
          Nombre
          <input
            name="name"
            required
            placeholder="Sala 2, VIP Norte..."
            className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
          />
        </label>

        <label className="grid gap-2 text-sm text-white/75">
          Descripción
          <textarea
            name="description"
            rows={3}
            placeholder="Ej. Sala premium con sonido Atmos"
            className="rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-white outline-none transition focus:border-[#E50914]"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-white/75">
            Filas
            <input
              name="rowsCount"
              type="number"
              min={1}
              max={26}
              defaultValue={10}
              required
              className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/75">
            Columnas
            <input
              name="columnsCount"
              type="number"
              min={1}
              max={30}
              defaultValue={15}
              required
              className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
            />
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white/75">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked
            className="h-4 w-4 accent-[#E50914]"
          />
          Dejar la sala activa para programación inmediata
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
        {isPending ? "Creando..." : "Crear sala"}
      </button>
    </form>
  );
}
