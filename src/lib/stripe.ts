import type Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!_stripe) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const StripeLib = require("stripe");
    _stripe = new StripeLib(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe!;
}

export const STRIPE_PRO_MONTHLY_PRICE_ID =
  process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "";
export const STRIPE_PRO_ANNUAL_PRICE_ID =
  process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
