/**
 * POST /api/usuario/registro
 *
 * Crea una cuenta nueva con rol CUSTOMER y abre sesión automáticamente.
 * Después del registro el cliente es redirigido a la cartelera desde el
 * formulario del frontend.
 */

import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { hashPassword } from "@/server/auth/password";
import {
  createUserSession,
  getUserSessionCookie,
  getUserSessionCookieOptions,
} from "@/server/auth/user-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    // ── Validación básica de campos ─────────────────────────
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Debes proporcionar nombre, correo y contraseña." },
        { status: 400 },
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { message: "El nombre debe tener al menos 2 caracteres." },
        { status: 400 },
      );
    }

    // ── Verificar que el email no esté en uso ───────────────
    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Este correo ya tiene una cuenta registrada. Usa la opción de iniciar sesión." },
        { status: 409 },
      );
    }

    // ── Crear usuario ───────────────────────────────────────
    // hashPassword lanza si la contraseña tiene menos de 8 chars.
    const newUser = await db.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        role: UserRole.CUSTOMER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // ── Abrir sesión automáticamente tras el registro ────────
    const session = createUserSession(newUser);

    const response = NextResponse.json(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 },
    );

    response.cookies.set(
      getUserSessionCookie(),
      session.token,
      getUserSessionCookieOptions(session.expiresAt),
    );

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No fue posible crear la cuenta.";

    return NextResponse.json({ message }, { status: 500 });
  }
}