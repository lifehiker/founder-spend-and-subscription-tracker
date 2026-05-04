import * as React from "react"

interface NewRecurringProps {
  vendorName: string
  amountCents: number
  cadence: string
}

export function NewRecurringChargeEmail({ vendorName, amountCents, cadence }: NewRecurringProps) {
  return (
    <html>
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h1 style={{ color: "#1a1a1a" }}>New Recurring Charge Detected</h1>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
          <p style={{ margin: 0, fontWeight: "bold" }}>{vendorName}</p>
          <p style={{ margin: "8px 0 0", fontSize: "24px", fontWeight: "bold" }}>
            {(amountCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })} / {cadence.toLowerCase()}
          </p>
        </div>
        <p>A new recurring subscription was detected. Log in to review and categorize this vendor.</p>
        <p style={{ marginTop: "32px", color: "#6b7280", fontSize: "12px" }}>SpendTracker — founder spend visibility</p>
      </body>
    </html>
  )
}
