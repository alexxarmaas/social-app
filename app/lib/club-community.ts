import { z } from "zod";

export const newClubSchema = z.object({
  name: z.string().trim().min(3, "Pon un nombre de al menos tres caracteres.").max(70),
  description: z.string().trim().max(1600).optional().default(""),
  category: z.enum(["JDM", "Europeos", "Clasicos", "Americanos", "Tuning", "Multimarca", "Otros"]),
  location: z.string().trim().max(90).optional().default(""),
}).strict();

export const applicationActionSchema = z.object({
  membershipId: z.string().uuid(),
  action: z.enum(["approved", "rejected"]),
}).strict();
