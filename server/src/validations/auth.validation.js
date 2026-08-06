import { z } from "zod";

export const signupSchema = z.object({

  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .toLowerCase(),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20),

  vehicleNumber: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase()),

  vehicleType: z.enum([
    "car",
    "motorbike",
    "large"
  ])

});

export const loginSchema = z.object({

  email: z
    .string()
    .trim()
    .email(),

  password: z
    .string()
    .min(6)

});