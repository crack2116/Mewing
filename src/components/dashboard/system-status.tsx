import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Activity, Clock, Timer, ClipboardPlus, Users, Map, LineChart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

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

const actions = [
    { icon: ClipboardPlus, title: "Nueva Solicitud", description: "Crear servicio", href: "/services", label: "Rápido" },
    { icon: Users, title: "Gestionar Clientes", description: "Ver todos", href: "/management", label: "Gestión" },
    { icon: Map, title: "Seguimiento", description: "En tiempo real", href: "/tracking", label: "Live" },
]


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
      <CardContent>
        <div className="space-y-4">
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
        </div>
        <Separator className="my-4" />
        <div className="space-y-2 mt-6">
            <h3 className="font-semibold font-headline text-sm flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                Acciones Rápidas
            </h3>
            {actions.map((action) => (
                <Link href={action.href} key={action.title}>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                                <action.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{action.title}</p>
                                <p className="text-xs text-muted-foreground">{action.description}</p>
                            </div>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">{action.label}</p>
                    </div>
                </Link>
            ))}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <Clock className="mr-2 h-4 w-4" />
        Última actualización: hace 2 minutos
      </CardFooter>
    </Card>
  );
}
