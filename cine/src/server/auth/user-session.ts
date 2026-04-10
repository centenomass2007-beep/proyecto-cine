/**
 * user-session.ts
 *
 * Gestión de sesión para usuarios CUSTOMER.
 * Sigue exactamente el mismo patrón que admin-session.ts para mantener
 * coherencia interna y facilitar el mantenimiento futuro.
 *
 * Diferencias respecto a admin-session:
 *  - Cookie distinta: "cine_user_session"
 *  - Rol permitido: CUSTOMER (en lugar de ADMIN)
 *  - Secret propio: USER_AUTH_SECRET (con fallback dev)
 */

import { createHmac } from "crypto";

import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";

const USER_SESSION_COOKIE = "cine_user_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24 horas para usuarios

export type UserSession = {
  userId: string;
  name: string;
  email: string;
  role: "CUSTOMER";
  expiresAt: number;
};

type UserIdentity = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

function getUserAuthSecret() {
  const configuredSecret = process.env.USER_AUTH_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "dev-user-secret-change-me";
  }

  throw new Error("Falta configurar USER_AUTH_SECRET para proteger el login de usuarios.");
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getUserAuthSecret()).update(encodedPayload).digest("base64url");
}

function parseUserSessionToken(token: string | undefined): UserSession | null {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || signPayload(encodedPayload) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as UserSession;

    if (
      !payload.userId ||
      !payload.email ||
      !payload.name ||
      payload.role !== UserRole.CUSTOMER ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function createUserSession(identity: UserIdentity) {
  if (identity.role !== UserRole.CUSTOMER) {
    throw new Error("Solo usuarios cliente pueden abrir sesión con este método.");
  }

  const payload: UserSession = {
    userId: identity.id,
    name: identity.name,
    email: identity.email,
    role: UserRole.CUSTOMER,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return {
    token: `${encodedPayload}.${signPayload(encodedPayload)}`,
    expiresAt: payload.expiresAt,
  };
}

export async function getCurrentUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  return parseUserSessionToken(cookieStore.get(USER_SESSION_COOKIE)?.value);
}

export function getUserSessionCookie() {
  return USER_SESSION_COOKIE;
}

export function getUserSessionCookieOptions(expiresAt: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  };
}

export function getExpiredUserSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  };
}