import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const FREE_FEATURES = ["1 workspace", "Up to 2 statement uploads", "Up to 50 transactions", "5 vendors tracked", "Dashboard overview"]
const PRO_FEATURES = ["Unlimited statement uploads", "Up to 10,000 transactions", "Unlimited vendors", "Gmail receipt sync", "Anomaly detection alerts", "Monthly summary emails", "AI/API spend tracking", "Upcoming renewal view", "Export to CSV"]

export default function PricingPage() {
  const monthlyPrice = "$19"
  const annualPrice = "$190"
  return (
    <div className="py-24 container max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-muted-foreground text-lg">Start free. Upgrade when you need more.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>For founders getting started</CardDescription>
            <div className="mt-4"><span className="text-4xl font-bold">Free</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-green-500 shrink-0" />{f}</li>
              ))}
            </ul>
          </CardContent>
          <CardFooter><Button variant="outline" className="w-full" asChild><Link href="/register">Get started free</Link></Button></CardFooter>
        </Card>
        <Card className="border-primary relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="text-xs">Most popular</Badge></div>
          <CardHeader>
            <CardTitle className="text-2xl">Pro</CardTitle>
            <CardDescription>For serious operators</CardDescription>
            <div className="mt-4"><span className="text-4xl font-bold">{monthlyPrice}</span><span className="text-muted-foreground ml-2">/month</span></div>
            <p className="text-sm text-muted-foreground">Or {annualPrice}/year (save 17%)</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-primary shrink-0" />{f}</li>
              ))}
            </ul>
          </CardContent>
          <CardFooter><Button className="w-full" asChild><Link href="/register">Upgrade to Pro</Link></Button></CardFooter>
        </Card>
      </div>
    </div>
  )
}
