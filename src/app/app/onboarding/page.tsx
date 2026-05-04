"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function OnboardingPage() {
  const [companyName, setCompanyName] = useState("")
  const [monthlyEstimate, setMonthlyEstimate] = useState("")
  const [alertThreshold, setAlertThreshold] = useState("100")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/workspace/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        monthlySpendEstimate: Math.round(parseFloat(monthlyEstimate) * 100),
        alertThreshold: Math.round(parseFloat(alertThreshold) * 100),
      }),
    })
    setLoading(false)
    if (res.ok) {
      router.push("/app/dashboard")
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to save settings" })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to SpendTracker</CardTitle>
          <CardDescription>
            Set up your workspace to get started tracking your startup spend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="company">Company name</Label>
              <Input id="company" placeholder="Acme Inc." value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimate">Estimated monthly software spend (USD)</Label>
              <Input id="estimate" type="number" placeholder="5000" value={monthlyEstimate} onChange={(e) => setMonthlyEstimate(e.target.value)} />
              <p className="text-sm text-muted-foreground">Your best guess — we will calculate exact spend from your imports</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">New vendor alert threshold (USD)</Label>
              <Input id="threshold" type="number" placeholder="100" value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)} />
              <p className="text-sm text-muted-foreground">Alert when a new vendor charges more than this amount</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Complete setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
