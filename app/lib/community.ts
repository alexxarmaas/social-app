import { z } from "zod";

const currentYear = new Date().getUTCFullYear();

export const usernameSchema = z.string().trim().toLowerCase()
  .min(3, "El usuario debe tener al menos 3 caracteres.")
  .max(24, "El usuario no puede superar los 24 caracteres.")
  .regex(/^[a-z0-9_]+$/, "Solo letras, numeros y guiones bajos.");

export const registrationSchema = z.object({
  username: usernameSchema,
  name: z.string().trim().min(2).max(70),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(12, "La clave debe tener al menos 12 caracteres.").max(128),
  consent: z.literal(true),
  website: z.string().max(200).optional(),
}).strict();

export const carImageSchema = z.string().trim().url().max(700).refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "res.cloudinary.com" || url.hostname === "images.unsplash.com");
  } catch {
    return false;
  }
}, "Utiliza una imagen alojada en Cloudinary o Unsplash.");

export const carSchema = z.object({
  make: z.string().trim().min(2).max(50),
  model: z.string().trim().min(1).max(70),
  year: z.coerce.number().int().min(1900).max(currentYear + 1),
  color: z.string().trim().max(40).optional().default(""),
  engine: z.string().trim().max(80).optional().default(""),
  horsepower: z.union([z.coerce.number().int().min(1).max(3000), z.literal(""), z.null()]).optional(),
  modifications: z.string().trim().max(2500).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  imageUrl: z.union([carImageSchema, z.literal("")]).optional().default(""),
}).strict();

export function safeCarImage(value: string | null | undefined): string | null {
  if (!value) return null;
  return carImageSchema.safeParse(value).success ? value : null;
}

export function carDatabaseData(input: z.infer<typeof carSchema>) {
  return {
    make: input.make,
    model: input.model,
    year: input.year,
    color: input.color || null,
    engine: input.engine || null,
    horsepower: typeof input.horsepower === "number" ? input.horsepower : null,
    modifications: input.modifications || null,
    description: input.description || null,
    imageUrl: input.imageUrl || null,
  };
}


export const communityProfileSchema = z.object({
  name: z.string().trim().min(2, "Indica un nombre de al menos dos caracteres.").max(70),
  bio: z.string().trim().max(1200).default(""),
  location: z.string().trim().max(80).default(""),
}).strict();
