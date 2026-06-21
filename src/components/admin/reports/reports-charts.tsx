"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency, formatNumber } from "@/lib/utils/format";

type ReportsChartPoint = {
  name: string;
  revenue: number;
  orders: number;
};

export function ReportsRevenueChart({ data }: { data: ReportsChartPoint[] }) {
  return (
    <div className="mt-6 h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.96)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              color: "#fff",
            }}
            formatter={(value, name) => {
              const numeric = Number(value ?? 0);
              const label = String(name ?? "");
              if (label === "Doanh thu") {
                return [formatCurrency(numeric), label];
              }
              return [`${formatNumber(numeric)} đơn`, label];
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Doanh thu"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="orders"
            name="Đơn hàng"
            stroke="#22c55e"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
