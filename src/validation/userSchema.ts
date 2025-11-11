import { z } from "zod";

export const userSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]).default("user"),
  age: z.coerce
    .number()
    .int()
    .min(13, "Age must be at least 13")
    .max(120, "Invalid age"),
  profilePicture: z.string().optional(),
  gender: z.enum(["Male", "Female", "Others"]),
});
