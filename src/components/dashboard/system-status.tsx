import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { CheckCircle2, Clock } from "lucide-react";

const statusItems = [
  {
    label: "Servicios Activos",
    value: "12",
    color: "bg-green-500",
    textColor: "text-green-400",
    borderColor: "border-green-400/50"
  },
  {
    label: "Vehículos Online",
    value: "8/10",
    color: "bg-blue-500",
    textColor: "text-blue-400",
    borderColor: "border-blue-400/50"
  },
  {
    label: "Pendientes",
    value: "3",
    color: "bg-yellow-500",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-400/50"
  },
  {
    label: "Tiempo Promedio",
    value: "2.5h",
    color: "bg-green-500",
    textColor: "text-green-400",
    borderColor: "border-green-400/50"
  },
];


export default function SystemStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          Estado del Sistema
        </CardTitle>
        <CardDescription>Monitoreo en tiempo real</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              <p className="font-medium text-foreground">{item.label}</p>
            </div>
            <div className={`text-sm font-semibold ${item.textColor} border ${item.borderColor} rounded-full px-3 py-0.5`}>
              {item.value}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Última actualización: hace 2 minutos</span>
        </div>
      </CardFooter>
    </Card>
  );
}
