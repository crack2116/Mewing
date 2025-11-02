import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus, Users, Map, LineChart } from "lucide-react";

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><LineChart className="h-6 w-6" /> Acciones Rápidas</CardTitle>
        <CardDescription>Gestiona tu operación de manera eficiente</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <FilePlus className="h-6 w-6"/>
            <div>
              <p className="font-semibold">Nueva Solicitud</p>
              <p className="text-sm text-muted-foreground">Crear servicio</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">Rápido</Button>
        </div>
         <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6"/>
            <div>
              <p className="font-semibold">Gestionar Clientes</p>
              <p className="text-sm text-muted-foreground">Ver todos</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">Gestión</Button>
        </div>
         <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <Map className="h-6 w-6"/>
            <div>
              <p className="font-semibold">Seguimiento</p>
              <p className="text-sm text-muted-foreground">En tiempo real</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">Live</Button>
        </div>
      </CardContent>
    </Card>
  );
}
