"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

export function ManualSpendEntryForm({ vendors }: { vendors: string[] }) {
  const [vendorName, setVendorName] = useState("")
  const [amount, setAmount] = useState("")
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"))
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vendorName || !amount) return
    setLoading(true)
    const res = await fetch("/api/manual-spend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorName, amountCents: Math.round(parseFloat(amount) * 100), month, notes }),
    })
    setLoading(false)
    if (res.ok) {
      toast({ title: "Entry saved" })
      setVendorName("")
      setAmount("")
      setNotes("")
      router.refresh()
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to save entry" })
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Add Spend Entry</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select value={vendorName} onValueChange={setVendorName}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  {vendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input id="month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input id="amount" type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" placeholder="e.g. GPT-4 API usage for feature X" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <Button type="submit" disabled={loading || !vendorName || !amount}>
            {loading ? "Saving..." : "Add Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
