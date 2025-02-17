import { z } from "zod";

export const commentSchema = z.object({
  content: z.string().min(1, "Content must be at least 1 characters"),
});
