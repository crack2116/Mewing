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
import { collection, onSnapshot, doc, updateDoc, getDocs, query, where, addDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { PlusCircle, MoreHorizontal, UserPlus, Pencil, Copy, XCircle, Trash2, Calendar as CalendarIcon, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


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
  price?: number;
}

interface Driver {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

interface Vehicle {
  id: string;
  licensePlate?: string;
  plate?: string;
}

export default function ServicesPage() {
  const [date, setDate] = useState<Date | undefined>();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Estados para modales
  const [assignDriverOpen, setAssignDriverOpen] = useState(false);
  const [editRequestOpen, setEditRequestOpen] = useState(false);
  const [cancelRequestOpen, setCancelRequestOpen] = useState(false);
  const [deleteRequestOpen, setDeleteRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  
  // Función para obtener el nombre del conductor por ID
  const getDriverName = (driverId?: string): string => {
    if (!driverId || driverId === 'N/A') return 'No asignado';
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      if (driver.firstName && driver.lastName) {
        return `${driver.firstName} ${driver.lastName}`;
      }
      if (driver.name) {
        return driver.name;
      }
    }
    return driverId; // Si no se encuentra, mostrar el ID
  };
  
  // Función para obtener la placa del vehículo por ID
  const getVehiclePlate = (vehicleId?: string): string => {
    if (!vehicleId || vehicleId === 'N/A') return 'No asignado';
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      return vehicle.licensePlate || vehicle.id;
    }
    return vehicleId; // Si no se encuentra, mostrar el ID
  };
  
  // Formulario para crear nueva solicitud
  const [createForm, setCreateForm] = useState({
    clientId: '',
    pickupLocation: '',
    destination: '',
    serviceDate: '',
    specialRequirements: '',
    price: '',
  });
  const [savingRequest, setSavingRequest] = useState(false);
  const [createRequestOpen, setCreateRequestOpen] = useState(false);
  
  // Formulario para editar
  const [editForm, setEditForm] = useState<ServiceRequest>({
    id: '',
    clientId: '',
    destination: '',
    driverId: '',
    pickupLocation: '',
    serviceDate: '',
    specialRequirements: '',
    status: '',
    vehicleId: '',
    price: 0,
  });

  // Authenticate and load service requests from Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Usuario no autenticado - será redirigido por ProtectedLayout
        setLoading(false);
        setError('Por favor, inicia sesión para acceder a esta página.');
        return;
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
              serviceDate: data.serviceDate instanceof Timestamp 
                ? data.serviceDate.toDate().toISOString()
                : data.serviceDate || '',
              specialRequirements: data.specialRequirements || '',
              status: data.status || 'Pendiente',
              vehicleId: data.vehicleId || 'N/A',
              price: data.price || 0,
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

  // Crear nueva solicitud
  const handleCreateRequest = async () => {
    if (!createForm.clientId || !createForm.pickupLocation || !createForm.destination || !createForm.serviceDate || !createForm.price) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios (Cliente, Origen, Destino, Fecha y Precio)",
        variant: "destructive",
      });
      return;
    }

    if (!auth.currentUser) {
      toast({
        title: "Error",
        description: "No estás autenticado",
        variant: "destructive",
      });
      return;
    }

    setSavingRequest(true);
    try {
      const serviceData = {
        clientId: createForm.clientId.trim(),
        pickupLocation: createForm.pickupLocation.trim(),
        destination: createForm.destination.trim(),
        serviceDate: Timestamp.fromDate(new Date(createForm.serviceDate)),
        specialRequirements: createForm.specialRequirements.trim() || undefined,
        status: 'Pendiente',
        requestDate: Timestamp.now(),
        price: parseFloat(createForm.price) || 0,
      };

      await addDoc(collection(db, 'serviceRequests'), serviceData);

      toast({
        title: "Solicitud creada",
        description: "La solicitud ha sido creada exitosamente.",
      });

      // Reset form
      setCreateForm({
        clientId: '',
        pickupLocation: '',
        destination: '',
        serviceDate: '',
        specialRequirements: '',
        price: '',
      });
      setCreateRequestOpen(false);
      setDate(undefined);
    } catch (error: any) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la solicitud",
        variant: "destructive",
      });
    } finally {
      setSavingRequest(false);
    }
  };

  // Cargar conductores y vehículos
  const loadDriversAndVehicles = async () => {
    setLoadingDrivers(true);
    setLoadingVehicles(true);
    try {
      const driversSnapshot = await getDocs(collection(db, 'drivers'));
      const driversData: Driver[] = driversSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          name: data.name,
        };
      });
      setDrivers(driversData);

      const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
      const vehiclesData: Vehicle[] = vehiclesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          licensePlate: data.licensePlate || data.plate,
        };
      });
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading drivers/vehicles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar conductores y vehículos",
        variant: "destructive",
      });
    } finally {
      setLoadingDrivers(false);
      setLoadingVehicles(false);
    }
  };
  
  // Cargar conductores y vehículos al montar el componente
  useEffect(() => {
    loadDriversAndVehicles();
  }, []);

  // Asignar conductor y vehículo
  const handleAssignDriver = async (driverId: string, vehicleId: string) => {
    if (!selectedRequest) return;

    try {
      // Buscar el documento por ID o por el campo id
      const requestsSnapshot = await getDocs(collection(db, 'serviceRequests'));
      let requestDoc = null;
      
      for (const docSnap of requestsSnapshot.docs) {
        const data = docSnap.data();
        if (data.id === selectedRequest.id || docSnap.id === selectedRequest.id) {
          requestDoc = docSnap;
          break;
        }
      }

      if (!requestDoc) {
        throw new Error('Solicitud no encontrada');
      }

      await updateDoc(doc(db, 'serviceRequests', requestDoc.id), {
        driverId: driverId,
        vehicleId: vehicleId,
        status: 'Asignado',
      });

      toast({
        title: "Conductor asignado",
        description: "El conductor y vehículo han sido asignados exitosamente.",
      });
      setAssignDriverOpen(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Error assigning driver:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo asignar el conductor",
        variant: "destructive",
      });
    }
  };

  // Editar solicitud
  const handleEditRequest = async () => {
    if (!selectedRequest) return;

    try {
      const requestsSnapshot = await getDocs(collection(db, 'serviceRequests'));
      let requestDoc = null;
      
      for (const docSnap of requestsSnapshot.docs) {
        const data = docSnap.data();
        if (data.id === selectedRequest.id || docSnap.id === selectedRequest.id) {
          requestDoc = docSnap;
          break;
        }
      }

      if (!requestDoc) {
        throw new Error('Solicitud no encontrada');
      }

      await updateDoc(doc(db, 'serviceRequests', requestDoc.id), {
        clientId: editForm.clientId,
        pickupLocation: editForm.pickupLocation,
        destination: editForm.destination,
        serviceDate: editForm.serviceDate 
          ? Timestamp.fromDate(new Date(editForm.serviceDate)) 
          : editForm.serviceDate,
        specialRequirements: editForm.specialRequirements || undefined,
        price: editForm.price || 0,
      });

      toast({
        title: "Solicitud actualizada",
        description: "Los cambios han sido guardados exitosamente.",
      });
      setEditRequestOpen(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Error editing request:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la solicitud",
        variant: "destructive",
      });
    }
  };

  // Cancelar solicitud
  const handleCancelRequest = async () => {
    if (!selectedRequest) return;

    try {
      const requestsSnapshot = await getDocs(collection(db, 'serviceRequests'));
      let requestDoc = null;
      
      for (const docSnap of requestsSnapshot.docs) {
        const data = docSnap.data();
        if (data.id === selectedRequest.id || docSnap.id === selectedRequest.id) {
          requestDoc = docSnap;
          break;
        }
      }

      if (!requestDoc) {
        throw new Error('Solicitud no encontrada');
      }

      await updateDoc(doc(db, 'serviceRequests', requestDoc.id), {
        status: 'Cancelado',
      });

      toast({
        title: "Solicitud cancelada",
        description: "La solicitud ha sido cancelada exitosamente.",
      });
      setCancelRequestOpen(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Error canceling request:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cancelar la solicitud",
        variant: "destructive",
      });
    }
  };

  // Eliminar solicitud
  const handleDeleteRequest = async () => {
    if (!selectedRequest) return;

    try {
      const requestsSnapshot = await getDocs(collection(db, 'serviceRequests'));
      let requestDoc = null;
      
      for (const docSnap of requestsSnapshot.docs) {
        const data = docSnap.data();
        if (data.id === selectedRequest.id || docSnap.id === selectedRequest.id) {
          requestDoc = docSnap;
          break;
        }
      }

      if (!requestDoc) {
        throw new Error('Solicitud no encontrada');
      }

      await deleteDoc(doc(db, 'serviceRequests', requestDoc.id));

      toast({
        title: "Solicitud eliminada",
        description: "La solicitud ha sido eliminada exitosamente.",
      });
      setDeleteRequestOpen(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Error deleting request:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la solicitud",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">Solicitudes de Servicio</h1>
            <p className="text-muted-foreground">Gestiona y asigna todas las solicitudes de transporte.</p>
        </div>
        <Dialog open={createRequestOpen} onOpenChange={(open) => {
          setCreateRequestOpen(open);
          if (!open) {
            setCreateForm({
              clientId: '',
              pickupLocation: '',
              destination: '',
              serviceDate: '',
              specialRequirements: '',
              price: '',
            });
            setDate(undefined);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateRequestOpen(true)}>
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
                        <Label htmlFor="create-client">Cliente *</Label>
                        <Input 
                          id="create-client" 
                          placeholder="ID del cliente" 
                          value={createForm.clientId}
                          onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create-price">Precio (S/) *</Label>
                        <Input 
                          id="create-price" 
                          type="number" 
                          placeholder="ej., 150" 
                          value={createForm.price}
                          onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                          min="0"
                          step="0.01"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="pickup-location">Ubicación de Recogida *</Label>
                        <Input 
                          id="pickup-location" 
                          placeholder="ej., Calle Principal 123, Piura" 
                          value={createForm.pickupLocation}
                          onChange={(e) => setCreateForm({ ...createForm, pickupLocation: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="destination">Destino *</Label>
                        <Input 
                          id="destination" 
                          placeholder="ej., Av. Mercado 456, Sullana" 
                          value={createForm.destination}
                          onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="service-date">Fecha del Servicio *</Label>
                        <Input
                          id="service-date"
                          type="datetime-local"
                          value={createForm.serviceDate}
                          onChange={(e) => setCreateForm({ ...createForm, serviceDate: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="special-requirements">Requerimientos Especiales</Label>
                    <Textarea 
                      id="special-requirements" 
                      placeholder="ej., Artículos frágiles, requiere refrigeración" 
                      value={createForm.specialRequirements}
                      onChange={(e) => setCreateForm({ ...createForm, specialRequirements: e.target.value })}
                    />
                </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setCreateRequestOpen(false);
                setCreateForm({
                  clientId: '',
                  pickupLocation: '',
                  destination: '',
                  serviceDate: '',
                  specialRequirements: '',
                  price: '',
                });
                setDate(undefined);
              }} disabled={savingRequest}>
                Cancelar
              </Button>
              <Button onClick={handleCreateRequest} disabled={savingRequest}>
                {savingRequest ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Crear Solicitud'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="mt-4">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[900px]">
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
                    <TableCell>
                      {request.status === 'Asignado' && request.driverId && request.driverId !== 'N/A' ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="warning" className="font-semibold">Asignado</Badge>
                          <span className="text-sm text-muted-foreground">
                            {getDriverName(request.driverId)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No asignado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.status === 'Asignado' && request.vehicleId && request.vehicleId !== 'N/A' ? (
                        <span className="text-sm">
                          {getVehiclePlate(request.vehicleId)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No asignado</span>
                      )}
                    </TableCell>
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRequest(request);
                              loadDriversAndVehicles();
                              setAssignDriverOpen(true);
                            }}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Asignar Conductor
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRequest(request);
                              // Convertir serviceDate si es Timestamp de Firestore
                              let serviceDateValue = '';
                              if (request.serviceDate) {
                                if (request.serviceDate instanceof Timestamp) {
                                  serviceDateValue = new Date(request.serviceDate.toDate()).toISOString().slice(0, 16);
                                } else if (typeof request.serviceDate === 'string') {
                                  // Intentar parsear la fecha
                                  const date = new Date(request.serviceDate);
                                  if (!isNaN(date.getTime())) {
                                    serviceDateValue = date.toISOString().slice(0, 16);
                                  }
                                }
                              }
                              setEditForm({
                                ...request,
                                serviceDate: serviceDateValue,
                              });
                              setEditRequestOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(request.id);
                                toast({
                                  title: "ID copiado",
                                  description: `El ID ${request.id} ha sido copiado al portapapeles.`,
                                });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "No se pudo copiar el ID",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar ID
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500"
                            onClick={() => {
                              setSelectedRequest(request);
                              setCancelRequestOpen(true);
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500"
                            onClick={() => {
                              setSelectedRequest(request);
                              setDeleteRequestOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
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

      {/* Modal Asignar Conductor */}
      <Dialog open={assignDriverOpen} onOpenChange={setAssignDriverOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Conductor y Vehículo</DialogTitle>
            <DialogDescription>
              Selecciona un conductor y vehículo para la solicitud {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Conductor</Label>
              {loadingDrivers ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Cargando conductores...</span>
                </div>
              ) : (
                <Select
                  onValueChange={(value) => {
                    setEditForm({ ...editForm, driverId: value });
                  }}
                  defaultValue={selectedRequest?.driverId || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un conductor" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.firstName && driver.lastName
                          ? `${driver.firstName} ${driver.lastName}`
                          : driver.name || driver.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Vehículo</Label>
              {loadingVehicles ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Cargando vehículos...</span>
                </div>
              ) : (
                <Select
                  onValueChange={(value) => {
                    setEditForm({ ...editForm, vehicleId: value });
                  }}
                  defaultValue={selectedRequest?.vehicleId || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.licensePlate || vehicle.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDriverOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (editForm.driverId && editForm.vehicleId) {
                  handleAssignDriver(editForm.driverId, editForm.vehicleId);
                } else {
                  toast({
                    title: "Error",
                    description: "Por favor selecciona un conductor y un vehículo",
                    variant: "destructive",
                  });
                }
              }}
            >
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={editRequestOpen} onOpenChange={setEditRequestOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Editar Solicitud</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la solicitud {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-client">Cliente</Label>
                <Input
                  id="edit-client"
                  value={editForm.clientId}
                  onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-service-date">Fecha de Servicio</Label>
                <Input
                  id="edit-service-date"
                  type="datetime-local"
                  value={typeof editForm.serviceDate === 'string' && editForm.serviceDate ? editForm.serviceDate : ''}
                  onChange={(e) => setEditForm({ ...editForm, serviceDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Precio (S/)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editForm.price || 0}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pickup">Ubicación de Recogida</Label>
              <Input
                id="edit-pickup"
                value={editForm.pickupLocation}
                onChange={(e) => setEditForm({ ...editForm, pickupLocation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-destination">Destino</Label>
              <Input
                id="edit-destination"
                value={editForm.destination}
                onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-requirements">Requerimientos Especiales</Label>
              <Textarea
                id="edit-requirements"
                value={editForm.specialRequirements}
                onChange={(e) => setEditForm({ ...editForm, specialRequirements: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRequestOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditRequest}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Cancelar */}
      <AlertDialog open={cancelRequestOpen} onOpenChange={setCancelRequestOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará la solicitud {selectedRequest?.id}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Eliminar */}
      <AlertDialog open={deleteRequestOpen} onOpenChange={setDeleteRequestOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la solicitud {selectedRequest?.id}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
