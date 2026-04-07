import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getCurrentAdminSession } from "@/server/auth/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getCurrentAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-14">
      <section className="grid w-full gap-6">
        <AdminLoginForm />
      </section>
    </main>
  );
}
