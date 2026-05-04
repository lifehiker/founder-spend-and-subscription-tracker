import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { AppHeader } from "@/components/app-header"
import { CsvUploadForm } from "@/components/import/csv-upload-form"
import { FREE_LIMITS } from "@/lib/billing/entitlements"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ImportPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } })
  if (!membership) redirect("/app/onboarding")
  const workspace = await prisma.workspace.findUnique({ where: { id: membership.workspaceId } })
  if (!workspace) redirect("/app/onboarding")

  const uploadCount = await prisma.statementUpload.count({ where: { workspaceId: workspace.id } })
  const isPro = workspace.plan === "PRO"
  const canUpload = isPro || uploadCount < FREE_LIMITS.uploads

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader title="Import CSV" />
      <div className="flex-1 p-6 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">Import a Bank Statement</h2>
          <p className="text-muted-foreground">Upload a CSV export from your bank or credit card to automatically detect vendors and recurring charges.</p>
        </div>
        {!isPro && (
          <div className="mb-4 p-3 rounded-lg border bg-muted/30 flex items-center justify-between">
            <p className="text-sm">{uploadCount} / {FREE_LIMITS.uploads} uploads used on free plan</p>
            <Button size="sm" asChild><Link href="/pricing">Upgrade to Pro</Link></Button>
          </div>
        )}
        {canUpload ? (
          <CsvUploadForm />
        ) : (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Upload limit reached</CardTitle>
              <CardDescription>You have used all {FREE_LIMITS.uploads} statement uploads on the free plan.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild><Link href="/pricing">Upgrade to Pro for unlimited uploads</Link></Button>
            </CardContent>
          </Card>
        )}
        <div className="mt-8">
          <h3 className="font-medium mb-3">Supported formats</h3>
          <div className="flex flex-wrap gap-2">
            {["Chase", "Bank of America", "American Express", "Wells Fargo", "Generic CSV"].map((bank) => (
              <Badge key={bank} variant="secondary">{bank}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
