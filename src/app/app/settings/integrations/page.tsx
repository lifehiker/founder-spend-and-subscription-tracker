import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"

export default async function IntegrationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) redirect("/app/onboarding")
  const workspace = await prisma.workspace.findUnique({ where: { id: membership.workspaceId } })
  const isPro = workspace?.plan === "PRO"

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader title="Integrations" />
      <div className="flex-1 p-6 max-w-2xl space-y-6">
        <Link href="/app/settings" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Back to settings
        </Link>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6" />
                <div>
                  <CardTitle>Gmail Receipt Sync</CardTitle>
                  <CardDescription>Automatically import receipts from your inbox</CardDescription>
                </div>
              </div>
              <Badge variant="secondary">Pro</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!isPro ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Gmail sync is available on the Pro plan. Connect your Gmail to automatically detect receipts and link them to vendors.
                </p>
                <Button asChild><Link href="/pricing">Upgrade to Pro</Link></Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Gmail sync will request read-only access to search for receipts. We only read emails that look like receipts — we never modify or delete emails.
                </p>
                <Button>Connect Gmail (coming soon)</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
