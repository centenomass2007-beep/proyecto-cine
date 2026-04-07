import { createHmac } from "crypto";

import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "cine_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

export type AdminSession = {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN";
  expiresAt: number;
};

type AdminIdentity = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

function getAdminAuthSecret() {
  const configuredSecret = process.env.ADMIN_AUTH_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "dev-admin-secret-change-me";
  }

  throw new Error("Falta configurar ADMIN_AUTH_SECRET para proteger el login admin.");
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getAdminAuthSecret()).update(encodedPayload).digest("base64url");
}

function parseAdminSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || signPayload(encodedPayload) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as AdminSession;

    if (
      !payload.userId ||
      !payload.email ||
      !payload.name ||
      payload.role !== UserRole.ADMIN ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function createAdminSession(identity: AdminIdentity) {
  if (identity.role !== UserRole.ADMIN) {
    throw new Error("Solo un usuario administrador puede abrir sesión en este panel.");
  }

  const payload: AdminSession = {
    userId: identity.id,
    name: identity.name,
    email: identity.email,
    role: UserRole.ADMIN,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return {
    token: `${encodedPayload}.${signPayload(encodedPayload)}`,
    expiresAt: payload.expiresAt,
  };
}

export async function getCurrentAdminSession() {
  const cookieStore = await cookies();

  return parseAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export function getAdminSessionCookie() {
  return ADMIN_SESSION_COOKIE;
}

export function getAdminSessionCookieOptions(expiresAt: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  };
}

export function getExpiredAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  };
}
