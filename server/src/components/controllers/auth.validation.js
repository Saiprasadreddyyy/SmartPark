import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .min(3, "Name should be at least 3 characters"),

  email: z
    .string()
    .email("Invalid email"),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number"),

  password: z
    .string()
    .min(6, "Password should be at least 6 characters"),

  vehicleNumber: z
    .string()
    .min(5),

  vehicleType: z.enum([
    "car",
    "motorbike",
    "large"
  ])
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});