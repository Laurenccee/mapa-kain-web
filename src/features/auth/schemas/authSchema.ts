import { z } from "zod";

// 1. Define the base SignUpSchema first
export const SignUpSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[0-9]/, "Must include a number"),
});

// 2. Extend it to create SignInSchema
export const SignInSchema = SignUpSchema.extend({
  rememberMe: z.boolean(),
});

// 3. Keep your other standalone schemas
export const ForgetPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[0-9]/, "Must include a number");

export const ResetPasswordSchema = z.object({
  password: passwordRule,
});

// 4. Types stay exactly the same (TypeScript infers the extension automatically)
export type SignUpData = z.infer<typeof SignUpSchema>;
export type SignInData = z.infer<typeof SignInSchema>;
export type ForgetPasswordData = z.infer<typeof ForgetPasswordSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
