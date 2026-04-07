import { NextResponse } from "next/server";

import {
  getAdminSessionCookie,
  getExpiredAdminSessionCookieOptions,
} from "@/server/auth/admin-session";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.set(getAdminSessionCookie(), "", getExpiredAdminSessionCookieOptions());

  return response;
}
