import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Send, MapPin, Hourglass } from 'lucide-react';

const stats = [
  { title: 'Vehículos Totales', value: '21', description: 'Monitoreando en tiempo real', icon: Truck, color: 'text-blue-400' },
  { title: 'En Tránsito', value: '0', description: 'Realizando servicios', icon: Send, color: 'text-green-400' },
  { title: 'Disponibles', value: '21', description: 'Listos para asignar', icon: MapPin, color: 'text-purple-400' },
  { title: 'Velocidad Promedio', value: '0.0 km/h', description: 'En movimiento activo', icon: Hourglass, color: 'text-yellow-400' },
];

export default function TrackingStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
