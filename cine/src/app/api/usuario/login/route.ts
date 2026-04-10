/**
 * POST /api/usuario/login
 *
 * Autentica un usuario CUSTOMER por email + contraseña.
 * Devuelve una cookie de sesión httpOnly idéntica en estructura
 * a la del admin pero con rol CUSTOMER.
 */

import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  createUserSession,
  getUserSessionCookie,
  getUserSessionCookieOptions,
} from "@/server/auth/user-session";
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

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });

    // SEGURIDAD: mismo mensaje genérico para usuario no encontrado y contraseña inválida
    // Esto evita enumeración de usuarios (user enumeration attack).
    if (
      !user ||
      user.role !== UserRole.CUSTOMER ||
      !verifyPassword(password, user.passwordHash)
    ) {
      return NextResponse.json(
        { message: "Las credenciales no son válidas." },
        { status: 401 },
      );
    }

    const session = createUserSession(user);
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 },
    );

    response.cookies.set(
      getUserSessionCookie(),
      session.token,
      getUserSessionCookieOptions(session.expiresAt),
    );

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No fue posible iniciar sesión.";

    return NextResponse.json({ message }, { status: 500 });
  }
}