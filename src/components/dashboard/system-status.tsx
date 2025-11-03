// This file is not used anymore and will be removed in a future iteration.
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { CheckCircle2, Truck, Server, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const statusItems = [
  {
    label: "Servicios Activos",
    value: "12/20",
    progress: 60,
    icon: Truck,
  },
  {
    label: "Vehículos Online",
    value: "8/10",
    progress: 80,
    icon: Server,
  },
  {
    label: "Rendimiento General",
    value: "Óptimo",
    progress: 95,
    icon: Zap,
  },
];


export default function SystemStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          Estado del Sistema
        </CardTitle>
        <CardDescription>Rendimiento en tiempo real</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {statusItems.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                </div>
              <p className="text-sm font-semibold text-muted-foreground">{item.value}</p>
            </div>
            <Progress value={item.progress} aria-label={`${item.label}: ${item.value}`} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
