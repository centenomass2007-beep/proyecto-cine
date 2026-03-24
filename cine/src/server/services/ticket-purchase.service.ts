import {
  Prisma,
  PrismaClient,
  ScreeningStatus,
  TicketStatus,
} from "@prisma/client";
import { randomUUID } from "crypto";

export type PurchaseTicketInput = {
  screeningId: number;
  userId: string;
  seatIds: number[];
};

function buildTicketCode() {
  return `CINE-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

export async function purchaseTicket(prisma: PrismaClient, input: PurchaseTicketInput) {
  const uniqueSeatIds = [...new Set(input.seatIds)];

  if (uniqueSeatIds.length === 0) {
    throw new Error("Debes seleccionar al menos un asiento.");
  }

  if (uniqueSeatIds.length !== input.seatIds.length) {
    throw new Error("No puedes repetir asientos dentro de la misma compra.");
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
        const screening = await tx.screening.findUnique({
          where: { id: input.screeningId },
          select: {
            id: true,
            roomId: true,
            capacity: true,
            price: true,
            status: true,
          },
        });

        if (!screening || screening.status !== ScreeningStatus.SCHEDULED) {
          throw new Error("La funcion no existe o ya no esta disponible.");
        }

        const seats = await tx.seat.findMany({
          where: {
            id: { in: uniqueSeatIds },
            roomId: screening.roomId,
            isActive: true,
          },
          select: { id: true, label: true },
        });

        if (seats.length !== uniqueSeatIds.length) {
          throw new Error("Uno o mas asientos no existen.");
        }

        const reservedSeats = await tx.ticketSeat.findMany({
          where: {
            screeningId: input.screeningId,
            seatId: { in: uniqueSeatIds },
          },
          select: { seatId: true },
        });

        if (reservedSeats.length > 0) {
          throw new Error("Uno o mas asientos ya fueron vendidos para esta funcion.");
        }

        const ticket = await tx.ticket.create({
          data: {
            code: buildTicketCode(),
            userId: input.userId,
            screeningId: input.screeningId,
            status: TicketStatus.ACTIVE,
            seatsCount: uniqueSeatIds.length,
            totalAmount: screening.price.mul(uniqueSeatIds.length),
          },
        });

        await tx.ticketSeat.createMany({
          data: uniqueSeatIds.map((seatId) => ({
            ticketId: ticket.id,
            screeningId: input.screeningId,
            seatId,
          })),
        });

        const soldSeats = await tx.ticketSeat.count({
          where: { screeningId: input.screeningId },
        });

        if (soldSeats >= screening.capacity) {
          await tx.screening.update({
            where: { id: input.screeningId },
            data: { status: ScreeningStatus.SOLD_OUT },
          });
        }

        return tx.ticket.findUnique({
          where: { id: ticket.id },
          include: {
            details: {
              include: {
                seat: true,
              },
            },
            screening: {
              include: {
                movie: true,
                room: true,
              },
            },
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
      throw new Error("Otro usuario tomo uno de los asientos antes de confirmar.");
    }

    throw error;
  }
}
