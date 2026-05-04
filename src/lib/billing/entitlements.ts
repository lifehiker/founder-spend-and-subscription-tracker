import { prisma } from "@/lib/db";

export const FREE_LIMITS = {
  uploads: 2,
  transactions: 50,
  vendors: 5,
};

export function isPro(plan: string): boolean {
  return plan === "PRO";
}

export async function canUpload(workspaceId: string, plan: string): Promise<boolean> {
  if (isPro(plan)) return true;
  const count = await prisma.statementUpload.count({ where: { workspaceId } });
  return count < FREE_LIMITS.uploads;
}

export async function canAddVendor(workspaceId: string, plan: string): Promise<boolean> {
  if (isPro(plan)) return true;
  const count = await prisma.vendor.count({ where: { workspaceId } });
  return count < FREE_LIMITS.vendors;
}

export async function canAddTransaction(workspaceId: string, plan: string): Promise<boolean> {
  if (isPro(plan)) return true;
  const count = await prisma.transaction.count({ where: { workspaceId } });
  return count < FREE_LIMITS.transactions;
}

export async function getUsage(workspaceId: string) {
  const [uploads, transactions, vendors] = await Promise.all([
    prisma.statementUpload.count({ where: { workspaceId } }),
    prisma.transaction.count({ where: { workspaceId } }),
    prisma.vendor.count({ where: { workspaceId } }),
  ]);
  return { uploads, transactions, vendors };
}
