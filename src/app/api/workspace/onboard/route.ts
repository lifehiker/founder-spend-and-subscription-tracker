import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { companyName, monthlySpendEstimate, alertThreshold } = await req.json()
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 404 })
  await prisma.workspace.update({
    where: { id: membership.workspaceId },
    data: { companyName, monthlySpendEstimate, alertThreshold },
  })
  return NextResponse.json({ ok: true })
}
