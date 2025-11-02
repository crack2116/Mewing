import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
      default:
        return 'default';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><ClipboardList className="h-6 w-6"/> Solicitudes de Servicio Recientes</CardTitle>
        <CardDescription>Últimas solicitudes y su estado actual</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="font-medium">{request.id}</div>
                  <div className="text-sm text-muted-foreground">{request.client.name}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{request.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
