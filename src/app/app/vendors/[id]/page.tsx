import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { AppHeader } from "@/components/app-header"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { VendorNotesEditor } from "@/components/vendors/vendor-notes-editor"

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) redirect("/app/onboarding")

  const vendor = await prisma.vendor.findFirst({
    where: { id, workspaceId: membership.workspaceId },
    include: {
      transactions: { orderBy: { date: "desc" }, take: 50 },
      recurringSubscriptions: { where: { status: "ACTIVE" } },
    },
  })

  if (!vendor) notFound()

  const totalSpend = vendor.transactions.reduce((s, t) => s + t.amountCents, 0)
  const avgSpend = vendor.transactions.length > 0 ? totalSpend / vendor.transactions.length : 0
  const recurring = vendor.recurringSubscriptions[0]

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader title={vendor.name} />
      <div className="flex-1 p-6 overflow-auto space-y-6">
        <Link href="/app/vendors" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Back to vendors
        </Link>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spend</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatCurrency(totalSpend)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg per Charge</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatCurrency(avgSpend)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Transactions</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{vendor.transactions.length}</p></CardContent>
          </Card>
        </div>
        {recurring && (
          <Card>
            <CardHeader><CardTitle>Recurring Subscription</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-4">
              <Badge>{recurring.cadence}</Badge>
              <span className="text-lg font-semibold">{formatCurrency(recurring.amountCentsAvg)}/period</span>
              {recurring.nextExpectedDate && (
                <span className="text-sm text-muted-foreground">Next: {formatDate(recurring.nextExpectedDate)}</span>
              )}
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendor.transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(t.date)}</TableCell>
                    <TableCell className="text-sm">{t.descriptionRaw}</TableCell>
                    <TableCell className="text-right font-medium text-sm">{formatCurrency(t.amountCents)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <VendorNotesEditor vendorId={vendor.id} initialNotes={vendor.notes} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
