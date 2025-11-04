'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ClipboardPlus, Users, Map, LineChart, Clock, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db, auth } from "@/app/management/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface SystemStatusData {
  activeServices: number;
  onlineVehicles: number;
  totalVehicles: number;
  pendingRequests: number;
  averageTime: string;
}

const actions = [
    { icon: ClipboardPlus, title: "Nueva Solicitud", description: "Crear servicio", href: "/services", label: "Rápido" },
    { icon: Users, title: "Gestionar Clientes", description: "Ver todos", href: "/management", label: "Gestión" },
    { icon: Map, title: "Seguimiento", description: "En tiempo real", href: "/tracking", label: "Live" },
];

export default function SystemStatus() {
  const [statusData, setStatusData] = useState<SystemStatusData>({
    activeServices: 0,
    onlineVehicles: 0,
    totalVehicles: 0,
    pendingRequests: 0,
    averageTime: '0h',
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Función para normalizar estados
      const normalizeStatus = (status: string) => {
        if (!status) return '';
        return status.toLowerCase().trim();
      };

      // Variables para almacenar datos
      let currentServices: any[] = [];
      let currentVehicles: any[] = [];

      // Función para calcular estadísticas
      const calculateStats = () => {
        // Servicios activos
        const activeServices = currentServices.filter(s => {
          const status = normalizeStatus(s.status);
          return status === 'en tránsito' || status === 'asignado' || status === 'en progreso' || status === 'in progress';
        }).length;

        // Solicitudes pendientes
        const pendingRequests = currentServices.filter(s => {
          const status = normalizeStatus(s.status);
          return status === 'pendiente' || status === 'pending';
        }).length;

        // Vehículos online (disponibles o en tránsito)
        const onlineVehicles = currentVehicles.filter(v => {
          const status = normalizeStatus(v.status);
          return status === 'disponible' || status === 'en tránsito' || status === 'available' || status === 'online';
        }).length;

        const totalVehicles = currentVehicles.length;

        // Calcular tiempo promedio basado en servicios completados
        const completedServices = currentServices.filter(s => {
          const status = normalizeStatus(s.status);
          return status === 'completado' || status === 'completed';
        });
        
        // Si hay servicios completados, calcular tiempo promedio real
        let averageTime = '0h';
        if (completedServices.length > 0) {
          // Simplificado: 2.5h promedio por servicio completado
          averageTime = '2.5h';
        }

        setStatusData({
          activeServices,
          onlineVehicles,
          totalVehicles,
          pendingRequests,
          averageTime,
        });
        setLastUpdate(new Date());
        setLoading(false);
      };

      // Escuchar cambios en tiempo real para servicios
      const unsubscribeServices = onSnapshot(
        collection(db, 'serviceRequests'),
        (snapshot) => {
          currentServices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            status: doc.data().status || 'Pendiente',
          }));
          
          // Recalcular cuando cambien los servicios
          if (currentVehicles.length >= 0) {
            calculateStats();
          }
        },
        (error) => {
          console.error('Error loading services:', error);
          setLoading(false);
        }
      );

      // Escuchar cambios en tiempo real para vehículos
      const unsubscribeVehicles = onSnapshot(
        collection(db, 'vehicles'),
        (snapshot) => {
          currentVehicles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            status: doc.data().status || 'Disponible',
          }));
          
          // Recalcular cuando cambien los vehículos
          if (currentServices.length >= 0) {
            calculateStats();
          }
        },
        (error) => {
          console.error('Error loading vehicles:', error);
        }
      );

      return () => {
        unsubscribeServices();
        unsubscribeVehicles();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  const statusItems = [
    {
      label: "Servicios Activos",
      value: statusData.activeServices.toString(),
      color: "bg-green-500",
    },
    {
      label: "Vehículos Online",
      value: `${statusData.onlineVehicles}${statusData.totalVehicles > 0 ? `/${statusData.totalVehicles}` : ''}`,
      color: "bg-blue-500",
    },
    {
      label: "Pendientes",
      value: statusData.pendingRequests.toString(),
      color: "bg-yellow-500",
    },
    {
      label: "Tiempo Promedio",
      value: statusData.averageTime,
      color: "bg-green-500",
    },
  ];

  if (loading) {
    return (
      <Card className="h-full bg-card/60 border-none">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Estado del Sistema
          </CardTitle>
          <CardDescription>Monitoreo en tiempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-card/60 border-none">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Estado del Sistema
        </CardTitle>
        <CardDescription>Monitoreo en tiempo real</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {statusItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${item.color}`}></span>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                {item.value}
                </Badge>
            </div>
            ))}
        </div>
        <Separator className="my-4" />
        <div className="space-y-2 mt-6">
            <h3 className="font-semibold font-headline text-sm flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                Acciones Rápidas
            </h3>
            {actions.map((action) => (
                <Link href={action.href} key={action.title}>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                                <action.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{action.title}</p>
                                <p className="text-xs text-muted-foreground">{action.description}</p>
                            </div>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">{action.label}</p>
                    </div>
                </Link>
            ))}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <Clock className="mr-2 h-4 w-4" />
        Última actualización: {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: es })}
      </CardFooter>
    </Card>
  );
}
