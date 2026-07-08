import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_SUPERADMIN_EMAIL = "alexarmas2002@outlook.es";
const DEFAULT_SUPERADMIN_NAME = "Alejandro Armas";
const SUPERADMIN_ROLE = "superadmin";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function buildUsername(email: string) {
  const localPart = email.split("@")[0] || "superadmin";
  return localPart.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48) || "superadmin";
}

async function findAvailableUsername(baseUsername: string, email: string) {
  let candidate = baseUsername;
  let suffix = 1;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { email: true },
    });

    if (!existing || normalizeEmail(existing.email) === email) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseUsername}_${suffix}`;
  }
}

async function main() {
  const email = normalizeEmail(process.env.SUPERADMIN_EMAIL || DEFAULT_SUPERADMIN_EMAIL);
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!password) {
    throw new Error("Falta SUPERADMIN_PASSWORD. Define una contrasena segura antes de ejecutar este comando.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const username = await findAvailableUsername(buildUsername(email), email);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      role: SUPERADMIN_ROLE,
      name: DEFAULT_SUPERADMIN_NAME,
    },
    create: {
      email,
      username,
      password: passwordHash,
      role: SUPERADMIN_ROLE,
      name: DEFAULT_SUPERADMIN_NAME,
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    },
  });

  console.log(`Superadmin guardado en la base de datos: ${user.email} (${user.role}).`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "No se pudo crear el superadmin.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
