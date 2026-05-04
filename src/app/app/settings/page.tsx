import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { AlertPreferencesForm } from "@/components/settings/alert-preferences-form"
import { DeleteDataButton } from "@/components/settings/delete-data-button"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) redirect("/app/onboarding")
  const workspace = await prisma.workspace.findUnique({ where: { id: membership.workspaceId }, include: { alertPreference: true } })
  if (!workspace) redirect("/app/onboarding")
  const isPro = workspace.plan === "PRO"

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader title="Settings" />
      <div className="flex-1 p-6 max-w-3xl space-y-6">
        <Tabs defaultValue="billing">
          <TabsList>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="billing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan & Billing</CardTitle>
                <CardDescription>Manage your subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current plan</p>
                    <p className="text-sm text-muted-foreground">{isPro ? "Pro — unlimited uploads and features" : "Free — 2 uploads, 50 transactions, 5 vendors"}</p>
                  </div>
                  <Badge variant={isPro ? "default" : "secondary"}>{workspace.plan}</Badge>
                </div>
                {isPro && workspace.stripeCurrentPeriodEnd && (
                  <p className="text-sm text-muted-foreground">Renews on {formatDate(workspace.stripeCurrentPeriodEnd)}</p>
                )}
                {!isPro && (
                  <Button asChild>
                    <Link href="/pricing">Upgrade to Pro</Link>
                  </Button>
                )}
                {isPro && (
                  <form method="POST" action="/api/stripe/portal">
                    <Button variant="outline" type="submit">Manage billing</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Preferences</CardTitle>
                <CardDescription>Configure when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                {!isPro ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">Email alerts are a Pro feature</p>
                    <Button asChild><Link href="/pricing">Upgrade to Pro</Link></Button>
                  </div>
                ) : (
                  <AlertPreferencesForm initialPrefs={{
                  emailNewRecurring: workspace.alertPreference?.emailNewRecurring ?? true,
                  emailSpike: workspace.alertPreference?.emailSpike ?? true,
                  emailMonthlySummary: workspace.alertPreference?.emailMonthlySummary ?? true,
                  spikeThresholdPct: workspace.alertPreference?.spikeThresholdPct ?? 30,
                  newVendorThresholdCents: workspace.alertPreference?.newVendorThresholdCents ?? 5000,
                }} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gmail Integration</CardTitle>
                <CardDescription>Sync receipts from your Gmail inbox</CardDescription>
              </CardHeader>
              <CardContent>
                {!isPro ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">Gmail sync is a Pro feature</p>
                    <Button asChild><Link href="/pricing">Upgrade to Pro</Link></Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted-foreground mb-4">Connect your Gmail to automatically import receipts</p>
                    <Button asChild variant="outline"><Link href="/app/settings/integrations">Configure Gmail</Link></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="border border-destructive/30 rounded-lg p-6 space-y-3">
          <h3 className="font-semibold text-destructive">Danger Zone</h3>
          <p className="text-sm text-muted-foreground">Delete all imported data including transactions, vendors, and detected subscriptions. Your account and billing will remain active.</p>
          <DeleteDataButton />
        </div>
      </div>
    </div>
  )
}
