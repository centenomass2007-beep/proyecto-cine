import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-white/45">Administración</p>
          <h1 className="mt-3 text-5xl text-white">Panel de operación del cine</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">
            Gestiona la cartelera, crea salas, programa funciones y supervisa ocupación y ventas
            desde un flujo unificado.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Volver a la landing
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[28px] border border-white/10 bg-white/5 p-4">
          <div className="mb-4 rounded-2xl border border-white/10 bg-[#181818] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Flujo</p>
            <p className="mt-3 text-sm leading-6 text-white/70">
              1. Crea películas.
              <br />
              2. Configura salas.
              <br />
              3. Programa funciones.
              <br />
              4. Vende y valida tiquetes.
            </p>
          </div>
          <AdminNav />
        </aside>

        <section>{children}</section>
      </div>
    </main>
  );
}
