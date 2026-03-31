import { auth } from "./index";
import { findUserById } from "@/repositories/user-repository";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const dbUser = await findUserById(session.user.id);
  if (!dbUser) return null;

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
  };
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) throw new Error("セッションが無効です。再ログインしてください。");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new Error("管理者権限が必要です");
  return user;
}
