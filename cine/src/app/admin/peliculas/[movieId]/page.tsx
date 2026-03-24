import { notFound } from "next/navigation";

import { EditMovieForm } from "@/components/admin/edit-movie-form";
import { db } from "@/lib/db";
import { getMovieById } from "@/server/services/admin.service";

type PageProps = {
  params: Promise<{
    movieId: string;
  }>;
};

export default async function AdminMovieEditPage({ params }: PageProps) {
  const { movieId } = await params;
  const movie = await getMovieById(db, Number(movieId));

  if (!movie) {
    notFound();
  }

  return <EditMovieForm movie={movie} />;
}
