import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Truck, CircleCheckBig, Clock } from "lucide-react";
import { overviewData } from "@/lib/data";

export default function Overview() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  const overviewItems = [
    {
      title: "Ingresos Totales",
      icon: DollarSign,
      value: formatCurrency(overviewData.totalRevenue),
      description: "+20.1% desde el último mes",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-400",
      cardBg: "bg-green-500/5",
    },
    {
      title: "Servicios en Curso",
      icon: Truck,
      value: overviewData.servicesInProgress,
      description: "Actualmente en ruta",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      cardBg: "bg-blue-500/5",
    },
    {
      title: "Servicios Completados (Mes)",
      icon: CircleCheckBig,
      value: `+${overviewData.completedServices}`,
      description: "+10% desde el último mes",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
      cardBg: "bg-purple-500/5",
    },
    {
      title: "Solicitudes Pendientes",
      icon: Clock,
      value: overviewData.pendingRequests,
      description: "Esperando asignación",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-400",
      cardBg: "bg-orange-500/5",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {overviewItems.map((item, index) => (
         <Card key={item.title} className={`border-none ${item.cardBg}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
              <div className={`p-2 rounded-full ${item.iconBg}`}>
                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-headline text-card-foreground">
                {item.value}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
            </CardContent>
          </Card>
      ))}
    </div>
  );
}
