import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.log("[stripe/webhook] Stripe not configured, skipping")
    return NextResponse.json({ ok: true })
  }
  try {
    const { getStripe, STRIPE_WEBHOOK_SECRET } = await import("@/lib/stripe")
    const stripe = getStripe()
    const body = await req.text()
    const sig = req.headers.get("stripe-signature") ?? ""
    let event
    try {
      event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { metadata?: { workspaceId?: string }; customer?: string | null; subscription?: string | null }
      const workspaceId = session.metadata?.workspaceId
      if (workspaceId) {
        await prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            plan: "PRO",
            stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
            stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
          },
        })
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as { id: string; status: string; current_period_end: number }
      const workspace = await prisma.workspace.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      })
      if (workspace) {
        const isActive = ["active", "trialing"].includes(subscription.status)
        await prisma.workspace.update({
          where: { id: workspace.id },
          data: {
            plan: isActive ? "PRO" : "FREE",
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[stripe/webhook]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
