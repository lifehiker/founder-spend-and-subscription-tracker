interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log("[email] RESEND_API_KEY not set, skipping email send");
    return;
  }
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM ?? "noreply@example.com";

  const { error } = await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    console.error("[email] Failed to send:", error);
  }
}

export async function sendAnomalyAlert(params: {
  to: string;
  vendorName: string;
  explanation: string;
  amount: number;
}) {
  await sendEmail({
    to: params.to,
    subject: `Spend Alert: Unusual charge from ${params.vendorName}`,
    html: `
      <h2>Unusual Charge Detected</h2>
      <p><strong>Vendor:</strong> ${params.vendorName}</p>
      <p><strong>Amount:</strong> $${(params.amount / 100).toFixed(2)}</p>
      <p><strong>Details:</strong> ${params.explanation}</p>
      <p>Log in to your dashboard to review this transaction.</p>
    `,
  });
}

export async function sendNewRecurringAlert(params: {
  to: string;
  vendorName: string;
  amountCents: number;
  cadence: string;
}) {
  await sendEmail({
    to: params.to,
    subject: `New Recurring Charge: ${params.vendorName}`,
    html: `
      <h2>New Recurring Subscription Detected</h2>
      <p>We detected a new recurring charge from <strong>${params.vendorName}</strong>.</p>
      <p><strong>Amount:</strong> $${(params.amountCents / 100).toFixed(2)} / ${params.cadence.toLowerCase()}</p>
      <p>Log in to your dashboard to review.</p>
    `,
  });
}

export async function sendMonthlySummary(params: {
  to: string;
  month: string;
  totalCents: number;
  topVendors: Array<{ name: string; amountCents: number }>;
  anomalyCount: number;
}) {
  const vendorRows = params.topVendors
    .slice(0, 5)
    .map(
      (v) =>
        `<tr><td>${v.name}</td><td>$${(v.amountCents / 100).toFixed(2)}</td></tr>`
    )
    .join("");

  await sendEmail({
    to: params.to,
    subject: `Monthly Spend Summary — ${params.month}`,
    html: `
      <h2>Monthly Spend Summary: ${params.month}</h2>
      <p><strong>Total Spend:</strong> $${(params.totalCents / 100).toFixed(2)}</p>
      <h3>Top Vendors</h3>
      <table border="1" cellpadding="8">
        <tr><th>Vendor</th><th>Amount</th></tr>
        ${vendorRows}
      </table>
      ${params.anomalyCount > 0 ? `<p><strong>${params.anomalyCount} anomalies</strong> were detected this month. Log in to review.</p>` : ""}
    `,
  });
}
