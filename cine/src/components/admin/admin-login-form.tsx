"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "No fue posible iniciar sesión.");
        return;
      }

      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
    >
      <p className="text-sm uppercase tracking-[0.4em] text-white/45">Acceso privado</p>
      <h1 className="mt-3 text-5xl text-white">Login administrador</h1>
      <p className="mt-4 text-sm leading-7 text-white/65">
        Ingresa con la cuenta administradora para gestionar la cartelera, salas y funciones.
      </p>

      <div className="mt-8 grid gap-4">
        <label className="grid gap-2 text-sm text-white/75">
          Correo
          <input
            name="email"
            type="email"
            defaultValue="admin@cine.local"
            required
            className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
          />
        </label>

        <label className="grid gap-2 text-sm text-white/75">
          Contraseña
          <input
            name="password"
            type="password"
            defaultValue="Admin12345!"
            required
            className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
          />
        </label>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-[#E50914]/30 bg-[#E50914]/10 px-4 py-3 text-sm text-white">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#E50914] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#F6121D] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
      >
        {isPending ? "Ingresando..." : "Entrar al panel"}
      </button>

      <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-[#181818] p-4 text-sm text-white/55">
        Credenciales demo iniciales: <code className="text-white">admin@cine.local</code> /
        <code className="ml-1 text-white">Admin12345!</code>
      </div>
    </form>
  );
}
