import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { purchaseTicket } from "@/server/services/ticket-purchase.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const screeningId = Number(body?.screeningId);
    const rawUserId = String(body?.userId ?? "").trim();
    const customerName = String(body?.customerName ?? "").trim();
    const customerEmail = String(body?.customerEmail ?? "")
      .trim()
      .toLowerCase();
    const seatIds = Array.isArray(body?.seatIds)
      ? body.seatIds
          .map((seatId: unknown) => Number(seatId))
          .filter((seatId: number) => Number.isInteger(seatId) && seatId > 0)
      : [];

    if (!Number.isInteger(screeningId) || screeningId <= 0 || seatIds.length === 0) {
      return NextResponse.json(
        {
          message: "Debes enviar screeningId y seatIds válidos.",
        },
        { status: 400 },
      );
    }

    let userId = rawUserId;

    if (!userId) {
      if (!customerName || !customerEmail) {
        return NextResponse.json(
          {
            message: "Debes indicar nombre y correo para completar la compra.",
          },
          { status: 400 },
        );
      }

      const customer = await db.user.upsert({
        where: {
          email: customerEmail,
        },
        update: {
          name: customerName,
        },
        create: {
          name: customerName,
          email: customerEmail,
          role: UserRole.CUSTOMER,
        },
        select: {
          id: true,
        },
      });

      userId = customer.id;
    }

    const ticket = await purchaseTicket(db, {
      screeningId,
      userId,
      seatIds,
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No fue posible completar la compra.";

    return NextResponse.json({ message }, { status: 409 });
  }
}
