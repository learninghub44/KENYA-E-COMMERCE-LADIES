import { z } from "zod";
import { DEFAULT_PASSWORD_POLICY, validatePassword } from "./password-policy";

export const emailSchema = z.string().trim().email().max(320);

export const passwordSchema = z
  .string()
  .superRefine((password, context) => {
    for (const message of validatePassword(password, DEFAULT_PASSWORD_POLICY)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message });
    }
  });

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().trim().min(2).max(120).optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  rememberMe: z.boolean().default(false)
});

export const passwordResetSchema = z.object({
  email: emailSchema,
  redirectTo: z.string().url().optional()
});

export const passwordUpdateSchema = z.object({
  password: passwordSchema
});

export const emailUpdateSchema = z.object({
  email: emailSchema
});

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(120).optional(),
  email: emailSchema.optional(),
  phone: z.string().trim().min(10).optional(),
});
