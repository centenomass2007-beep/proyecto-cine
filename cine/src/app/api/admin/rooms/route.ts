import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminSession } from "@/server/auth/admin-session";
import { createRoom } from "@/server/services/admin.service";

export async function POST(request: Request) {
  try {
    const session = await getCurrentAdminSession();

    if (!session) {
      return NextResponse.json(
        { message: "Debes iniciar sesión como administrador para continuar." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const room = await createRoom(db, {
      name: String(body?.name ?? ""),
      description: String(body?.description ?? ""),
      rowsCount: Number(body?.rowsCount),
      columnsCount: Number(body?.columnsCount),
      isActive: body?.isActive !== false,
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible crear la sala.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
