"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

export function UserLogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleLogout() {
    startTransition(async () => {
      await fetch("/api/usuario/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/35"
    >
      {isPending ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
