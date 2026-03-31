import { prisma } from "@/lib/prisma/client";

export async function createPhase(data: {
  projectId: string;
  phaseMasterId: string;
  orderIndex: number;
}) {
  return prisma.phase.create({
    data,
    include: {
      phaseMaster: { select: { id: true, name: true, defaultOrder: true } },
      assignee: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}

export async function updatePhase(
  id: string,
  data: {
    status?: string;
    dueDate?: Date | null;
    assigneeId?: string | null;
  }
) {
  return prisma.phase.update({
    where: { id },
    data,
    include: {
      phaseMaster: { select: { id: true, name: true, defaultOrder: true } },
      assignee: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}

export async function deletePhase(id: string) {
  return prisma.phase.delete({ where: { id } });
}

export async function findPhaseById(id: string) {
  return prisma.phase.findUnique({
    where: { id },
    include: {
      phaseMaster: { select: { id: true, name: true, defaultOrder: true } },
      assignee: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}

export async function getMaxOrderIndex(projectId: string): Promise<number> {
  const result = await prisma.phase.aggregate({
    where: { projectId },
    _max: { orderIndex: true },
  });
  return (result._max.orderIndex ?? -1) + 1;
}

export async function reorderPhases(
  projectId: string,
  orderedIds: string[]
) {
  const updates = orderedIds.map((id, index) =>
    prisma.phase.update({ where: { id }, data: { orderIndex: index } })
  );
  await prisma.$transaction(updates);
}
