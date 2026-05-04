import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const workspaceId = membership.workspaceId

  await prisma.anomaly.deleteMany({ where: { workspaceId } })
  await prisma.manualSpendEntry.deleteMany({ where: { workspaceId } })
  await prisma.emailReceipt.deleteMany({ where: { workspaceId } })
  await prisma.recurringSubscription.deleteMany({ where: { workspaceId } })
  await prisma.transaction.deleteMany({ where: { workspaceId } })
  await prisma.statementUpload.deleteMany({ where: { workspaceId } })
  await prisma.vendor.deleteMany({ where: { workspaceId } })

  return NextResponse.json({ ok: true })
}
