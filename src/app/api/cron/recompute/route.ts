import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { detectRecurring } from "@/lib/detection/recurring"
import { detectAnomalies } from "@/lib/detection/anomalies"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== "Bearer " + process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const workspaces = await prisma.workspace.findMany({ select: { id: true } })
    for (const ws of workspaces) {
      await detectRecurring(ws.id)
      await detectAnomalies(ws.id)
    }
    return NextResponse.json({ ok: true, processed: workspaces.length })
  } catch (err) {
    console.error("[cron/recompute]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
