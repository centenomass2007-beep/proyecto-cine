"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

type AuthMode = "login" | "register";

export function UserAuthForm() {
  const router = useRouter();
  const [mode, setMode] = React.useState<AuthMode>("login");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setError(null);

    startTransition(async () => {
      const endpoint = mode === "login" ? "/api/usuario/login" : "/api/usuario/registro";
      const body: Record<string, string> = {
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      };
      if (mode === "register") {
        body.name = String(formData.get("name"));
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "No fue posible completar la acción.");
        return;
      }

      // Tras login/registro exitoso → ir a la cartelera
      router.push("/");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
    >
      <p className="text-sm uppercase tracking-[0.4em] text-white/45">Acceso de usuario</p>
      <h1 className="mt-3 text-5xl text-white">
        {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </h1>
      <p className="mt-4 text-sm leading-7 text-white/65">
        {mode === "login"
          ? "Ingresa con tu cuenta para comprar y gestionar tus boletas."
          : "Crea tu cuenta para acceder a la cartelera y comprar boletas."}
      </p>

      {/* Selector de modo */}
      <div className="mt-6 flex rounded-2xl border border-white/10 bg-[#181818] p-1">
        <button
          type="button"
          onClick={() => { setMode("login"); setError(null); }}
          className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
            mode === "login"
              ? "bg-[#E50914] text-white"
              : "text-white/55 hover:text-white"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => { setMode("register"); setError(null); }}
          className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
            mode === "register"
              ? "bg-[#E50914] text-white"
              : "text-white/55 hover:text-white"
          }`}
        >
          Registrarse
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {mode === "register" && (
          <label className="grid gap-2 text-sm text-white/75">
            Nombre completo
            <input
              name="name"
              type="text"
              required
              placeholder="Tu nombre"
              className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
            />
          </label>
        )}

        <label className="grid gap-2 text-sm text-white/75">
          Correo electrónico
          <input
            name="email"
            type="email"
            required
            placeholder="correo@ejemplo.com"
            className="h-12 rounded-2xl border border-white/10 bg-[#181818] px-4 text-white outline-none transition focus:border-[#E50914]"
          />
        </label>

        <label className="grid gap-2 text-sm text-white/75">
          Contraseña
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
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
        {isPending
          ? mode === "login" ? "Ingresando..." : "Creando cuenta..."
          : mode === "login" ? "Ingresar" : "Crear cuenta y entrar"}
      </button>

      <p className="mt-6 text-center text-sm text-white/45">
        Después de ingresar serás dirigido a la cartelera.
      </p>
    </form>
  );
}