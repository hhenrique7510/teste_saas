import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlanoContent } from "@/components/plano-content";

export default async function PlanoPage() {
  const session = await getServerSession(authOptions);
  const subscription = session?.user?.id
    ? await prisma.subscription.findUnique({
        where: { userId: session.user.id },
      })
    : null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Plano e faturação
      </h1>
      <Suspense fallback={<div className="text-gray-500">A carregar...</div>}>
        <PlanoContent subscription={subscription} />
      </Suspense>
    </div>
  );
}
