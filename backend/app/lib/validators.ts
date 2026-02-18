import { z } from "zod";

// Registration schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),

  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Email must be a valid email address" })
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Email format is invalid" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/\d/, { message: "Password must contain at least one numeric digit" }),
});

// Login schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Email must be a valid email address" })
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Email format is invalid" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/\d/, { message: "Password must contain at least one numeric digit" }),
});


export const taskSchema = z.object({
  title: z.string(),
  completed: z.preprocess(
    (val) => val === "true" || val === true, 
    z.boolean()
  ).default(false),
});

export const taskUpdateSchema = z.object({
  title: z.string().optional(),
  completed: z.preprocess(
    (val) => val === "true" || val === true || val === "false" || val === false
      ? val === "true" || val === true
      : undefined,
    z.boolean().optional()
  ),
});