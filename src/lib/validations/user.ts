import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上です"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
