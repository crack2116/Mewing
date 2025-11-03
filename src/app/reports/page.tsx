import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ServicePerformanceChart from "@/components/reports/service-performance-chart";
import VehicleUtilizationChart from "@/components/reports/vehicle-utilization-chart";

export default function ReportsPage() {
    const reportStats = [
        { title: "Servicios Totales", value: "245", change: "+12% vs mes anterior", changeColor: "text-green-500" },
        { title: "Tasa de Puntualidad", value: "90%", change: "+5.2% vs mes anterior", changeColor: "text-green-500" },
        { title: "Utilización Promedio", value: "75%", change: "+4.1% vs mes anterior", changeColor: "text-green-500" },
    ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">Reportes y Analíticas</h1>
            <p className="text-muted-foreground">Analiza el rendimiento y optimiza tus operaciones.</p>
        </div>
        <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground hidden sm:block">lunes, 3 de noviembre de 2025</p>
            <Button variant="outline">
                <FileDown className="mr-2"/>
                Exportar Excel
            </Button>
            <Button variant="outline">
                <FileDown className="mr-2"/>
                Exportar PDF
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Rendimiento del Servicio</CardTitle>
                <CardDescription>Servicios a Tiempo vs. Retrasados (Últimos 6 Meses)</CardDescription>
            </CardHeader>
            <CardContent>
                <ServicePerformanceChart />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Utilización de Vehículos</CardTitle>
                <CardDescription>Porcentaje de Uso Semanal de Vehículos</CardDescription>
            </CardHeader>
            <CardContent>
                <VehicleUtilizationChart />
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportStats.map((stat) => (
            <Card key={stat.title}>
                <CardHeader>
                    <CardTitle className="text-base font-medium text-muted-foreground">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold font-headline">{stat.value}</div>
                    <p className={`text-xs ${stat.changeColor} mt-1`}>{stat.change}</p>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
