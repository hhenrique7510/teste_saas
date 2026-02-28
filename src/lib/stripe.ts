import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { typescript: true });
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? getStripe()
  : (null as unknown as Stripe);

export const STRIPE_PLANS = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY,
    name: "Mensal",
  },
  yearly: {
    priceId: process.env.STRIPE_PRICE_ID_YEARLY,
    name: "Anual",
  },
} as const;
