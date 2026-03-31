import { auth } from "./index";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: (session.user as { role?: string }).role ?? "MEMBER",
  };
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) throw new Error("認証が必要です");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new Error("管理者権限が必要です");
  return user;
}
