import { PrismaClient, UserRole } from "@prisma/client";

import { hashPassword } from "../src/server/auth/password";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL?.trim().toLowerCase() || "admin@cine.local";
  const adminName = process.env.ADMIN_DEFAULT_NAME?.trim() || "Administrador General";
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD?.trim() || "Admin12345!";

  await prisma.user.upsert({
    where: { id: "admin_demo_cine" },
    update: {
      name: adminName,
      email: adminEmail,
      role: UserRole.ADMIN,
      passwordHash: hashPassword(adminPassword),
    },
    create: {
      id: "admin_demo_cine",
      name: adminName,
      email: adminEmail,
      role: UserRole.ADMIN,
      passwordHash: hashPassword(adminPassword),
    },
  });

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
