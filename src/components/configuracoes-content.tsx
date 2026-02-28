"use client";

import type { Session } from "next-auth";

export function ConfiguracoesContent({ user }: { user: Session["user"] | undefined }) {
  if (!user) return null;

  return (
    <div className="max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-medium text-gray-900">Perfil</h2>
      <dl className="space-y-2">
        <div>
          <dt className="text-sm text-gray-500">Nome</dt>
          <dd className="text-gray-900">{user.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Email</dt>
          <dd className="text-gray-900">{user.email ?? "—"}</dd>
        </div>
      </dl>
      <p className="text-sm text-gray-500">
        Mais opções de perfil e preferências em breve.
      </p>
    </div>
  );
}
