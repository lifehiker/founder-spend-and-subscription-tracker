import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
  }
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { priceId } = await req.json()
    const { getStripe } = await import("@/lib/stripe")
    const stripe = getStripe()
    const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
    const workspace = membership ? await prisma.workspace.findUnique({ where: { id: membership.workspaceId } }) : null
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000") + "/app/settings?upgraded=true",
      cancel_url: (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000") + "/pricing",
      customer_email: session.user.email ?? undefined,
      metadata: { workspaceId: workspace?.id ?? "", userId: session.user.id },
    })
    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error("[stripe/checkout]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
