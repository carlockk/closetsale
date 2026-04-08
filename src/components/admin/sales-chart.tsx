"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/utils";

type SalesChartProps = {
  data: { date: string; total: number; orders: number }[];
};

export function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="overflow-x-auto border border-slate-200">
      <div className="h-80 min-w-[720px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#b88746" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#b88746" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="date" stroke="#78716c" />
          <YAxis stroke="#78716c" />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Area type="monotone" dataKey="total" stroke="#8b5e34" fill="url(#salesGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
