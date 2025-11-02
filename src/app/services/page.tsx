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
import { Button } from "@/components/ui/button";
import { serviceRequests } from "@/lib/data";
import type { ServiceRequest } from "@/lib/types";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ServicesPage() {

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
    <>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">Solicitudes de Servicio</h1>
            <p className="text-muted-foreground">Gestiona y asigna todas las solicitudes de transporte.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Nueva Solicitud
        </Button>
      </div>
      <Card className="mt-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Solicitud</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Conductor</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.client.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{request.details.title}</div>
                    <div className="text-sm text-muted-foreground">{request.details.subtitle}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
                  </TableCell>
                  <TableCell>{request.driverId}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
