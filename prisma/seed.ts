import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("demo123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Utilizador Demo",
      passwordHash,
    },
  });

  const types = ["revenue", "users", "conversions"];
  const baseDate = new Date();
  baseDate.setMonth(baseDate.getMonth() - 1);

  for (let i = 0; i < 14; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const type = types[i % types.length];
    const value = type === "revenue" ? 500 + Math.random() * 1500 : 10 + Math.floor(Math.random() * 50);
    await prisma.metric.create({
      data: {
        name: `${type} ${date.toISOString().slice(0, 10)}`,
        value: Math.round(value * 100) / 100,
        type,
        createdAt: date,
      },
    });
  }

  console.log("Seed concluído. Utilizador demo: demo@example.com / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
