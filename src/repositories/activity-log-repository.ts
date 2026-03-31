import { prisma } from "@/lib/prisma/client";

export async function findLogsByProjectId(
  projectId: string,
  options?: { limit?: number; cursor?: string }
) {
  const take = options?.limit ?? 50;

  return prisma.activityLog.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(options?.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
  });
}

export async function createLog(data: {
  projectId: string;
  userId: string;
  action: string;
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
}) {
  return prisma.activityLog.create({ data });
}

export async function createManyLogs(
  logs: {
    projectId: string;
    userId: string;
    action: string;
    field?: string | null;
    oldValue?: string | null;
    newValue?: string | null;
  }[]
) {
  return prisma.activityLog.createMany({ data: logs });
}
