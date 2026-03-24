import Link from "next/link";
import { notFound } from "next/navigation";

import { CinemaShowcase } from "@/components/cinema/cinema-showcase";
import { db } from "@/lib/db";
import { formatCurrency, formatDateTime, formatOccupancy } from "@/lib/formatters";
import { getScreeningPurchaseContext } from "@/server/services/catalog.service";

type PageProps = {
  params: Promise<{
    screeningId: string;
  }>;
};

export default async function ScreeningPurchasePage({ params }: PageProps) {
  const { screeningId } = await params;
  const context = await getScreeningPurchaseContext(db, Number(screeningId));

  if (!context) {
    notFound();
  }

  const { screening, seats, soldSeatsCount } = context;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href={`/peliculas/${screening.movieId}`}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Volver a la película
          </Link>
          <p className="mt-6 text-sm uppercase tracking-[0.35em] text-white/45">Compra de boletas</p>
          <h1 className="mt-3 text-5xl text-white">{screening.movie.title}</h1>
          <p className="mt-4 text-sm leading-7 text-white/65">
            {screening.room.name} · {formatDateTime(screening.startsAt)} ·{" "}
            {formatCurrency(screening.price)}
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/70">
          {soldSeatsCount} / {screening.capacity} sillas vendidas ·{" "}
          {formatOccupancy(soldSeatsCount, screening.capacity)}
        </div>
      </div>

      <section className="mt-8">
        <CinemaShowcase
          screeningId={screening.id}
          seats={seats}
          pricePerSeat={Number(screening.price)}
          screeningLabel={formatDateTime(screening.startsAt)}
          movieTitle={screening.movie.title}
          roomLabel={screening.room.name}
        />
      </section>
    </main>
  );
}
