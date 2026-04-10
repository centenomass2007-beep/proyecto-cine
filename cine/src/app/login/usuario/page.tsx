import { redirect } from "next/navigation";

import { UserAuthForm } from "@/components/usuario/user-auth-form";
import { getCurrentUserSession } from "@/server/auth/user-session";

export const dynamic = "force-dynamic";

export default async function UserLoginPage() {
  // Si ya tiene sesión activa, redirigir directamente a la cartelera
  const session = await getCurrentUserSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-14">
      <section className="grid w-full gap-6">
        <UserAuthForm />
      </section>
    </main>
  );
}
