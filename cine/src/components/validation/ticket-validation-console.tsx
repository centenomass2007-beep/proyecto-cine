"use client";

import * as React from "react";

type ValidatedTicket = {
  code: string;
  status: "ACTIVE" | "USED";
  validatedAt: string | null;
  screening: {
    movie: {
      title: string;
    };
    room: {
      name: string;
    };
  };
  details: Array<{
    seat: {
      label: string;
    };
  }>;
  validatedBy: {
    id: string;
    name: string;
    role: string;
  } | null;
};

const validatedAtFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function TicketValidationConsole() {
  const [code, setCode] = React.useState("");
  const [employeeId, setEmployeeId] = React.useState("emp_demo_cine");
  const [result, setResult] = React.useState<ValidatedTicket | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/tickets/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: code.trim().toUpperCase(),
            employeeId: employeeId.trim(),
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload.message ?? "No fue posible validar el tiquete.");
          return;
        }

        setCode(payload.code);
        setResult(payload);
      } catch {
        setError("No fue posible comunicarse con el backend de validación.");
      }
    });
  }

  return (
    <section className="w-full rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
      <p className="text-sm uppercase tracking-[0.4em] text-white/50">Ingreso</p>
      <h1 className="mt-3 text-5xl text-white">Validación de tiquetes</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
        El lector QR puede escribir directamente sobre el campo de código. Al enviar, el backend
        valida el tiquete y lo marca como
        <span className="mx-1 rounded-full bg-[#E50914]/20 px-2 py-1 text-xs font-semibold text-white">
          USED
        </span>
        una sola vez.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="ticket-code" className="text-sm font-medium text-white/80">
            Código del tiquete
          </label>
          <input
            id="ticket-code"
            name="ticket-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            autoFocus
            placeholder="CINE-AB12CD34EF56"
            className="h-14 w-full rounded-2xl border border-white/10 bg-[#171717] px-4 text-white outline-none transition placeholder:text-white/30 focus:border-[#E50914]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="employee-id" className="text-sm font-medium text-white/80">
            ID del empleado
          </label>
          <input
            id="employee-id"
            name="employee-id"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            placeholder="emp_demo_cine"
            className="h-14 w-full rounded-2xl border border-white/10 bg-[#171717] px-4 text-white outline-none transition placeholder:text-white/30 focus:border-[#E50914]"
          />
          <p className="text-xs text-white/45">
            Para pruebas rápidas puedes usar el empleado demo <code className="text-white">emp_demo_cine</code>.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#E50914] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#F6121D] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
        >
          {isPending ? "Validando..." : "Consultar y validar"}
        </button>
      </form>

      {(error || result) && (
        <div
          className={`mt-8 rounded-3xl border p-5 text-sm ${
            error
              ? "border-[#E50914]/25 bg-[#E50914]/10 text-white"
              : "border-emerald-400/20 bg-emerald-400/10 text-white"
          }`}
        >
          {error ? (
            <p>{error}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Código</span>
                <span className="font-semibold text-white">{result?.code}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Película</span>
                <span className="text-right font-medium text-white">
                  {result?.screening.movie.title}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Sala</span>
                <span className="text-right font-medium text-white">
                  {result?.screening.room.name}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Asientos</span>
                <span className="text-right font-medium text-white">
                  {result?.details.map((detail) => detail.seat.label).join(", ")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Estado</span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                  {result?.status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Validado por</span>
                <span className="text-right font-medium text-white">
                  {result?.validatedBy?.name ?? result?.validatedBy?.id}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Hora</span>
                <span className="text-right font-medium text-white">
                  {result?.validatedAt
                    ? validatedAtFormatter.format(new Date(result.validatedAt))
                    : "Sin registro"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-[#171717] p-5 text-sm text-white/60">
        Endpoint operativo: <code className="text-white">POST /api/tickets/validate</code>
      </div>
    </section>
  );
}
