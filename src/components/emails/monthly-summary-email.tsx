import * as React from "react"

interface MonthSummaryProps {
  month: string
  totalCents: number
  topVendors: Array<{ name: string; amountCents: number }>
  anomalyCount: number
}

export function MonthlySummaryEmail({ month, totalCents, topVendors, anomalyCount }: MonthSummaryProps) {
  return (
    <html>
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h1 style={{ color: "#1a1a1a" }}>Monthly Spend Summary: {month}</h1>
        <p style={{ fontSize: "32px", fontWeight: "bold", color: "#6d28d9" }}>
          {(totalCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </p>
        <h2>Top Vendors</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ textAlign: "left", padding: "8px 0" }}>Vendor</th>
              <th style={{ textAlign: "right", padding: "8px 0" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {topVendors.slice(0, 5).map((v) => (
              <tr key={v.name} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 0" }}>{v.name}</td>
                <td style={{ textAlign: "right", padding: "8px 0" }}>
                  {(v.amountCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {anomalyCount > 0 && (
          <p style={{ color: "#dc2626", marginTop: "16px" }}>
            {anomalyCount} anomalies were detected this month. Log in to review.
          </p>
        )}
        <p style={{ marginTop: "32px", color: "#6b7280", fontSize: "12px" }}>SpendTracker — founder spend visibility</p>
      </body>
    </html>
  )
}
