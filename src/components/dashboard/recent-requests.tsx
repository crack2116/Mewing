import {
  Table,
  TableBody,
  TableCell,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";

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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline">
          Solicitudes Recientes
        </CardTitle>
        <CardDescription>Tienes {serviceRequests.filter(r => r.status === 'Asignado').length} solicitudes activas.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[380px]">
          <div className="space-y-6">
            {serviceRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{request.client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-sm">{request.client.name}</div>
                  <div className="text-xs text-muted-foreground">{request.details.title}</div>
                </div>
                <Badge variant={getStatusVariant(request.status)} className="capitalize text-xs">{request.status}</Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
