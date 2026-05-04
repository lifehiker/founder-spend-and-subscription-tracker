import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  vendorName: z.string().min(1),
  amountCents: z.number().int().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  notes: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
    if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 404 })
    const body = await req.json()
    const data = schema.parse(body)
    const entry = await prisma.manualSpendEntry.create({
      data: { workspaceId: membership.workspaceId, ...data, source: "MANUAL" },
    })
    return NextResponse.json({ ok: true, id: entry.id })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
