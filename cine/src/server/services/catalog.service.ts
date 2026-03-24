import { MovieStatus, PrismaClient, ScreeningStatus } from "@prisma/client";

export async function getPublicHomepageData(prisma: PrismaClient) {
  const now = new Date();

  const movies = await prisma.movie.findMany({
    where: {
      status: MovieStatus.PUBLISHED,
    },
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    include: {
      _count: {
        select: {
          screenings: true,
        },
      },
      screenings: {
        where: {
          status: ScreeningStatus.SCHEDULED,
          startsAt: {
            gte: now,
          },
        },
        orderBy: {
          startsAt: "asc",
        },
        take: 1,
        include: {
          room: true,
        },
      },
    },
  });

  const featuredMovie = movies.find((movie) => movie.isFeatured) ?? movies[0] ?? null;
  const groupedByGenre = new Map<string, typeof movies>();

  for (const movie of movies) {
    const current = groupedByGenre.get(movie.genre) ?? [];
    current.push(movie);
    groupedByGenre.set(movie.genre, current);
  }

  return {
    featuredMovie,
    genreRows: Array.from(groupedByGenre.entries()).map(([genre, items]) => ({
      genre,
      movies: items,
    })),
  };
}

export async function getPublicMovieDetail(prisma: PrismaClient, movieId: number) {
  const now = new Date();

  return prisma.movie.findFirst({
    where: {
      id: movieId,
      status: MovieStatus.PUBLISHED,
    },
    include: {
      screenings: {
        where: {
          status: ScreeningStatus.SCHEDULED,
          startsAt: {
            gte: now,
          },
        },
        orderBy: {
          startsAt: "asc",
        },
        include: {
          room: true,
          _count: {
            select: {
              ticketSeats: true,
            },
          },
        },
      },
    },
  });
}

export async function getScreeningPurchaseContext(
  prisma: PrismaClient,
  screeningId: number,
) {
  const screening = await prisma.screening.findUnique({
    where: {
      id: screeningId,
    },
    include: {
      movie: true,
      room: true,
    },
  });

  if (!screening) {
    return null;
  }

  const [seats, soldSeatEntries] = await Promise.all([
    prisma.seat.findMany({
      where: {
        roomId: screening.roomId,
        isActive: true,
      },
      orderBy: [{ rowLabel: "asc" }, { columnNumber: "asc" }],
    }),
    prisma.ticketSeat.findMany({
      where: {
        screeningId,
      },
      select: {
        seatId: true,
      },
    }),
  ]);

  const occupiedSeatIds = new Set(soldSeatEntries.map((entry) => entry.seatId));

  return {
    screening,
    seats: seats.map((seat) => ({
      id: String(seat.id),
      rowLabel: seat.rowLabel,
      columnNumber: seat.columnNumber,
      label: seat.label,
      state: occupiedSeatIds.has(seat.id)
        ? ("occupied" as const)
        : ("available" as const),
    })),
    soldSeatsCount: soldSeatEntries.length,
  };
}
