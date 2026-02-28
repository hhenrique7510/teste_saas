"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import type { Subscription } from "@prisma/client";

type Props = { subscription: Subscription | null };

export function PlanoContent({ subscription }: Props) {
  const searchParams = useSearchParams();
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isActive = subscription?.status === "active";
  const success = searchParams.get("success") === "1";
  const canceled = searchParams.get("canceled") === "1";

  async function handleCheckout(plan: "monthly" | "yearly") {
    setLoadingCheckout(plan);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage({ type: "error", text: data.error ?? "Erro ao iniciar checkout" });
    } catch {
      setMessage({ type: "error", text: "Erro de ligação" });
    } finally {
      setLoadingCheckout(null);
    }
  }

  async function handlePortal() {
    setLoadingPortal(true);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage({ type: "error", text: data.error ?? "Erro ao abrir portal" });
    } catch {
      setMessage({ type: "error", text: "Erro de ligação" });
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-green-800">
          Assinatura ativada com sucesso.
        </div>
      )}
      {canceled && (
        <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
          Checkout cancelado.
        </div>
      )}

      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {isActive ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-green-600">
            <CreditCard className="h-5 w-5" />
            <span className="font-medium">Assinatura ativa</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Plano: {subscription?.stripePriceId ?? "—"} · Estado: {subscription?.status}
            {subscription?.currentPeriodEnd && (
              <> · Renovação: {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-PT")}</>
            )}
          </p>
          <button
            onClick={handlePortal}
            disabled={loadingPortal}
            className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loadingPortal ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> A abrir...
              </span>
            ) : (
              "Gerir assinatura e faturas"
            )}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">Mensal</h2>
            <p className="mt-1 text-sm text-gray-600">
              Pagamento mensal. Será redirecionado para o Stripe para concluir o pagamento em segurança.
            </p>
            <button
              onClick={() => handleCheckout("monthly")}
              disabled={!!loadingCheckout}
              className="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingCheckout === "monthly" ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Subscrever"
              )}
            </button>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">Anual</h2>
            <p className="mt-1 text-sm text-gray-600">
              Pagamento anual. Será redirecionado para o Stripe para concluir o pagamento em segurança.
            </p>
            <button
              onClick={() => handleCheckout("yearly")}
              disabled={!!loadingCheckout}
              className="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingCheckout === "yearly" ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Subscrever"
              )}
            </button>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500">
        Utilizamos o Stripe para pagamentos. Pode gerir o seu plano e faturas no portal de faturação.
      </p>
    </div>
  );
}
