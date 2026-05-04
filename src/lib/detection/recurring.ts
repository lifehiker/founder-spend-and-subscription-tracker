import { prisma } from "@/lib/db";
import { addMonths, addWeeks, addYears, differenceInDays } from "date-fns";

function detectCadence(dates: Date[]): { cadence: string; intervalDays: number } {
  if (dates.length < 2) return { cadence: "UNKNOWN", intervalDays: 0 };

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const intervals: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    intervals.push(differenceInDays(sorted[i], sorted[i - 1]));
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  if (avgInterval >= 25 && avgInterval <= 35) return { cadence: "MONTHLY", intervalDays: 30 };
  if (avgInterval >= 6 && avgInterval <= 8) return { cadence: "WEEKLY", intervalDays: 7 };
  if (avgInterval >= 340 && avgInterval <= 390) return { cadence: "YEARLY", intervalDays: 365 };

  return { cadence: "UNKNOWN", intervalDays: Math.round(avgInterval) };
}

function estimateNextDate(lastDate: Date, cadence: string): Date | null {
  switch (cadence) {
    case "MONTHLY":
      return addMonths(lastDate, 1);
    case "WEEKLY":
      return addWeeks(lastDate, 1);
    case "YEARLY":
      return addYears(lastDate, 1);
    default:
      return null;
  }
}

export async function detectRecurring(workspaceId: string): Promise<void> {
  // Get all vendors for this workspace that have transactions
  const vendors = await prisma.vendor.findMany({
    where: { workspaceId },
    include: {
      transactions: {
        orderBy: { date: "asc" },
        select: { id: true, date: true, amountCents: true },
      },
    },
  });

  for (const vendor of vendors) {
    const txns = vendor.transactions;
    if (txns.length < 2) continue;

    const dates = txns.map((t) => new Date(t.date));
    const { cadence } = detectCadence(dates);

    if (cadence === "UNKNOWN" && txns.length < 3) continue;

    const avgAmount = Math.round(
      txns.reduce((sum, t) => sum + t.amountCents, 0) / txns.length
    );

    const lastDate = dates[dates.length - 1];
    const nextExpectedDate = estimateNextDate(lastDate, cadence);

    await prisma.recurringSubscription.upsert({
      where: { workspaceId_vendorId: { workspaceId, vendorId: vendor.id } },
      create: {
        workspaceId,
        vendorId: vendor.id,
        cadence,
        amountCentsAvg: avgAmount,
        nextExpectedDate,
        status: "ACTIVE",
      },
      update: {
        cadence,
        amountCentsAvg: avgAmount,
        nextExpectedDate,
        status: "ACTIVE",
      },
    });
  }
}
