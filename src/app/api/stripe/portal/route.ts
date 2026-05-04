import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(_req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
  }
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
    const workspace = membership ? await prisma.workspace.findUnique({ where: { id: membership.workspaceId } }) : null
    if (!workspace?.stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer" }, { status: 404 })
    }
    const { getStripe } = await import("@/lib/stripe")
    const stripe = getStripe()
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: workspace.stripeCustomerId,
      return_url: (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000") + "/app/settings",
    })
    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error("[stripe/portal]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
