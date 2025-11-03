import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Users, CircleCheckBig, Clock } from "lucide-react";
import { overviewData } from "@/lib/data";

export default function Overview() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ' US$';
  }

  const overviewItems = [
    {
      title: "Ingresos Totales",
      icon: DollarSign,
      value: formatCurrency(overviewData.totalRevenue),
      description: "+20.1% desde el último mes",
      iconBg: "bg-green-100 dark:bg-green-500/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Nuevos Clientes",
      icon: Users,
      value: `+${overviewData.pendingRequests}`,
      description: "+10% desde el último mes",
      iconBg: "bg-purple-100 dark:bg-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Servicios Completados",
      icon: CircleCheckBig,
      value: `+${overviewData.completedServices}`,
      description: "+19% desde el último mes",
      iconBg: "bg-blue-100 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Solicitudes Pendientes",
      icon: Clock,
      value: overviewData.pendingRequests,
      description: "+5 desde ayer",
      iconBg: "bg-orange-100 dark:bg-orange-500/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {overviewItems.map((item) => (
         <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <div className={`p-2 rounded-full ${item.iconBg}`}>
                <item.icon className={`h-5 w-5 ${item.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">
                {item.value}
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
      ))}
    </div>
  );
}
