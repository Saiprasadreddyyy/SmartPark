import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name is too long"),

  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number"),

  password: z
    .string()
    .min(6, "Password must contain at least 6 characters"),

  vehicleNumber: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase()),

  vehicleType: z.enum([
    "car",
    "motorbike",
    "large"
  ]),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must contain at least 6 characters"),
});