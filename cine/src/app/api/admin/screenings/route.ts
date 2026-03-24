import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { createScreening } from "@/server/services/admin.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const screening = await createScreening(db, {
      movieId: Number(body?.movieId),
      roomId: Number(body?.roomId),
      showDate: String(body?.showDate ?? ""),
      showTime: String(body?.showTime ?? ""),
      price: Number(body?.price),
    });

    return NextResponse.json(screening, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible crear la función.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
