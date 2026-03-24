import {
  MovieStatus,
  Prisma,
  PrismaClient,
  ScreeningStatus,
} from "@prisma/client";

const ROOM_ROW_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export type CreateMovieInput = {
  title: string;
  genre: string;
  durationMinutes: number;
  classification: string;
  imageUrl: string;
  heroImageUrl?: string;
  synopsis?: string;
  status: MovieStatus;
  isFeatured?: boolean;
};

export type UpdateMovieInput = CreateMovieInput;

export type CreateRoomInput = {
  name: string;
  description?: string;
  rowsCount: number;
  columnsCount: number;
  isActive?: boolean;
};

export type CreateScreeningInput = {
  movieId: number;
  roomId: number;
  showDate: string;
  showTime: string;
  price: number;
};

function normalizeText(value: string | undefined) {
  return value?.trim() || undefined;
}

function buildRoomSeats(roomId: number, rowsCount: number, columnsCount: number) {
  return Array.from({ length: rowsCount }, (_, rowIndex) => {
    const rowLabel = ROOM_ROW_LABELS[rowIndex];

    return Array.from({ length: columnsCount }, (_, columnIndex) => {
      const columnNumber = columnIndex + 1;

      return {
        roomId,
        rowLabel,
        columnNumber,
        label: `${rowLabel}${columnNumber}`,
      };
    });
  }).flat();
}

function buildScreeningDates(showDate: string, showTime: string) {
  const normalizedTime = `${showTime}:00`;
  const startsAt = new Date(`${showDate}T${normalizedTime}`);
  const dayStartsAt = new Date(`${showDate}T00:00:00`);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(dayStartsAt.getTime())) {
    throw new Error("La fecha u hora de la función no es válida.");
  }

  return {
    startsAt,
    dayStartsAt,
  };
}

export async function createMovie(prisma: PrismaClient, input: CreateMovieInput) {
  const title = normalizeText(input.title);
  const genre = normalizeText(input.genre);
  const classification = normalizeText(input.classification);
  const imageUrl = normalizeText(input.imageUrl);

  if (!title || !genre || !classification || !imageUrl) {
    throw new Error("Título, género, clasificación e imagen son obligatorios.");
  }

  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0) {
    throw new Error("La duración debe ser un número positivo.");
  }

  return prisma.movie.create({
    data: {
      title,
      genre,
      durationMinutes: input.durationMinutes,
      classification,
      imageUrl,
      heroImageUrl: normalizeText(input.heroImageUrl),
      synopsis: normalizeText(input.synopsis),
      status: input.status,
      isFeatured: Boolean(input.isFeatured),
    },
  });
}

export async function updateMovie(
  prisma: PrismaClient,
  movieId: number,
  input: UpdateMovieInput,
) {
  if (!Number.isInteger(movieId) || movieId <= 0) {
    throw new Error("La película que intentas actualizar no es válida.");
  }

  const title = normalizeText(input.title);
  const genre = normalizeText(input.genre);
  const classification = normalizeText(input.classification);
  const imageUrl = normalizeText(input.imageUrl);

  if (!title || !genre || !classification || !imageUrl) {
    throw new Error("Título, género, clasificación e imagen son obligatorios.");
  }

  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0) {
    throw new Error("La duración debe ser un número positivo.");
  }

  return prisma.movie.update({
    where: {
      id: movieId,
    },
    data: {
      title,
      genre,
      durationMinutes: input.durationMinutes,
      classification,
      imageUrl,
      heroImageUrl: normalizeText(input.heroImageUrl),
      synopsis: normalizeText(input.synopsis),
      status: input.status,
      isFeatured: Boolean(input.isFeatured),
    },
  });
}

