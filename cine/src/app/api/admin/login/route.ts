import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  createAdminSession,
  getAdminSessionCookie,
  getAdminSessionCookieOptions,
} from "@/server/auth/admin-session";
import { verifyPassword } from "@/server/auth/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { message: "Debes indicar correo y contraseña para ingresar." },
        { status: 400 },
      );
    }

    const admin = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });

    if (
      !admin ||
      admin.role !== UserRole.ADMIN ||
      !verifyPassword(password, admin.passwordHash)
    ) {
      return NextResponse.json(
        { message: "Las credenciales del administrador no son válidas." },
        { status: 401 },
      );
    }

    const session = createAdminSession(admin);
    const response = NextResponse.json(
      {
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      { status: 200 },
    );

    response.cookies.set(
      getAdminSessionCookie(),
      session.token,
      getAdminSessionCookieOptions(session.expiresAt),
    );

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No fue posible iniciar sesión en el panel.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
