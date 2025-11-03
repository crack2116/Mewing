import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Activity, Clock, Timer } from "lucide-react";

const statusItems = [
  {
    label: "Servicios Activos",
    value: "12",
    color: "bg-green-500",
  },
  {
    label: "Vehículos Online",
    value: "8/10",
    color: "bg-blue-500",
  },
  {
    label: "Pendientes",
    value: "3",
    color: "bg-yellow-500",
  },
  {
    label: "Tiempo Promedio",
    value: "2.5h",
    color: "bg-green-500",
  },
];


export default function SystemStatus() {
  return (
    <Card className="h-full bg-card/60 border-none">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Estado del Sistema
        </CardTitle>
        <CardDescription>Monitoreo en tiempo real</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${item.color}`}></span>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              {item.value}
            </Badge>
          </div>
        ))}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <Clock className="mr-2 h-4 w-4" />
        Última actualización: hace 2 minutos
      </CardFooter>
    </Card>
  );
}
