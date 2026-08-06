import { z } from "zod";

export const parkVehicleSchema = z.object({

  gateId: z.enum([
    "gateA",
    "gateB"
  ]),

  vehicleType: z.enum([
    "car",
    "motorbike",
    "large"
  ]),

  vehicleNumber: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())

});

export const exitVehicleSchema = z.object({

  ticketId: z
    .string()
    .min(1)

});