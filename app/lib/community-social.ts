import { z } from "zod";
import { carImageSchema } from "@/app/lib/community";

export const postInputSchema = z.object({
  content: z.string().trim().min(8, "Escribe al menos 8 caracteres.").max(1200),
  imageUrl: z.union([carImageSchema, z.literal("")]).optional().default(""),
  clubId: z.string().uuid().optional(),
}).strict();

export const reportInputSchema = z.object({
  reason: z.enum(["spam", "abuso", "contenido_inapropiado", "privacidad", "otros"]),
}).strict();

export const moderationInputSchema = z.object({
  status: z.enum(["published", "hidden"]),
}).strict();

export function socialEnabled() {
  return process.env.COMMUNITY_SOCIAL_ENABLED === "true";
}
