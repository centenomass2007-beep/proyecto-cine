import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { validateTicketByCode } from "@/server/services/ticket-validation.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = String(body?.code ?? "").trim().toUpperCase();
    const employeeId = String(body?.employeeId ?? "").trim();

    if (!code || !employeeId) {
      return NextResponse.json(
        {
          message: "Debes enviar el codigo del tiquete y el empleado que valida.",
        },
        { status: 400 },
      );
    }

    const ticket = await validateTicketByCode(db, code, employeeId);

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible validar el tiquete.";

    return NextResponse.json({ message }, { status: 409 });
  }
}
