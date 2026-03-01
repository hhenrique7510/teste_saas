import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

/**
 * Rota de diagnóstico: repete exatamente o que o login faz (findUnique + compare)
 * e devolve os tempos de cada passo. Só funciona se LOGIN_DEBUG_SECRET estiver definido.
 *
 * Uso (em produção):
 * 1. Na Vercel, adiciona env LOGIN_DEBUG_SECRET=uma_string_secreta
 * 2. Redeploy
 * 3. POST /api/debug-login com body: { "email": "teu@email.com", "password": "tua_senha", "secret": "uma_string_secreta" }
 * 4. Ver resposta: findUserMs, compareMs, totalMs. Se findUserMs > 5000, o gargalo é a BD.
 * 5. Remove LOGIN_DEBUG_SECRET e esta rota depois de resolver.
 */
export const maxDuration = 15;

export async function POST(request: Request) {
  const secret = process.env.LOGIN_DEBUG_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "LOGIN_DEBUG_SECRET not set" }, { status: 404 });
  }

  const t0 = Date.now();
  let findUserMs = 0;
  let compareMs = 0;

  try {
    const body = await request.json().catch(() => ({}));
    if (body.secret !== secret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({
        error: "email and password required",
        findUserMs: 0,
        compareMs: 0,
        totalMs: Date.now() - t0,
      });
    }

    const t1 = Date.now();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, image: true, passwordHash: true },
    });
    findUserMs = Date.now() - t1;

    if (!user?.passwordHash) {
      return NextResponse.json({
        ok: false,
        error: "user not found or no password",
        findUserMs,
        compareMs: 0,
        totalMs: Date.now() - t0,
      });
    }

    const t2 = Date.now();
    const valid = await compare(password, user.passwordHash);
    compareMs = Date.now() - t2;

    return NextResponse.json({
      ok: valid,
      error: valid ? null : "invalid password",
      findUserMs,
      compareMs,
      totalMs: Date.now() - t0,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: String(e),
      findUserMs,
      compareMs,
      totalMs: Date.now() - t0,
    }, { status: 500 });
  }
}
