import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const ms = Date.now() - start;
    return NextResponse.json({
      ok: true,
      db: "connected",
      latencyMs: ms,
    });
  } catch (e) {
    const ms = Date.now() - start;
    console.error("Health check failed:", e);
    return NextResponse.json(
      { ok: false, db: "error", latencyMs: ms, error: String(e) },
      { status: 503 }
    );
  }
}
