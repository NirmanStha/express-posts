import { z } from "zod";

export const postSchema = z.object({
  title: z.string(),
  content: z.string().min(2, "Content must be at least 2 characters"),
  filenames: z.array(z.string()),
});
