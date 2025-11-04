"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ServicePerformanceChartProps {
  data?: Array<{ name: string; onTime: number; delayed: number }>;
}

const defaultData = [
  { name: "Ene", onTime: 80, delayed: 20 },
  { name: "Feb", onTime: 90, delayed: 10 },
  { name: "Mar", onTime: 85, delayed: 15 },
  { name: "Abr", onTime: 95, delayed: 5 },
  { name: "May", onTime: 92, delayed: 8 },
  { name: "Jun", onTime: 88, delayed: 12 },
]

export default function ServicePerformanceChart({ data = defaultData }: ServicePerformanceChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--card-foreground))"
            }}
          />
          <Legend wrapperStyle={{fontSize: "12px"}} />
          <Bar dataKey="onTime" fill="hsl(var(--primary))" name="A Tiempo" radius={[4, 4, 0, 0]} />
          <Bar dataKey="delayed" fill="hsl(var(--muted))" name="Retrasado" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
