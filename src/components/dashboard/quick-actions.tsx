import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardPlus, Users, Map, LineChart } from 'lucide-react';
import Link from 'next/link';

const actions = [
    { icon: ClipboardPlus, title: "Nueva Solicitud", description: "Crear servicio", href: "/services", label: "Rápido" },
    { icon: Users, title: "Gestionar Clientes", description: "Ver todos", href: "/management", label: "Gestión" },
    { icon: Map, title: "Seguimiento", description: "En tiempo real", href: "/tracking", label: "Live" },
]

export default function QuickActions() {
  return (
    <Card className="h-full bg-card/60 border-none">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Acciones Rápidas
        </CardTitle>
        <CardDescription>Gestiona tu operación de manera eficiente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action) => (
            <Link href={action.href} key={action.title}>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                            <action.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold">{action.title}</p>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{action.label}</p>
                </div>
            </Link>
        ))}
      </CardContent>
    </Card>
  );
}
