import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { parse } from "csv-parse/sync"
import { normalizeMerchant, getVendorDisplayName } from "@/lib/normalization/merchant"
import { detectRecurring } from "@/lib/detection/recurring"
import { detectAnomalies } from "@/lib/detection/anomalies"
import { canUpload, canAddVendor, canAddTransaction } from "@/lib/billing/entitlements"
import { parseISO, isValid } from "date-fns"

interface CsvRow {
  [key: string]: string
}

function detectColumns(headers: string[]): { date: string; description: string; amount: string } | null {
  const lower = headers.map(h => h.toLowerCase().trim())
  const dateCol = headers[lower.findIndex(h => h.includes("date") || h.includes("transaction date") || h.includes("posted"))] 
  const descCol = headers[lower.findIndex(h => h.includes("description") || h.includes("merchant") || h.includes("payee") || h.includes("name"))]
  const amountCol = headers[lower.findIndex(h => h.includes("amount") || h.includes("debit") || h.includes("charge"))]
  if (!dateCol || !descCol || !amountCol) return null
  return { date: dateCol, description: descCol, amount: amountCol }
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.\-()]/g, "")
  // Handle parentheses as negative
  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    return Math.round(parseFloat(cleaned.slice(1, -1)) * 100)
  }
  const val = parseFloat(cleaned)
  return isNaN(val) ? 0 : Math.round(Math.abs(val) * 100)
}

function parseDate(raw: string): Date | null {
  const formats = [
    raw,
    raw.replace(/\//g, "-"),
    raw.replace(/-/g, "/"),
  ]
  for (const fmt of formats) {
    const d = new Date(fmt)
    if (isValid(d) && d.getFullYear() > 2000) return d
    const iso = parseISO(fmt)
    if (isValid(iso) && iso.getFullYear() > 2000) return iso
  }
  return null
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
    if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 404 })

    const workspace = await prisma.workspace.findUnique({ where: { id: membership.workspaceId } })
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 })

    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    if (!(await canUpload(workspace.id, workspace.plan))) {
      return NextResponse.json({ error: "Upload limit reached. Upgrade to Pro." }, { status: 403 })
    }

    const text = await file.text()
    const rows: CsvRow[] = parse(text, { columns: true, skip_empty_lines: true, trim: true, bom: true })
    
    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 })
    }

    const headers = Object.keys(rows[0])
    const cols = detectColumns(headers)
    
    if (!cols) {
      return NextResponse.json({ error: "Could not detect CSV columns. Expected: Date, Description, Amount" }, { status: 400 })
    }

    const upload = await prisma.statementUpload.create({
      data: {
        workspaceId: workspace.id,
        filename: file.name,
        status: "PROCESSING",
        columnMapping: JSON.stringify(cols),
        rowCount: rows.length,
      },
    })

    let imported = 0
    const vendorCache = new Map<string, string>()

    for (const row of rows) {
      const rawDate = row[cols.date]
      const rawDesc = row[cols.description]
      const rawAmount = row[cols.amount]
      
      if (!rawDate || !rawDesc || !rawAmount) continue
      
      const date = parseDate(rawDate)
      if (!date) continue
      
      const amountCents = parseAmount(rawAmount)
      if (amountCents <= 0) continue

      if (!(await canAddTransaction(workspace.id, workspace.plan))) break

      const normalizedKey = normalizeMerchant(rawDesc)
      let vendorId: string | null = null

      if (!vendorCache.has(normalizedKey)) {
        let vendor = await prisma.vendor.findFirst({
          where: { workspaceId: workspace.id, normalizedKey },
        })
        if (!vendor && (await canAddVendor(workspace.id, workspace.plan))) {
          vendor = await prisma.vendor.create({
            data: {
              workspaceId: workspace.id,
              name: getVendorDisplayName(normalizedKey),
              normalizedKey,
              vendorType: "SAAS",
            },
          })
        }
        if (vendor) vendorCache.set(normalizedKey, vendor.id)
      }

      vendorId = vendorCache.get(normalizedKey) ?? null

      await prisma.transaction.create({
        data: {
          workspaceId: workspace.id,
          statementUploadId: upload.id,
          date,
          descriptionRaw: rawDesc,
          merchantRaw: rawDesc.substring(0, 100),
          amountCents,
          currency: "USD",
          normalizedVendorId: vendorId,
          sourceType: "STATEMENT",
        },
      })
      imported++
    }

    await prisma.statementUpload.update({
      where: { id: upload.id },
      data: { status: "COMPLETE", rowCount: imported },
    })

    // Run detection async (fire and forget)
    detectRecurring(workspace.id).catch(console.error)
    detectAnomalies(workspace.id).catch(console.error)

    return NextResponse.json({ ok: true, count: imported })
  } catch (err) {
    console.error("[import/csv]", err)
    return NextResponse.json({ error: "Import failed" }, { status: 500 })
  }
}
