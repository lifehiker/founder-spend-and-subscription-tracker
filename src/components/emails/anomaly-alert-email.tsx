import * as React from "react"

interface AnomalyAlertProps {
  vendorName: string
  explanation: string
  amountCents: number
  type: string
}

export function AnomalyAlertEmail({ vendorName, explanation, amountCents, type }: AnomalyAlertProps) {
  return (
    <html>
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h1 style={{ color: "#dc2626" }}>Spend Alert: {vendorName}</h1>
        <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
          <p style={{ margin: 0, fontWeight: "bold" }}>{type}: {vendorName}</p>
          <p style={{ margin: "8px 0 0" }}>{explanation}</p>
          <p style={{ margin: "8px 0 0", fontSize: "24px", fontWeight: "bold" }}>
            {(amountCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </p>
        </div>
        <p>Log in to SpendTracker to review this transaction.</p>
        <p style={{ marginTop: "32px", color: "#6b7280", fontSize: "12px" }}>SpendTracker — founder spend visibility</p>
      </body>
    </html>
  )
}
