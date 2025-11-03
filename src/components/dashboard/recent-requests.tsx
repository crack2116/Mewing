import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { serviceRequests } from "@/lib/data";
import type { ServiceRequest } from "@/lib/types";
import { ClipboardList } from "lucide-react";

export default function RecentRequests() {

  const getStatusVariant = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'Completado':
        return 'success';
      case 'Cancelado':
        return 'destructive';
      case 'Asignado':
        return 'default';
      default:
        return 'outline';
    }
  }

  return (
    <Card className="h-full bg-card/60 border-none">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Solicitudes de Servicio Recientes
        </CardTitle>
        <CardDescription>Últimas solicitudes y su estado actual</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b-white/10">
              <TableHead className="text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="text-muted-foreground">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceRequests.slice(0, 4).map((request) => (
              <TableRow key={request.id} className="border-b-white/10">
                <TableCell>
                  <div className="font-medium">{request.client.name}</div>
                  <div className="text-sm text-muted-foreground">{request.details.subtitle}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(request.status)} className="capitalize text-xs font-normal">
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>{request.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
