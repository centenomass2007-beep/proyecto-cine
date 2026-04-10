import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getCurrentAdminSession } from "@/server/auth/admin-session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getCurrentAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="relative min-h-screen bg-[#070707] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.2),_transparent_40%),linear-gradient(180deg,rgba(12,12,12,0.96),rgba(7,7,7,0.98))]" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-6 py-14">
        <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.45em] text-white/45">CineScope</p>
              <h1 className="text-5xl font-semibold text-white">Bienvenido a CineScope</h1>
              <p className="max-w-xl text-base leading-7 text-white/65">
                Usa el panel de administrador para gestionar salas, películas y funciones.
                Inicia sesión para administrar el contenido de la cartelera con la misma estética oscura y rojo brillante.
              </p>
            </div>
            <div className="grid gap-4 rounded-3xl border border-white/10 bg-[#111111]/80 p-6">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.35em] text-white/45">Acceso seguro</p>
                <p className="text-white/70">Tu sesión se crea con un token seguro y se guarda en cookie de administrador.</p>
              </div>
              <div className="grid gap-3 rounded-3xl border border-[#E50914]/20 bg-[#000]/30 p-4 text-sm text-white/70">
                <p>Credenciales demo:</p>
                <p>
                  <span className="font-semibold text-white">admin@cine.local</span> /
                  <span className="font-semibold text-white">Admin12345!</span>
                </p>
              </div>
            </div>
          </section>
          <section className="grid items-center">
            <AdminLoginForm />
          </section>
        </div>
      </div>
    </main>
  );
}
