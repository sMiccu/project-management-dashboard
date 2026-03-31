import { z } from "zod";

export const projectCreateSchema = z.object({
  companyName: z.string().min(1, "企業名は必須です"),
  projectName: z.string().min(1, "案件名は必須です"),
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"])
    .default("NOT_STARTED"),
  contractType: z
    .enum(["CONTRACT", "TIME_AND_MATERIAL"])
    .nullable()
    .optional(),
  orderAmount: z.coerce.number().int().min(0).default(0),
  outsourcingCost: z.coerce.number().int().min(0).default(0),
  expense: z.coerce.number().int().min(0).default(0),
  googleDriveUrl: z.string().url("有効なURLを入力してください").nullable().optional(),
  memberIds: z.array(z.string()).default([]),
  phaseMasterIds: z.array(z.string()).default([]),
});

export const projectUpdateSchema = z.object({
  companyName: z.string().min(1, "企業名は必須です").optional(),
  projectName: z.string().min(1, "案件名は必須です").optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).optional(),
  contractType: z.enum(["CONTRACT", "TIME_AND_MATERIAL"]).nullable().optional(),
  orderAmount: z.coerce.number().int().min(0).optional(),
  outsourcingCost: z.coerce.number().int().min(0).optional(),
  expense: z.coerce.number().int().min(0).optional(),
  googleDriveUrl: z.string().url("有効なURLを入力してください").nullable().optional(),
  memberIds: z.array(z.string()).optional(),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