export async function createRoom(prisma: PrismaClient, input: CreateRoomInput) {
  const name = normalizeText(input.name);
  const description = normalizeText(input.description);

  if (!name) {
    throw new Error("El nombre de la sala es obligatorio.");
  }

  if (!Number.isInteger(input.rowsCount) || input.rowsCount < 1 || input.rowsCount > 26) {
    throw new Error("Las filas deben estar entre 1 y 26.");
  }

  if (
    !Number.isInteger(input.columnsCount) ||
    input.columnsCount < 1 ||
    input.columnsCount > 30
  ) {
    throw new Error("Las columnas deben estar entre 1 y 30.");
  }

  const capacity = input.rowsCount * input.columnsCount;

  return prisma.$transaction(
    async (tx) => {
      const room = await tx.room.create({
        data: {
          name,
          description,
          rowsCount: input.rowsCount,
          columnsCount: input.columnsCount,
          capacity,
          isActive: input.isActive ?? true,
        },
      });

      await tx.seat.createMany({
        data: buildRoomSeats(room.id, input.rowsCount, input.columnsCount),
      });

      return tx.room.findUnique({
        where: { id: room.id },
        include: {
          _count: {
            select: {
              seats: true,
              screenings: true,
            },
          },
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function createScreening(prisma: PrismaClient, input: CreateScreeningInput) {
  if (!Number.isInteger(input.movieId) || input.movieId <= 0) {
    throw new Error("La película seleccionada no es válida.");
  }

  if (!Number.isInteger(input.roomId) || input.roomId <= 0) {
    throw new Error("La sala seleccionada no es válida.");
  }

  if (input.price <= 0) {
    throw new Error("El precio debe ser mayor a cero.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.showDate)) {
    throw new Error("La fecha debe tener el formato YYYY-MM-DD.");
  }

  if (!/^\d{2}:\d{2}$/.test(input.showTime)) {
    throw new Error("La hora debe tener el formato HH:MM.");
  }

  const { startsAt, dayStartsAt } = buildScreeningDates(input.showDate, input.showTime);

  try {
    return await prisma.$transaction(
      async (tx) => {
        const [movie, room] = await Promise.all([
          tx.movie.findUnique({
            where: { id: input.movieId },
            select: {
              id: true,
              status: true,
            },
          }),
          tx.room.findUnique({
            where: { id: input.roomId },
            select: {
              id: true,
              isActive: true,
              capacity: true,
            },
          }),
        ]);

        if (!movie || movie.status === MovieStatus.ARCHIVED) {
          throw new Error("La película no existe o está archivada.");
        }

        if (!room || !room.isActive) {
          throw new Error("La sala no existe o está inactiva.");
        }

        return tx.screening.create({
          data: {
            movieId: input.movieId,
            roomId: input.roomId,
            showDate: dayStartsAt,
            showTime: input.showTime,
            startsAt,
            price: new Prisma.Decimal(input.price),
            capacity: room.capacity,
            status: ScreeningStatus.SCHEDULED,
          },
          include: {
            movie: true,
            room: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Ya existe una función programada en esa sala para esa hora.");
    }

    throw error;
  }
}

export async function getAdminDashboard(prisma: PrismaClient) {
  const now = new Date();

  const [
    movieCount,
    publishedMovieCount,
    activeRoomCount,
    upcomingScreeningCount,
    soldSeatsCount,
    ticketMetrics,
    upcomingScreenings,
    rooms,
  ] = await Promise.all([
    prisma.movie.count(),
    prisma.movie.count({
      where: {
        status: MovieStatus.PUBLISHED,
      },
    }),
    prisma.room.count({
      where: {
        isActive: true,
      },
    }),
    prisma.screening.count({
      where: {
        startsAt: {
          gte: now,
        },
      },
    }),
    prisma.ticketSeat.count(),
    prisma.ticket.aggregate({
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.screening.findMany({
      orderBy: {
        startsAt: "asc",
      },
      take: 6,
      include: {
        movie: true,
        room: true,
        _count: {
          select: {
            ticketSeats: true,
          },
        },
      },
    }),
    prisma.room.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            seats: true,
            screenings: true,
          },
        },
      },
    }),
  ]);

  return {
    metrics: {
      movieCount,
      publishedMovieCount,
      activeRoomCount,
      upcomingScreeningCount,
      soldSeatsCount,
      revenue: Number(ticketMetrics._sum.totalAmount ?? 0),
      ticketsSold: ticketMetrics._count.id,
    },
    upcomingScreenings,
    rooms,
  };
}

export async function listMovies(prisma: PrismaClient) {
  return prisma.movie.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      _count: {
        select: {
          screenings: true,
        },
      },
    },
  });
}

export async function getMovieById(prisma: PrismaClient, movieId: number) {
  return prisma.movie.findUnique({
    where: {
      id: movieId,
    },
  });
}

export async function listRooms(prisma: PrismaClient) {
  return prisma.room.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          seats: true,
          screenings: true,
        },
      },
    },
  });
}

export async function listScreenings(prisma: PrismaClient) {
  return prisma.screening.findMany({
    orderBy: {
      startsAt: "desc",
    },
    include: {
      movie: true,
      room: true,
      _count: {
        select: {
          ticketSeats: true,
        },
      },
    },
  });
}

export async function getScreeningCreationLookups(prisma: PrismaClient) {
  const [movies, rooms] = await Promise.all([
    prisma.movie.findMany({
      where: {
        status: {
          not: MovieStatus.ARCHIVED,
        },
      },
      orderBy: {
        title: "asc",
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    }),
    prisma.room.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        capacity: true,
      },
    }),
  ]);

  return {
    movies,
    rooms,
  };
}
