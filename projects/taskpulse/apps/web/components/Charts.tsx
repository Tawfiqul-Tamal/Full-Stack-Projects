"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { PRIORITY_META, STATUS_META, TOOLTIP_STYLE } from "@/lib/theme";
import type { Stats, TaskPriority, TaskStatus } from "@/lib/types";

const AXIS = { fill: "#8A94B2", fontSize: 12 };

export function TrendChart({ trend }: { trend: Stats["trend"] }) {
  const data = trend.map((p) => ({ ...p, label: p.date.slice(5) }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#243050" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#8A94B2" }} />
        <Area type="monotone" dataKey="created" name="Created" stroke="#818CF8" strokeWidth={2} fill="url(#created)" />
        <Area type="monotone" dataKey="completed" name="Completed" stroke="#22D3EE" strokeWidth={2} fill="url(#completed)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StatusChart({ byStatus, total }: { byStatus: Stats["byStatus"]; total: number }) {
  const data = (Object.keys(byStatus) as TaskStatus[]).map((key) => ({
    name: STATUS_META[key].label,
    value: byStatus[key],
    color: STATUS_META[key].color,
  }));
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={62} outerRadius={90} paddingAngle={3} stroke="none">
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#8A94B2" }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-[96px] text-center">
        <p className="text-2xl font-semibold">{total}</p>
        <p className="text-xs text-muted">tasks</p>
      </div>
    </div>
  );
}

export function PriorityChart({ byPriority }: { byPriority: Stats["byPriority"] }) {
  const data = (Object.keys(byPriority) as TaskPriority[]).map((key) => ({
    name: PRIORITY_META[key].label,
    value: byPriority[key],
    color: PRIORITY_META[key].color,
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid stroke="#243050" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" tick={AXIS} tickLine={false} axisLine={false} width={64} />
        <Tooltip cursor={{ fill: "#1A234066" }} contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="value" name="Tasks" radius={[0, 6, 6, 0]} barSize={22}>
          {data.map((d) => <Cell key={d.name} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
