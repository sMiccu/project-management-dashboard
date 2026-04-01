import { prisma } from "@/lib/prisma/client";

export async function findAllPhaseMasters() {
  return prisma.phaseMaster.findMany({
    orderBy: { defaultOrder: "asc" },
  });
}

export async function createPhaseMaster(data: {
  name: string;
  defaultOrder: number;
}) {
  return prisma.phaseMaster.create({ data });
}

export async function getMaxDefaultOrder(): Promise<number> {
  const result = await prisma.phaseMaster.aggregate({
    _max: { defaultOrder: true },
  });
  return (result._max.defaultOrder ?? -1) + 1;
}

export async function updatePhaseMaster(
  id: string,
  data: { name?: string; defaultOrder?: number }
) {
  return prisma.phaseMaster.update({ where: { id }, data });
}

export async function deletePhaseMaster(id: string) {
  const usedCount = await prisma.phase.count({ where: { phaseMasterId: id } });
  if (usedCount > 0) {
    throw new Error("このフェーズは案件で使用中のため削除できません");
  }
  return prisma.phaseMaster.delete({ where: { id } });
}
