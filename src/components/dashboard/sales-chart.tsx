"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { name: "Ene", revenue: 4000, expenses: 2400 },
  { name: "Feb", revenue: 3000, expenses: 1398 },
  { name: "Mar", revenue: 5000, expenses: 9800 },
  { name: "Abr", revenue: 4780, expenses: 3908 },
  { name: "May", revenue: 3890, expenses: 4800 },
  { name: "Jun", revenue: 4390, expenses: 3800 },
  { name: "Jul", revenue: 5490, expenses: 4300 },
]

export default function SalesChart() {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold font-headline mb-1">Ingresos vs. Gastos</h3>
        <p className="text-sm text-muted-foreground mb-4">Últimos 6 meses.</p>
        <div className="h-[350px] w-full">
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
            <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Ingresos" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="hsl(var(--secondary-foreground))" name="Gastos" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
        </div>
    </div>
  )
}
