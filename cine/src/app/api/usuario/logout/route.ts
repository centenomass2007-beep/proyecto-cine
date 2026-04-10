import { NextResponse } from "next/server";

import {
  getUserSessionCookie,
  getExpiredUserSessionCookieOptions,
} from "@/server/auth/user-session";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.set(getUserSessionCookie(), "", getExpiredUserSessionCookieOptions());

  return response;
}
