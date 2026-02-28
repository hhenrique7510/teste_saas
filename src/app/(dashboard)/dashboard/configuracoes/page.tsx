import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConfiguracoesContent } from "@/components/configuracoes-content";

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Configurações</h1>
      <ConfiguracoesContent user={session?.user} />
    </div>
  );
}
