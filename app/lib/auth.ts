import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET || "supersecretkey_dev_fallback",
    providers: [
        CredentialsProvider({
            name: "Credenciales",
            credentials: {
                email: { label: "Correo electronico", type: "email" },
                password: { label: "Clave", type: "password" },
            },
            async authorize(credentials) {
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
                    throw new Error("Usuario no encontrado");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Clave incorrecta");
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
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.username = user.username;
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
    },
};
