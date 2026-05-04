import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { AppHeader } from "@/components/app-header"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function TransactionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) redirect("/app/onboarding")

  const transactions = await prisma.transaction.findMany({
    where: { workspaceId: membership.workspaceId },
    include: { normalizedVendor: true },
    orderBy: { date: "desc" },
    take: 200,
  })

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader title="Transactions" />
      <div className="flex-1 p-6 overflow-auto">
        {transactions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground mb-4">No transactions yet. Import a CSV statement to get started.</p>
            <Button asChild><Link href="/app/import">Import CSV</Link></Button>
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(t.date)}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm">{t.descriptionRaw}</TableCell>
                    <TableCell>
                      {t.normalizedVendor ? (
                        <Link href={"/app/vendors/" + t.normalizedVendorId} className="text-primary hover:underline text-sm">{t.normalizedVendor.name}</Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">{t.merchantRaw}</span>
                      )}
                    </TableCell>
                    <TableCell>{t.category && <Badge variant="secondary" className="text-xs">{t.category}</Badge>}</TableCell>
                    <TableCell className="text-right font-medium text-sm">{formatCurrency(t.amountCents)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  )
}
