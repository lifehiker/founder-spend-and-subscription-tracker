import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const pref = await prisma.alertPreference.findUnique({ where: { workspaceId: membership.workspaceId } })
  return NextResponse.json(pref ?? {
    emailNewRecurring: true,
    emailSpike: true,
    emailMonthlySummary: true,
    spikeThresholdPct: 30,
    newVendorThresholdCents: 5000,
  })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const pref = await prisma.alertPreference.upsert({
    where: { workspaceId: membership.workspaceId },
    create: {
      workspaceId: membership.workspaceId,
      emailNewRecurring: body.emailNewRecurring ?? true,
      emailSpike: body.emailSpike ?? true,
      emailMonthlySummary: body.emailMonthlySummary ?? true,
      spikeThresholdPct: body.spikeThresholdPct ?? 30,
      newVendorThresholdCents: body.newVendorThresholdCents ?? 5000,
    },
    update: {
      ...(body.emailNewRecurring !== undefined && { emailNewRecurring: body.emailNewRecurring }),
      ...(body.emailSpike !== undefined && { emailSpike: body.emailSpike }),
      ...(body.emailMonthlySummary !== undefined && { emailMonthlySummary: body.emailMonthlySummary }),
      ...(body.spikeThresholdPct !== undefined && { spikeThresholdPct: body.spikeThresholdPct }),
      ...(body.newVendorThresholdCents !== undefined && { newVendorThresholdCents: body.newVendorThresholdCents }),
    },
  })
  return NextResponse.json(pref)
}
