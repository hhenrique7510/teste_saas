import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createMetricSchema = z.object({
  name: z.string().min(1),
  value: z.number(),
  type: z.string().min(1).optional().default("custom"),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    const where = type ? { type } : {};
    const metrics = await prisma.metric.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(metrics);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao listar métricas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createMetricSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const metric = await prisma.metric.create({
      data: {
        name: parsed.data.name,
        value: parsed.data.value,
        type: parsed.data.type,
      },
    });
    return NextResponse.json(metric);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao criar métrica" },
      { status: 500 }
    );
  }
}
