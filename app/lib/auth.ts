import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { checkRateLimit, requestIdentifier } from "@/app/lib/rate-limit";

const secret = process.env.NEXTAUTH_SECRET;

if (!secret || secret.length < 32) {
    throw new Error("NEXTAUTH_SECRET debe contener al menos 32 caracteres.");
}

export const authOptions: NextAuthOptions = {
    secret,
    providers: [
        CredentialsProvider({
            name: "Credenciales",
            credentials: {
                email: { label: "Correo electronico", type: "email" },
                password: { label: "Clave", type: "password" },
            },
            async authorize(credentials) {
                const requestHeaders = await headers();
                const rateLimit = checkRateLimit(`login:${requestIdentifier(requestHeaders)}`, 8, 15 * 60 * 1000);
                if (!rateLimit.allowed) {
                    throw new Error("Credenciales invalidas");
                }

                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Credenciales invalidas");
                }

                const email = credentials.email.trim().toLowerCase();
                const user = await prisma.user.findUnique({
                    where: {
                        email,
                    },
                });

                if (!user || !user.password) {
                    await bcrypt.compare(credentials.password, "$2b$12$8fKpR5f3iIxZaMmpRQ0kSeQkAEaVScOJRAV7xF6T3aVYtb0cPx6je");
                    throw new Error("Credenciales invalidas");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Credenciales invalidas");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name || user.username,
                    username: user.username,
                    image: user.avatar,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.username = user.username;
                token.roleCheckedAt = Date.now();
            } else if (token.id && (trigger === "update" || !token.roleCheckedAt || Date.now() - Number(token.roleCheckedAt) > 5 * 60 * 1000)) {
                const currentUser = await prisma.user.findUnique({ where: { id: String(token.id) }, select: { role: true } });
                token.role = currentUser?.role ?? "user";
                token.roleCheckedAt = Date.now();
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.username = token.username;
            }
            return session;
        },
    },
    pages: {
        signIn: "/acceso-interno-tramassso",
    },
    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60,
    },
};
