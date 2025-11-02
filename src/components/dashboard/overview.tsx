import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Truck, CheckCircle, Clock } from "lucide-react";
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">
            {formatCurrency(overviewData.totalRevenue)}
          </div>
          <p className="text-xs text-green-500">+20.1% desde el último mes</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Servicios en Curso</CardTitle>
          <Truck className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">
            {overviewData.servicesInProgress}
          </div>
          <p className="text-xs text-muted-foreground"><span className="inline-block w-2 h-2 mr-1 bg-blue-500 rounded-full"></span>Actualmente en ruta</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Servicios Completados (Mes)</CardTitle>
          <CheckCircle className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">
            +{overviewData.completedServices}
          </div>
          <p className="text-xs text-muted-foreground">+10% desde el último mes</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
          <Clock className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">
            {overviewData.pendingRequests}
          </div>
          <p className="text-xs text-muted-foreground"><span className="inline-block w-2 h-2 mr-1 bg-orange-500 rounded-full"></span>Esperando asignación</p>
        </CardContent>
      </Card>
    </div>
  );
}
