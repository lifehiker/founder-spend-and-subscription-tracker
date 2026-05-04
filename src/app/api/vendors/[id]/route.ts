import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const vendor = await prisma.vendor.findFirst({ where: { id, workspaceId: membership.workspaceId } })
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(vendor)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const body = await req.json()
  await prisma.vendor.updateMany({
    where: { id, workspaceId: membership.workspaceId },
    data: { notes: body.notes, website: body.website, vendorType: body.vendorType },
  })
  return NextResponse.json({ ok: true })
}
