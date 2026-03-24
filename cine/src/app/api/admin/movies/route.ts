import { MovieStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { createMovie } from "@/server/services/admin.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const movie = await createMovie(db, {
      title: String(body?.title ?? ""),
      genre: String(body?.genre ?? ""),
      durationMinutes: Number(body?.durationMinutes),
      classification: String(body?.classification ?? ""),
      imageUrl: String(body?.imageUrl ?? ""),
      heroImageUrl: String(body?.heroImageUrl ?? ""),
      synopsis: String(body?.synopsis ?? ""),
      status: Object.values(MovieStatus).includes(body?.status as MovieStatus)
        ? (body.status as MovieStatus)
        : MovieStatus.DRAFT,
      isFeatured: Boolean(body?.isFeatured),
    });

    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible crear la película.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
