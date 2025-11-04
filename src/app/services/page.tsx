'use client';
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db, auth } from "@/app/management/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { PlusCircle, MoreHorizontal, UserPlus, Pencil, Copy, XCircle, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";


interface ServiceRequest {
  id: string;
  clientId?: string;
  destination?: string;
  driverId?: string;
  pickupLocation?: string;
  requestDate?: string;
  serviceDate?: string;
  specialRequirements?: string;
  status?: string;
  vehicleId?: string;
}

export default function ServicesPage() {
  const [date, setDate] = useState<Date | undefined>();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authenticate and load service requests from Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Error signing in:', error);
          setLoading(false);
          setError('Error de autenticación');
        }
      } else {
        // Load service requests from Firestore
        const unsubscribeRequests = onSnapshot(collection(db, 'serviceRequests'), (snapshot) => {
          const requestsData: ServiceRequest[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: data.id || doc.id,
              clientId: data.clientId || 'N/A',
              destination: data.destination || 'N/A',
              driverId: data.driverId || 'N/A',
              pickupLocation: data.pickupLocation || 'N/A',
              requestDate: data.requestDate || '',
              serviceDate: data.serviceDate || '',
              specialRequirements: data.specialRequirements || '',
              status: data.status || 'Pendiente',
              vehicleId: data.vehicleId || 'N/A',
            };
          });
          
          // Remove duplicates based on id
          const uniqueRequests = requestsData.filter((request, index, self) => 
            index === self.findIndex((r) => r.id === request.id)
          );
          
          setServiceRequests(uniqueRequests);
          setLoading(false);
        }, (error) => {
          console.error('Error loading service requests:', error);
          setLoading(false);
          setError('Error al cargar solicitudes de servicio');
        });
        
        return () => unsubscribeRequests();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const getStatusVariant = (status?: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('completed') || statusLower === 'completado') {
      return 'success'; // Verde brillante
    }
    if (statusLower.includes('cancel') || statusLower === 'cancelado') {
      return 'destructive'; // Rojo
    }
    if (statusLower.includes('progress') || statusLower.includes('in progress') || statusLower === 'en progreso') {
      return 'info'; // Azul
    }
    if (statusLower.includes('assign') || statusLower === 'asignado') {
      return 'warning'; // Amarillo
    }
    if (statusLower.includes('pending') || statusLower === 'pendiente') {
      return 'pending'; // Gris oscuro
    }
    return 'pending'; // Por defecto, gris para pendiente
  }

  const formatStatus = (status?: string): string => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('completed')) return 'Completado';
    if (statusLower.includes('cancel')) return 'Cancelado';
    if (statusLower.includes('assign')) return 'Asignado';
    if (statusLower.includes('progress') || statusLower.includes('in progress')) return 'En Progreso';
    if (statusLower.includes('pending')) return 'Pendiente';
    return status || 'Pendiente';
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (e) {
      return dateString;
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">Solicitudes de Servicio</h1>
            <p className="text-muted-foreground">Gestiona y asigna todas las solicitudes de transporte.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Nueva Solicitud
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Nueva Solicitud de Servicio</DialogTitle>
              <DialogDescription>
                Completa los detalles a continuación para crear una nueva solicitud de servicio de transporte.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="pickup-location">Ubicación de Recogida</Label>
                        <Input id="pickup-location" placeholder="ej., Calle Principal 123, Piura" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="destination">Destino</Label>
                        <Input id="destination" placeholder="ej., Av. Mercado 456, Sullana" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="service-date">Fecha del Servicio</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start" side="bottom">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client">Cliente</Label>
                        <Input id="client" placeholder="Test Client" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="special-requirements">Requerimientos Especiales</Label>
                    <Textarea id="special-requirements" placeholder="ej., Artículos frágiles, requiere refrigeración" />
                </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Enviar Solicitud</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="mt-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Solicitud</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Fecha de Servicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Conductor</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Cargando solicitudes...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : serviceRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No se encontraron solicitudes de servicio
                  </TableCell>
                </TableRow>
              ) : (
                serviceRequests.map((request, index) => (
                  <TableRow key={request.id || `request-${index}`}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{request.clientId}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={request.pickupLocation}>
                        {request.pickupLocation}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={request.destination}>
                        {request.destination}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(request.serviceDate)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(request.status)}
                        className="font-semibold"
                      >
                        {formatStatus(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.driverId}</TableCell>
                    <TableCell>{request.vehicleId}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Asignar Conductor
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar ID
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
