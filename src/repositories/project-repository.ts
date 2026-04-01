import { prisma } from "@/lib/prisma/client";

const projectInclude = {
  members: {
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  },
  phases: {
    include: {
      phaseMaster: { select: { id: true, name: true, defaultOrder: true } },
      assignee: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { orderIndex: "asc" as const },
  },
} as const;

export interface ProjectFilters {
  status?: string;
  memberId?: string;
  sortBy?: "due_date" | "updated_at";
  sortOrder?: "asc" | "desc";
}

export async function findProjects(filters: ProjectFilters) {
  const where: Record<string, unknown> = {};

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.memberId) {
    where.members = { some: { userId: filters.memberId } };
  }

  return prisma.project.findMany({
    where,
    include: projectInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function findProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: projectInclude,
  });
}

export async function createProject(data: {
  companyName: string;
  projectName: string;
  status?: string;
  contractType?: string | null;
  orderAmount?: number;
  outsourcingCost?: number;
  expense?: number;
  googleDriveUrl?: string | null;
  memberIds?: string[];
  phaseMasterIds?: string[];
}) {
  const { memberIds = [], phaseMasterIds = [], ...projectData } = data;

  return prisma.project.create({
    data: {
      ...projectData,
      members: {
        create: memberIds.map((userId) => ({ userId })),
      },
      phases: {
        create: phaseMasterIds.map((phaseMasterId, index) => ({
          phaseMasterId,
          orderIndex: index,
        })),
      },
    },
    include: projectInclude,
  });
}

export async function updateProjectData(
  id: string,
  data: {
    companyName?: string;
    projectName?: string;
    status?: string;
    contractType?: string | null;
    orderAmount?: number;
    outsourcingCost?: number;
    expense?: number;
    googleDriveUrl?: string | null;
  }
) {
  return prisma.project.update({
    where: { id },
    data,
    include: projectInclude,
  });
}

export async function updateProjectMembers(
  projectId: string,
  memberIds: string[]
) {
  await prisma.projectMember.deleteMany({ where: { projectId } });
  if (memberIds.length > 0) {
    await prisma.projectMember.createMany({
      data: memberIds.map((userId) => ({ projectId, userId })),
    });
  }
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}
