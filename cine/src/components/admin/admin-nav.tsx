"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/peliculas", label: "Películas" },
  { href: "/admin/salas", label: "Salas" },
  { href: "/admin/funciones", label: "Funciones" },
  { href: "/validacion", label: "Validación" },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2">
      {links.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-medium transition",
              isActive
                ? "border-[#E50914]/40 bg-[#E50914]/15 text-white"
                : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
