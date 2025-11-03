import { Button } from '@/components/ui/button';
import { MapPin, Send, PlayCircle } from 'lucide-react';

export default function TrackingActions() {
  return (
    <div className="flex items-center gap-4">
      <Button variant="outline">
        <MapPin className="mr-2 h-4 w-4" />
        Asignar Rutas
      </Button>
      <Button variant="outline">
        <Send className="mr-2 h-4 w-4" />
        Marcar en Tránsito
      </Button>
      <Button>
        <PlayCircle className="mr-2 h-4 w-4" />
        Iniciar Movimiento
      </Button>
    </div>
  );
}
