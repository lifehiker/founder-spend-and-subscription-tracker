import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart2, Bell, FileText, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="py-24 md:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">Built for founders &amp; indie hackers</Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Know every dollar your startup spends
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your card statements. Get a clean view of recurring SaaS subscriptions, AI API costs, and unusual charges &mdash; without accounting software.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base px-8">
              <Link href="/register">Start for free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">No credit card required &bull; Free tier available</p>
        </div>
      </section>

      <section className="py-20 container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything you need to control your spend</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Stop guessing what you&apos;re paying for. Get clarity in minutes, not hours.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: FileText, title: "CSV Statement Import", desc: "Upload any bank or card statement. We parse it and normalize the merchants automatically." },
            { icon: BarChart2, title: "Recurring Detection", desc: "Automatically identifies your monthly, annual, and weekly recurring subscriptions." },
            { icon: Bell, title: "Anomaly Alerts", desc: "Get notified when a charge spikes above normal, a new vendor appears, or a duplicate charge hits." },
            { icon: Zap, title: "AI/API Cost Tracking", desc: "Track OpenAI, Anthropic, AWS, Vercel, and Replicate spend alongside your SaaS tools." },
            { icon: Shield, title: "Vendor Normalization", desc: "Messy merchant names like TST*OPENAI or AMZN*AWS become clean, grouped vendor entries." },
            { icon: BarChart2, title: "Plain-English Summaries", desc: "Monthly digest of what you spent, what changed, and what to watch for next month." },
          ].map((f) => (
            <Card key={f.title} className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <f.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{f.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to get clarity on your spend?</h2>
          <p className="text-muted-foreground mb-8">Join founders who track their startup costs in one dashboard.</p>
          <Button size="lg" asChild>
            <Link href="/register">Start tracking for free <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
