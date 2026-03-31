import { prisma } from "@/lib/prisma/client";

export async function findAllUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  return prisma.user.create({ data });
}

export async function updateUser(
  id: string,
  data: { name?: string; role?: string }
) {
  return prisma.user.update({ where: { id }, data });
}
