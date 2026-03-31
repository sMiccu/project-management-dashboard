"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma/client";

export async function seedAction() {
  await prisma.activityLog.deleteMany();
  await prisma.phase.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.phaseMaster.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  const [admin, tanaka, sato, suzuki] = await Promise.all([
    prisma.user.create({
      data: { name: "町田 管理者", email: "admin@example.com", password, role: "ADMIN" },
    }),
    prisma.user.create({
      data: { name: "田中 太郎", email: "tanaka@example.com", password, role: "MEMBER" },
    }),
    prisma.user.create({
      data: { name: "佐藤 花子", email: "sato@example.com", password, role: "MEMBER" },
    }),
    prisma.user.create({
      data: { name: "鈴木 一郎", email: "suzuki@example.com", password, role: "MEMBER" },
    }),
  ]);

  const phases = await Promise.all([
    prisma.phaseMaster.create({ data: { name: "要件定義", defaultOrder: 1 } }),
    prisma.phaseMaster.create({ data: { name: "設計", defaultOrder: 2 } }),
    prisma.phaseMaster.create({ data: { name: "開発", defaultOrder: 3 } }),
    prisma.phaseMaster.create({ data: { name: "社内テスト", defaultOrder: 4 } }),
    prisma.phaseMaster.create({ data: { name: "受入テスト", defaultOrder: 5 } }),
    prisma.phaseMaster.create({ data: { name: "リリース", defaultOrder: 6 } }),
  ]);

  const today = new Date();
  const daysAgo = (d: number) => new Date(today.getTime() - d * 86400000);
  const daysLater = (d: number) => new Date(today.getTime() + d * 86400000);

  const p1 = await prisma.project.create({
    data: {
      companyName: "株式会社ABC",
      projectName: "ECサイトリニューアル",
      status: "IN_PROGRESS",
      contractType: "CONTRACT",
      orderAmount: 5000000,
      outsourcingCost: 1200000,
      expense: 300000,
      googleDriveUrl: "https://drive.google.com/drive/folders/example1",
      members: { create: [{ userId: admin.id }, { userId: tanaka.id }] },
      phases: {
        create: [
          { phaseMasterId: phases[0].id, status: "COMPLETED", dueDate: daysAgo(30), assigneeId: tanaka.id, orderIndex: 0 },
          { phaseMasterId: phases[1].id, status: "COMPLETED", dueDate: daysAgo(10), assigneeId: tanaka.id, orderIndex: 1 },
          { phaseMasterId: phases[2].id, status: "IN_PROGRESS", dueDate: daysLater(14), assigneeId: tanaka.id, orderIndex: 2 },
          { phaseMasterId: phases[3].id, status: "NOT_STARTED", dueDate: daysLater(28), orderIndex: 3 },
          { phaseMasterId: phases[4].id, status: "NOT_STARTED", dueDate: daysLater(42), orderIndex: 4 },
          { phaseMasterId: phases[5].id, status: "NOT_STARTED", dueDate: daysLater(56), orderIndex: 5 },
        ],
      },
    },
  });

  const p2 = await prisma.project.create({
    data: {
      companyName: "DEF株式会社",
      projectName: "社内ポータル構築",
      status: "IN_PROGRESS",
      contractType: "TIME_AND_MATERIAL",
      orderAmount: 3000000,
      outsourcingCost: 500000,
      expense: 100000,
      members: { create: [{ userId: admin.id }, { userId: sato.id }] },
      phases: {
        create: [
          { phaseMasterId: phases[0].id, status: "COMPLETED", dueDate: daysAgo(45), assigneeId: sato.id, orderIndex: 0 },
          { phaseMasterId: phases[1].id, status: "COMPLETED", dueDate: daysAgo(20), assigneeId: sato.id, orderIndex: 1 },
          { phaseMasterId: phases[2].id, status: "IN_PROGRESS", dueDate: daysAgo(3), assigneeId: sato.id, orderIndex: 2 },
          { phaseMasterId: phases[3].id, status: "NOT_STARTED", dueDate: daysLater(10), orderIndex: 3 },
          { phaseMasterId: phases[5].id, status: "NOT_STARTED", dueDate: daysLater(30), orderIndex: 4 },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      companyName: "GHI株式会社",
      projectName: "モバイルアプリ開発",
      status: "NOT_STARTED",
      contractType: "CONTRACT",
      orderAmount: 8000000,
      outsourcingCost: 2000000,
      expense: 500000,
      members: { create: [{ userId: admin.id }, { userId: suzuki.id }] },
      phases: {
        create: [
          { phaseMasterId: phases[0].id, status: "NOT_STARTED", dueDate: daysLater(7), assigneeId: suzuki.id, orderIndex: 0 },
          { phaseMasterId: phases[1].id, status: "NOT_STARTED", dueDate: daysLater(30), orderIndex: 1 },
          { phaseMasterId: phases[2].id, status: "NOT_STARTED", dueDate: daysLater(60), orderIndex: 2 },
          { phaseMasterId: phases[3].id, status: "NOT_STARTED", dueDate: daysLater(75), orderIndex: 3 },
          { phaseMasterId: phases[4].id, status: "NOT_STARTED", dueDate: daysLater(90), orderIndex: 4 },
          { phaseMasterId: phases[5].id, status: "NOT_STARTED", dueDate: daysLater(100), orderIndex: 5 },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      companyName: "JKL商事",
      projectName: "在庫管理システム改修",
      status: "COMPLETED",
      contractType: "CONTRACT",
      orderAmount: 2000000,
      outsourcingCost: 300000,
      expense: 50000,
      members: { create: [{ userId: tanaka.id }, { userId: sato.id }] },
      phases: {
        create: [
          { phaseMasterId: phases[0].id, status: "COMPLETED", dueDate: daysAgo(90), assigneeId: tanaka.id, orderIndex: 0 },
          { phaseMasterId: phases[1].id, status: "COMPLETED", dueDate: daysAgo(70), assigneeId: sato.id, orderIndex: 1 },
          { phaseMasterId: phases[2].id, status: "COMPLETED", dueDate: daysAgo(40), assigneeId: tanaka.id, orderIndex: 2 },
          { phaseMasterId: phases[3].id, status: "COMPLETED", dueDate: daysAgo(20), orderIndex: 3 },
          { phaseMasterId: phases[5].id, status: "COMPLETED", dueDate: daysAgo(10), orderIndex: 4 },
        ],
      },
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { projectId: p1.id, userId: admin.id, action: "CREATE" },
      { projectId: p1.id, userId: tanaka.id, action: "UPDATE", field: "status", oldValue: "NOT_STARTED", newValue: "IN_PROGRESS" },
      { projectId: p1.id, userId: tanaka.id, action: "UPDATE", field: "orderAmount", oldValue: "4500000", newValue: "5000000" },
      { projectId: p2.id, userId: admin.id, action: "CREATE" },
      { projectId: p2.id, userId: sato.id, action: "UPDATE", field: "phase.設計.status", oldValue: "IN_PROGRESS", newValue: "COMPLETED" },
    ],
  });

  return { message: "シードデータを投入しました" };
}
