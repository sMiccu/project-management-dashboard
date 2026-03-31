import { z } from "zod";

export const phaseUpdateSchema = z.object({
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).optional(),
  dueDate: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
});

export type PhaseUpdateInput = z.infer<typeof phaseUpdateSchema>;
