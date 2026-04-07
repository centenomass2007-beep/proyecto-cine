import { MovieStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminSession } from "@/server/auth/admin-session";
import { createMovie } from "@/server/services/admin.service";

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

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/peliculas");
    revalidatePath(`/peliculas/${movie.id}`);

    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible crear la película.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
