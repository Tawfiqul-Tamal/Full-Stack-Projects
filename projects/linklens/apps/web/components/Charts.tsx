"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { DEVICE_COLORS, TOOLTIP_STYLE } from "@/lib/theme";
import type { Analytics, Device } from "@/lib/types";

const AXIS = { fill: "#86A3AD", fontSize: 12 };

export function ClicksChart({ byDay }: { byDay: Analytics["byDay"] }) {
  const data = byDay.map((d) => ({ ...d, label: d.date.slice(5) }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1C3F4C" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#2DD4BF" strokeWidth={2} fill="url(#clicksFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DeviceChart({ byDevice, total }: { byDevice: Analytics["byDevice"]; total: number }) {
  const data = (Object.keys(byDevice) as Device[]).map((name) => ({
    name,
    value: byDevice[name],
    color: DEVICE_COLORS[name],
  }));
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={62} outerRadius={90} paddingAngle={3} stroke="none">
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#86A3AD" }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-[96px] text-center">
        <p className="text-2xl font-semibold">{total}</p>
        <p className="text-xs text-muted">clicks</p>
      </div>
    </div>
  );
}

export function ReferrerChart({ referrers }: { referrers: Analytics["topReferrers"] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={referrers} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid stroke="#1C3F4C" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" tick={AXIS} tickLine={false} axisLine={false} width={84} />
        <Tooltip cursor={{ fill: "#12303B88" }} contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="clicks" name="Clicks" fill="#38BDF8" radius={[0, 6, 6, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
