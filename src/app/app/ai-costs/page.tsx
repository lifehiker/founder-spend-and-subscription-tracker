import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { AppHeader } from "@/components/app-header"
import { ManualSpendEntryForm } from "@/components/vendors/manual-spend-entry-form"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const AI_VENDORS = ["OpenAI", "Anthropic", "Replicate", "AWS", "Vercel", "Google Cloud", "Other"]

export default async function AiCostsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) redirect("/app/onboarding")

  const entries = await prisma.manualSpendEntry.findMany({
    where: { workspaceId: membership.workspaceId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader title="AI & API Costs" />
      <div className="flex-1 p-6 space-y-6 max-w-4xl">
        <div>
          <h2 className="text-xl font-semibold mb-1">Track AI & API Spend</h2>
          <p className="text-muted-foreground">Manually log your monthly AI API costs to include them in dashboard totals.</p>
        </div>
        <ManualSpendEntryForm vendors={AI_VENDORS} />
        {entries.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Recent Entries</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.vendorName}</TableCell>
                      <TableCell className="text-muted-foreground">{e.month}</TableCell>
                      <TableCell className="text-muted-foreground">{e.notes ?? "-"}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(e.amountCents)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
