"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface VehicleUtilizationChartProps {
  data?: Array<{ name: string; utilization: number }>;
}

const defaultData = [
  { name: "27 oct", utilization: 80 },
  { name: "28 oct", utilization: 78 },
  { name: "29 oct", utilization: 79 },
  { name: "30 oct", utilization: 81 },
  { name: "31 oct", utilization: 82 },
  { name: "1 nov", utilization: 80 },
  { name: "2 nov", utilization: 78 },
];

export default function VehicleUtilizationChart({ data = defaultData }: VehicleUtilizationChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--card-foreground))"
            }}
          />
          <Legend wrapperStyle={{fontSize: "12px"}}/>
          <Line type="monotone" dataKey="utilization" stroke="hsl(var(--primary))" strokeWidth={2} name="Utilización" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
