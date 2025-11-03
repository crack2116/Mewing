import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardPaste, Users, Map, LineChart } from 'lucide-react';
import Link from 'next/link';

const actions = [
    { icon: ClipboardPaste, label: "Nueva Solicitud", href: "/services" },
    { icon: Users, label: "Gestionar Clientes", href: "/management" },
    { icon: Map, label: "Ver Seguimiento", href: "/tracking" },
    { icon: LineChart, label: "Ver Reportes", href: "/reports" },
]

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Acciones Rápidas</CardTitle>
        <CardDescription>Atajos a tareas comunes.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
            <Button key={action.label} variant="outline" asChild className="flex flex-col h-24 items-center justify-center gap-2 text-center p-2">
                <Link href={action.href}>
                    <action.icon className="h-6 w-6 text-primary" />
                    <span className="text-xs font-semibold">{action.label}</span>
                </Link>
            </Button>
        ))}
      </CardContent>
    </Card>
  );
}
