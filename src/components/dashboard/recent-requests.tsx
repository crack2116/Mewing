'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { db, auth } from "@/app/management/firebase";
import { collection, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

interface ServiceRequest {
  id: string;
  clientId: string;
  status: string;
  requestDate?: any;
  serviceDate?: any;
  pickupLocation?: string;
  destination?: string;
}

interface Client {
  id: string;
  name: string;
}

export default function RecentRequests() {
  const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>([]);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Cargar clientes para mapear IDs a nombres
        const clientsSnapshot = await getDocs(collection(db, 'clients'));
        const clientsMap: Record<string, Client> = {};
        clientsSnapshot.docs.forEach(doc => {
          clientsMap[doc.id] = {
            id: doc.id,
            name: doc.data().name || 'Cliente Desconocido'
          };
        });
        setClients(clientsMap);

        // Cargar solicitudes recientes (últimas 5)
        const servicesQuery = query(
          collection(db, 'serviceRequests'),
          orderBy('requestDate', 'desc'),
          limit(5)
        );
        
        const servicesSnapshot = await getDocs(servicesQuery);
        const requests: ServiceRequest[] = [];
        
        servicesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          requests.push({
            id: doc.id,
            clientId: data.clientId || 'N/A',
            status: data.status || 'Pendiente',
            requestDate: data.requestDate,
            serviceDate: data.serviceDate,
            pickupLocation: data.pickupLocation,
            destination: data.destination,
          });
        });

        setRecentRequests(requests);
      } catch (error) {
        console.error('Error loading recent requests:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'success';
      case 'Cancelado':
        return 'destructive';
      case 'Asignado':
      case 'En tránsito':
        return 'default';
      default:
        return 'outline';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      const dateObj = date instanceof Timestamp 
        ? date.toDate() 
        : new Date(date);
      return format(dateObj, 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'N/A';
    }
  };

  const getClientName = (clientId: string) => {
    if (clientId === 'N/A') return 'Cliente Desconocido';
    return clients[clientId]?.name || clientId;
  };

  if (loading) {
    return (
      <Card className="h-full bg-card/60 border-none">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Solicitudes de Servicio Recientes
          </CardTitle>
          <CardDescription>Últimas solicitudes y su estado actual</CardDescription>
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
          <ClipboardList className="h-5 w-5" />
          Solicitudes de Servicio Recientes
        </CardTitle>
        <CardDescription>Últimas solicitudes y su estado actual</CardDescription>
      </CardHeader>
      <CardContent>
        {recentRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay solicitudes recientes</p>
            <Link href="/services" className="text-primary hover:underline text-sm mt-2 inline-block">
              Ver todas las solicitudes
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b-white/10">
                <TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRequests.map((request) => (
                <TableRow key={request.id} className="border-b-white/10">
                  <TableCell>
                    <div className="font-medium">{getClientName(request.clientId)}</div>
                    {request.pickupLocation && request.destination && (
                      <div className="text-sm text-muted-foreground">
                        {request.pickupLocation} → {request.destination}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(request.status) as any} className="capitalize text-xs font-normal">
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(request.requestDate || request.serviceDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
