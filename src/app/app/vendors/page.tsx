import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { AppHeader } from "@/components/app-header"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Store } from "lucide-react"

export default async function VendorsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) redirect("/app/onboarding")

  const vendors = await prisma.vendor.findMany({
    where: { workspaceId: membership.workspaceId },
    include: {
      transactions: { select: { amountCents: true } },
      recurringSubscriptions: { where: { status: "ACTIVE" } },
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader title="Vendors" />
      <div className="flex-1 p-6 overflow-auto">
        {vendors.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Store className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No vendors yet. Import a statement to see detected vendors.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => {
              const total = vendor.transactions.reduce((s, t) => s + t.amountCents, 0)
              const hasRecurring = vendor.recurringSubscriptions.length > 0
              const recurring = vendor.recurringSubscriptions[0]
              return (
                <Link key={vendor.id} href={"/app/vendors/" + vendor.id}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{vendor.name}</h3>
                          <p className="text-xs text-muted-foreground">{vendor.normalizedKey}</p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">{vendor.vendorType}</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-sm text-muted-foreground">{vendor.transactions.length} transactions</p>
                        <p className="font-semibold">{formatCurrency(total)}</p>
                      </div>
                      {hasRecurring && recurring && (
                        <div className="mt-2">
                          <Badge className="text-xs">{recurring.cadence} &bull; {formatCurrency(recurring.amountCentsAvg)}</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
