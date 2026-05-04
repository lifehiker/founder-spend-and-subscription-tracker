import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { AppHeader } from "@/components/app-header"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { MonthlySpendChart } from "@/components/dashboard/monthly-spend-chart"
import { UpcomingRenewalsList } from "@/components/dashboard/upcoming-renewals-list"
import { AnomalyList } from "@/components/dashboard/anomaly-list"
import { NewRecurringList } from "@/components/dashboard/new-recurring-list"
import { addDays, startOfMonth, subMonths, format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) redirect("/app/onboarding")

  const workspace = await prisma.workspace.findUnique({ where: { id: membership.workspaceId } })
  if (!workspace) redirect("/app/onboarding")

  const [transactions, anomalies, recurringList, uploadCount] = await Promise.all([
    prisma.transaction.findMany({ where: { workspaceId: workspace.id }, orderBy: { date: "desc" } }),
    prisma.anomaly.findMany({ where: { workspaceId: workspace.id, resolvedAt: null }, include: { vendor: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.recurringSubscription.findMany({ where: { workspaceId: workspace.id, status: "ACTIVE" }, include: { vendor: true }, orderBy: { amountCentsAvg: "desc" } }),
    prisma.statementUpload.count({ where: { workspaceId: workspace.id } }),
  ])

  const totalMonthlyRecurring = recurringList.filter(r => r.cadence === "MONTHLY").reduce((sum, r) => sum + r.amountCentsAvg, 0)

  const now = new Date()
  const thirtyDaysFromNow = addDays(now, 30)
  const upcomingRenewals = recurringList.filter(r => r.nextExpectedDate && r.nextExpectedDate <= thirtyDaysFromNow && r.nextExpectedDate >= now)

  const monthlyData: { month: string; amount: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i))
    const monthEnd = startOfMonth(subMonths(now, i - 1))
    const monthTxns = transactions.filter(t => {
      const d = new Date(t.date)
      return d >= monthStart && d < monthEnd
    })
    monthlyData.push({
      month: format(monthStart, "MMM yy"),
      amount: monthTxns.reduce((sum, t) => sum + t.amountCents, 0),
    })
  }

  const hasData = uploadCount > 0

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader title="Dashboard" />
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {!hasData && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <h3 className="font-semibold text-lg mb-2">Welcome to SpendTracker</h3>
            <p className="text-muted-foreground mb-4">Import your first statement to start tracking your startup spend.</p>
            <Button asChild><Link href="/app/import">Import CSV Statement</Link></Button>
          </div>
        )}
        <SummaryCards
          totalMonthlyRecurring={totalMonthlyRecurring}
          totalTransactions={transactions.length}
          anomalyCount={anomalies.length}
          upcomingRenewals={upcomingRenewals.length}
        />
        <MonthlySpendChart data={monthlyData} />
        <div className="grid lg:grid-cols-2 gap-6">
          <AnomalyList anomalies={anomalies.map(a => ({ ...a, createdAt: new Date(a.createdAt) }))} />
          <NewRecurringList items={recurringList.map(r => ({ ...r, vendor: { name: r.vendor.name, id: r.vendor.id } }))} />
        </div>
        <UpcomingRenewalsList renewals={upcomingRenewals.map(r => ({ id: r.id, vendorName: r.vendor.name, amountCents: r.amountCentsAvg, nextExpectedDate: r.nextExpectedDate, cadence: r.cadence }))} />
      </div>
    </div>
  )
}
