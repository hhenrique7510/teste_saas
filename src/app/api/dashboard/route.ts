import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const [userCount, metrics, metricsByType] = await Promise.all([
      prisma.user.count(),
      prisma.metric.findMany({
        orderBy: { createdAt: "asc" },
        take: 500,
      }),
      prisma.metric.groupBy({
        by: ["type"],
        _sum: { value: true },
        _count: true,
      }),
    ]);

    const revenueMonth = metrics
      .filter((m) => m.type === "revenue")
      .reduce((acc, m) => acc + m.value, 0);

    const last7 = metrics.slice(-7);
    const seriesByPeriod = last7.length
      ? last7.map((m) => ({
          period: m.createdAt.toISOString().slice(0, 10),
          value: m.value,
        }))
      : [
          { period: "2024-01-01", value: 0 },
          { period: "2024-01-02", value: 0 },
        ];

    const metricTrend = metricsByType.map((g) => ({
      name: g.type || "outro",
      value: g._sum.value ?? 0,
    }));

    return NextResponse.json({
      kpis: {
        totalUsers: userCount,
        revenueMonth,
        conversions: metrics.filter((m) => m.type === "conversions").length || 0,
      },
      seriesByPeriod,
      metricTrend: metricTrend.length ? metricTrend : [{ name: "N/A", value: 0 }],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao carregar dashboard" },
      { status: 500 }
    );
  }
}
