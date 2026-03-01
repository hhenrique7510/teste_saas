import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";
import { z } from "zod";

const bodySchema = z.object({
  priceId: z.string().min(1).optional(),
  plan: z.enum(["monthly", "yearly"]).optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  const plan = parsed.success && parsed.data.plan ? parsed.data.plan : "monthly";
  const priceId =
    parsed.success && parsed.data.priceId
      ? parsed.data.priceId
      : STRIPE_PLANS[plan].priceId;

  if (!priceId) {
    return NextResponse.json(
      { error: "STRIPE_PRICE_ID_MONTHLY ou STRIPE_PRICE_ID_YEARLY não configurado no .env" },
      { status: 400 }
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe não está configurado" },
      { status: 503 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const params: { customer?: string; customer_email?: string } = user.stripeCustomerId
      ? { customer: user.stripeCustomerId }
      : { customer_email: session.user.email };

    const baseUrl = (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/plano?success=1`,
      cancel_url: `${baseUrl}/dashboard/plano?canceled=1`,
      ...params,
      subscription_data: {
        metadata: { userId: session.user.id },
      },
      allow_promotion_codes: true,
    });

    if (!user.stripeCustomerId && checkoutSession.customer) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          stripeCustomerId:
            typeof checkoutSession.customer === "string"
              ? checkoutSession.customer
              : checkoutSession.customer.id,
        },
      });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e: unknown) {
    const err = e as { code?: string; param?: string; message?: string };
    if (err?.code === "resource_missing" && err?.param?.includes("price")) {
      return NextResponse.json(
        {
          error:
            "Preço não encontrado no Stripe. Confirme que o Price ID no .env está correto, foi criado em Test mode (se usa sk_test_) e que o preço não está arquivado.",
        },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao criar sessão de checkout" },
      { status: 500 }
    );
  }
}
