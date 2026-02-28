"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type DashboardData = {
  kpis: { totalUsers: number; revenueMonth: number; conversions: number };
  seriesByPeriod: { period: string; value: number; count?: number }[];
  metricTrend: { name: string; value: number }[];
};

export function OverviewContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">A carregar...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <p className="rounded bg-amber-50 p-4 text-amber-800">
        Não foi possível carregar os dados do dashboard.
      </p>
    );
  }

  const { kpis, seriesByPeriod, metricTrend } = data;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total de utilizadores</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{kpis.totalUsers}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Receita do mês</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {kpis.revenueMonth.toLocaleString("pt-PT", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Conversões</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{kpis.conversions}</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Evolução por período</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={seriesByPeriod}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#2563eb" name="Valor" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Métricas por tipo</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metricTrend} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
