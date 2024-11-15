import { z } from "zod";

export const userSignUpSchema = z.object({
  email: z.string().email().min(3).max(60),
  password: z.string().min(6).max(16),
  username: z.string().min(3).max(20),
});

export const userSignInSchema = z.object({
  email: z.string().email().min(3).max(60),
  password: z.string().min(6).max(16),
});
