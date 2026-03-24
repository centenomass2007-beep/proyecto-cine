import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { id: "emp_demo_cine" },
    update: {
      name: "Empleado Demo",
      email: "operacion@cine.local",
      role: UserRole.EMPLOYEE,
    },
    create: {
      id: "emp_demo_cine",
      name: "Empleado Demo",
      email: "operacion@cine.local",
      role: UserRole.EMPLOYEE,
    },
  });

  const room = await prisma.room.upsert({
    where: { name: "Sala 1" },
    update: {
      description: "Sala principal para operación base",
      rowsCount: 10,
      columnsCount: 15,
      capacity: 150,
      isActive: true,
    },
    create: {
      name: "Sala 1",
      description: "Sala principal para operación base",
      rowsCount: 10,
      columnsCount: 15,
      capacity: 150,
      isActive: true,
    },
  });

  const rows = Array.from({ length: room.rowsCount }, (_, index) =>
    String.fromCharCode(65 + index),
  );

  const seats = rows.flatMap((rowLabel) =>
    Array.from({ length: 15 }, (_, index) => {
      const columnNumber = index + 1;

      return {
        roomId: room.id,
        rowLabel,
        columnNumber,
        label: `${rowLabel}${columnNumber}`,
      };
    }),
  );

  await prisma.seat.createMany({
    data: seats,
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
