import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// No plano Hobby a Vercel limita a 10s; no Pro permite mais. Evita que a rota auth seja cortada antes do client timeout.
export const maxDuration = 30;

export { handler as GET, handler as POST };
