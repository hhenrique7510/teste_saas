"use client";

import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

export function DashboardHeader({ user }: { user: Session["user"] }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user.name ?? user.email}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
