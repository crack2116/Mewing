'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Truck, CircleCheckBig, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { db, auth } from "@/app/management/firebase";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface DashboardStats {
  totalRevenue: number;
  servicesInProgress: number;
  completedServices: number;
  pendingRequests: number;
  revenueChange: number;
  completedChange: number;
}

export default function Overview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    servicesInProgress: 0,
    completedServices: 0,
    pendingRequests: 0,
    revenueChange: 0,
    completedChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Función para calcular estadísticas
      const calculateStats = (services: any[]) => {
        // Fecha actual y del mes anterior
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Normalizar estados (case-insensitive)
        const normalizeStatus = (status: string) => {
          if (!status) return '';
          return status.toLowerCase().trim();
        };

        // Calcular estadísticas
        const servicesInProgress = services.filter(s => {
          const status = normalizeStatus(s.status);
          return status === 'en tránsito' || status === 'asignado' || status === 'en progreso' || status === 'in progress';
        }).length;

        const pendingRequests = services.filter(s => {
          const status = normalizeStatus(s.status);
          return status === 'pendiente' || status === 'pending';
        }).length;

        // Servicios completados - incluir TODOS los completados de la BD (sin filtrar por fecha)
        const completedThisMonth = services.filter(s => {
          const status = normalizeStatus(s.status);
          return status === 'completado' || status === 'completed';
        }).length;

        // Para el mes anterior, filtrar por fecha si existe
        const completedLastMonth = services.filter(s => {
          const status = normalizeStatus(s.status);
          if (status !== 'completado' && status !== 'completed') return false;
          
          if (!s.serviceDate) return false;
          
          let serviceDate: Date;
          try {
            if (s.serviceDate instanceof Timestamp) {
              serviceDate = s.serviceDate.toDate();
            } else if (typeof s.serviceDate === 'string') {
              serviceDate = new Date(s.serviceDate);
              if (isNaN(serviceDate.getTime())) return false;
            } else {
              return false;
            }
            
            return serviceDate >= lastMonthStart && serviceDate <= lastMonthEnd;
          } catch {
            return false;
          }
        }).length;

        // Calcular cambio porcentual
        const completedChange = completedLastMonth > 0 
          ? ((completedThisMonth - completedLastMonth) / completedLastMonth) * 100 
          : completedThisMonth > 0 ? 100 : 0;

        // Calcular ingresos totales - sumar TODOS los servicios con precio (sin filtrar por fecha)
        const totalRevenue = services
          .filter(s => {
            // Solo servicios que tienen precio asignado
            return s.price && s.price > 0;
          })
          .reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);

        // Ingresos del mes anterior para comparación
        const lastMonthRevenue = services
          .filter(s => {
            if (!s.price || s.price === 0) return false;
            if (!s.serviceDate) return false;
            
            let serviceDate: Date;
            if (s.serviceDate instanceof Timestamp) {
              serviceDate = s.serviceDate.toDate();
            } else if (typeof s.serviceDate === 'string') {
              serviceDate = new Date(s.serviceDate);
              if (isNaN(serviceDate.getTime())) return false;
            } else {
              return false;
            }
            
            return serviceDate >= lastMonthStart && serviceDate <= lastMonthEnd;
          })
          .reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);

        const revenueChange = lastMonthRevenue > 0 
          ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
          : totalRevenue > 0 ? 100 : 0;

        setStats({
          totalRevenue,
          servicesInProgress,
          completedServices: completedThisMonth,
          pendingRequests,
          revenueChange,
          completedChange,
        });
        setLoading(false);
      };

      // Escuchar cambios en tiempo real
      const unsubscribeServices = onSnapshot(
        collection(db, 'serviceRequests'),
        (snapshot) => {
          const services = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              price: data.price || 0,
              status: data.status || 'Pendiente',
            };
          });
          
          // Debug: ver qué servicios tenemos
          console.log('Servicios cargados:', services.length);
          console.log('Servicios con precio:', services.filter(s => s.price > 0).length);
          console.log('Estados:', services.map(s => s.status));
          
          calculateStats(services);
        },
        (error) => {
          console.error('Error loading dashboard stats:', error);
          setLoading(false);
        }
      );

      return () => unsubscribeServices();
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-none">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardTitle>
              <div className="p-2 rounded-full bg-muted animate-pulse">
                <div className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-10 w-32 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const overviewItems = [
    {
      title: "Ingresos Totales",
      icon: DollarSign,
      value: formatCurrency(stats.totalRevenue),
      description: `${formatPercentage(stats.revenueChange)} desde el último mes`,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-400",
      cardBg: "bg-green-500/5",
      textColor: "text-green-400"
    },
    {
      title: "Servicios en Curso",
      icon: Truck,
      value: stats.servicesInProgress,
      description: "Actualmente en ruta",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      cardBg: "bg-blue-500/5",
      textColor: "text-blue-400"
    },
    {
      title: "Servicios Completados (Mes)",
      icon: CircleCheckBig,
      value: `+${stats.completedServices}`,
      description: `${formatPercentage(stats.completedChange)} desde el último mes`,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
      cardBg: "bg-purple-500/5",
      textColor: "text-purple-400"
    },
    {
      title: "Solicitudes Pendientes",
      icon: Clock,
      value: stats.pendingRequests,
      description: "Esperando asignación",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-400",
      cardBg: "bg-orange-500/5",
      textColor: "text-orange-400"
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {overviewItems.map((item) => (
         <Card key={item.title} className={`border-none ${item.cardBg}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
              <div className={`p-2 rounded-full ${item.iconBg}`}>
                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-headline text-card-foreground">
                {item.value}
              </div>
              <p className={`text-xs ${item.textColor} mt-2 flex items-center`}>
                { item.description.startsWith('A') || item.description.startsWith('E') ? <span className="h-2 w-2 rounded-full bg-current mr-2"></span> : null }
                {item.description}
              </p>
            </CardContent>
          </Card>
      ))}
    </div>
  );
}
