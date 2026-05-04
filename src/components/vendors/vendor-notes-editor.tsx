"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function VendorNotesEditor({ vendorId, initialNotes }: { vendorId: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes ?? "")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/vendors/${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    })
    setSaving(false)
    if (res.ok) {
      toast({ title: "Notes saved" })
    } else {
      toast({ variant: "destructive", title: "Failed to save notes" })
    }
  }

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Add notes about this vendor (contract details, renewal date, account manager contact...)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        className="resize-none"
      />
      <Button onClick={handleSave} disabled={saving} size="sm">
        {saving ? "Saving..." : "Save notes"}
      </Button>
    </div>
  )
}
