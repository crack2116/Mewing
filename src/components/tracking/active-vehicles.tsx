import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin } from 'lucide-react';
import type { ActiveVehicle } from '@/lib/types';

interface ActiveVehiclesProps {
    vehicles: ActiveVehicle[];
}

export default function ActiveVehicles({ vehicles }: ActiveVehiclesProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Truck className="h-6 w-6" />
          Vehículos Activos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          <div className="space-y-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{vehicle.id}</p>
                      <Badge variant={vehicle.status === 'Disponible' ? 'success' : 'default'} className="text-xs">
                        {vehicle.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{vehicle.model}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{vehicle.driverId}</span>
                      <span>{vehicle.otherId}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{vehicle.time}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <p className="text-xs font-medium text-green-500">En vivo</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
