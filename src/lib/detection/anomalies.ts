import { prisma } from "@/lib/db";

export async function detectAnomalies(workspaceId: string): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { alertPreference: true },
  });
  if (!workspace) return;

  const spikeThreshold = workspace.alertPreference?.spikeThresholdPct ?? 30;
  const newVendorThreshold = workspace.alertPreference?.newVendorThresholdCents ?? 5000;

  const vendors = await prisma.vendor.findMany({
    where: { workspaceId },
    include: {
      transactions: {
        orderBy: { date: "desc" },
        select: { id: true, date: true, amountCents: true },
      },
    },
  });

  for (const vendor of vendors) {
    const txns = vendor.transactions;
    if (txns.length === 0) continue;

    // Check for spike: latest transaction > average * (1 + threshold/100)
    if (txns.length >= 2) {
      const latest = txns[0];
      const historical = txns.slice(1);
      const avg = historical.reduce((sum, t) => sum + t.amountCents, 0) / historical.length;
      const spikeLimit = avg * (1 + spikeThreshold / 100);

      if (latest.amountCents > spikeLimit) {
        const existing = await prisma.anomaly.findFirst({
          where: {
            workspaceId,
            transactionId: latest.id,
            type: "SPIKE",
          },
        });
        if (!existing) {
          await prisma.anomaly.create({
            data: {
              workspaceId,
              vendorId: vendor.id,
              transactionId: latest.id,
              type: "SPIKE",
              severity: latest.amountCents > spikeLimit * 2 ? "HIGH" : "MEDIUM",
              explanation: `Charge of $${(latest.amountCents / 100).toFixed(2)} from ${vendor.name} is ${Math.round(((latest.amountCents - avg) / avg) * 100)}% above average of $${(avg / 100).toFixed(2)}.`,
            },
          });
        }
      }
    }

    // Check for new vendor above threshold
    if (txns.length === 1 && txns[0].amountCents >= newVendorThreshold) {
      const existing = await prisma.anomaly.findFirst({
        where: { workspaceId, vendorId: vendor.id, type: "NEW_VENDOR" },
      });
      if (!existing) {
        await prisma.anomaly.create({
          data: {
            workspaceId,
            vendorId: vendor.id,
            transactionId: txns[0].id,
            type: "NEW_VENDOR",
            severity: "LOW",
            explanation: `First charge detected from ${vendor.name}: $${(txns[0].amountCents / 100).toFixed(2)}.`,
          },
        });
      }
    }

    // Check for duplicates: same day, same amount
    const grouped = new Map<string, typeof txns[0][]>();
    for (const txn of txns) {
      const key = `${txn.date.toString().slice(0, 10)}_${txn.amountCents}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(txn);
    }

    for (const [, group] of grouped) {
      if (group.length >= 2) {
        const existing = await prisma.anomaly.findFirst({
          where: {
            workspaceId,
            transactionId: group[0].id,
            type: "DUPLICATE",
          },
        });
        if (!existing) {
          await prisma.anomaly.create({
            data: {
              workspaceId,
              vendorId: vendor.id,
              transactionId: group[0].id,
              type: "DUPLICATE",
              severity: "HIGH",
              explanation: `${group.length} duplicate charges of $${(group[0].amountCents / 100).toFixed(2)} from ${vendor.name} on the same day.`,
            },
          });
        }
      }
    }
  }
}
