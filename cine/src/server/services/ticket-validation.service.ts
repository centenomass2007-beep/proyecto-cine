import { PrismaClient, TicketStatus, UserRole } from "@prisma/client";

export async function validateTicketByCode(
  prisma: PrismaClient,
  code: string,
  employeeId: string,
) {
  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
    select: { id: true, role: true },
  });

  if (!employee || (employee.role !== UserRole.EMPLOYEE && employee.role !== UserRole.ADMIN)) {
    throw new Error("Solo un empleado autorizado puede validar tiquetes.");
  }

  const ticket = await prisma.ticket.findUnique({
    where: { code },
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

  if (!ticket) {
    throw new Error("No existe un tiquete con ese codigo.");
  }

  if (ticket.status === TicketStatus.USED) {
    throw new Error("El tiquete ya fue validado anteriormente.");
  }

  const updatedTicket = await prisma.ticket.updateMany({
    where: {
      id: ticket.id,
      status: TicketStatus.ACTIVE,
    },
    data: {
      status: TicketStatus.USED,
      validatedAt: new Date(),
      validatedById: employee.id,
    },
  });

  if (updatedTicket.count === 0) {
    throw new Error("El tiquete ya fue validado por otro empleado.");
  }

  return prisma.ticket.findUnique({
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
      validatedBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });
}
