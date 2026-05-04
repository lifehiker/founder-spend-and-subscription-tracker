"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface AlertPrefs {
  emailNewRecurring: boolean
  emailSpike: boolean
  emailMonthlySummary: boolean
  spikeThresholdPct: number
  newVendorThresholdCents: number
}

export function AlertPreferencesForm({ initialPrefs }: { initialPrefs: AlertPrefs }) {
  const [prefs, setPrefs] = useState(initialPrefs)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function handleSave() {
    setSaving(true)
    const res = await fetch("/api/settings/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    })
    setSaving(false)
    if (res.ok) {
      toast({ title: "Preferences saved" })
    } else {
      toast({ variant: "destructive", title: "Failed to save preferences" })
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Email Notifications</h3>
        {[
          { key: "emailNewRecurring" as const, label: "New recurring charge detected" },
          { key: "emailSpike" as const, label: "Unusual spend spike" },
          { key: "emailMonthlySummary" as const, label: "Monthly spend summary" },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs[item.key]}
              onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm">{item.label}</span>
          </label>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Thresholds</h3>
        <div className="space-y-2">
          <Label htmlFor="spike-threshold">Spike threshold (%)</Label>
          <Input
            id="spike-threshold"
            type="number"
            value={prefs.spikeThresholdPct}
            onChange={(e) => setPrefs({ ...prefs, spikeThresholdPct: parseInt(e.target.value) || 30 })}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">Alert when a charge is this % above the vendor average</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-vendor-threshold">New vendor alert threshold (USD)</Label>
          <Input
            id="new-vendor-threshold"
            type="number"
            value={prefs.newVendorThresholdCents / 100}
            onChange={(e) => setPrefs({ ...prefs, newVendorThresholdCents: Math.round((parseFloat(e.target.value) || 50) * 100) })}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">Alert when a new vendor charges more than this amount</p>
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save preferences"}
      </Button>
    </div>
  )
}
