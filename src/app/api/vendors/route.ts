import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { canAddVendor } from "@/lib/billing/entitlements"

const schema = z.object({
  name: z.string().min(1),
  normalizedKey: z.string().min(1),
  vendorType: z.enum(["SAAS", "AI_API", "CLOUD", "OTHER"]).default("SAAS"),
  website: z.string().url().optional(),
  notes: z.string().optional(),
})

export async function GET(_req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) return NextResponse.json([], { status: 200 })
  const vendors = await prisma.vendor.findMany({ where: { workspaceId: membership.workspaceId }, orderBy: { name: "asc" } })
  return NextResponse.json(vendors)
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
    if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 404 })
    const workspace = await prisma.workspace.findUnique({ where: { id: membership.workspaceId } })
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 })
    if (!(await canAddVendor(workspace.id, workspace.plan))) {
      return NextResponse.json({ error: "Vendor limit reached" }, { status: 403 })
    }
    const body = await req.json()
    const data = schema.parse(body)
    const vendor = await prisma.vendor.create({
      data: { workspaceId: workspace.id, ...data },
    })
    return NextResponse.json(vendor)
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
