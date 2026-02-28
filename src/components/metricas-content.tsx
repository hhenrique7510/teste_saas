"use client";

import { useEffect, useState } from "react";

type Metric = {
  id: string;
  name: string;
  value: number;
  type: string;
  createdAt: string;
};

export function MetricasContent() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/metricas")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setMetrics(Array.isArray(data) ? data : data.metrics ?? []))
      .catch(() => setMetrics([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">A carregar...</p>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <p className="rounded bg-gray-50 p-4 text-gray-600">
        Ainda não existem métricas. Execute o seed da base de dados para dados de exemplo.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Nome
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Tipo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Valor
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Data
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {metrics.map((m) => (
            <tr key={m.id}>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{m.name}</td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{m.type}</td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{m.value}</td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {new Date(m.createdAt).toLocaleDateString("pt-PT")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
