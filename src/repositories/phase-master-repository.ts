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

export async function updatePhaseMaster(
  id: string,
  data: { name?: string; defaultOrder?: number }
) {
  return prisma.phaseMaster.update({ where: { id }, data });
}
