'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '@/app/management/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Loader2, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  vehicleId?: string;
  driverId?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [deleteRouteId, setDeleteRouteId] = useState<string | null>(null);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [routeForm, setRouteForm] = useState({
    name: '',
    origin: '',
    destination: '',
    vehicleId: '',
    driverId: '',
  });
  const [savingRoute, setSavingRoute] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const routesSnapshot = await getDocs(collection(db, 'routes'));
        const routesData = routesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Route));
        setRoutes(routesData);
      } catch (error) {
        console.error('Error loading routes:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las rutas',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  const handleSaveRoute = async () => {
    if (!routeForm.name || !routeForm.origin || !routeForm.destination) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    setSavingRoute(true);
    try {
      const routeData = {
        name: routeForm.name.trim(),
        origin: routeForm.origin.trim(),
        destination: routeForm.destination.trim(),
        vehicleId: routeForm.vehicleId || undefined,
        driverId: routeForm.driverId || undefined,
        status: 'active' as const,
        createdAt: editingRoute ? editingRoute.createdAt : Timestamp.now(),
      };

      if (editingRoute) {
        await updateDoc(doc(db, 'routes', editingRoute.id), routeData);
        toast({
          title: 'Ruta actualizada',
          description: 'La ruta ha sido actualizada exitosamente.',
        });
      } else {
        await addDoc(collection(db, 'routes'), routeData);
        toast({
          title: 'Ruta creada',
          description: 'La ruta ha sido creada exitosamente.',
        });
      }

      // Recargar rutas
      const routesSnapshot = await getDocs(collection(db, 'routes'));
      const routesData = routesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Route));
      setRoutes(routesData);

      // Reset form
      setRouteForm({
        name: '',
        origin: '',
        destination: '',
        vehicleId: '',
        driverId: '',
      });
      setEditingRoute(null);
      setRouteDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving route:', error);
      toast({
        title: 'Error',
        description: `No se pudo guardar la ruta: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setSavingRoute(false);
    }
  };

  const handleEditRoute = (route: Route) => {
    setEditingRoute(route);
    setRouteForm({
      name: route.name,
      origin: route.origin,
      destination: route.destination,
      vehicleId: route.vehicleId || '',
      driverId: route.driverId || '',
    });
    setRouteDialogOpen(true);
  };

  const handleDeleteRoute = async () => {
    if (!deleteRouteId) return;

    try {
      await deleteDoc(doc(db, 'routes', deleteRouteId));
      toast({
        title: 'Ruta eliminada',
        description: 'La ruta ha sido eliminada exitosamente.',
      });

      // Recargar rutas
      const routesSnapshot = await getDocs(collection(db, 'routes'));
      const routesData = routesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Route));
      setRoutes(routesData);

      setDeleteRouteId(null);
    } catch (error: any) {
      console.error('Error deleting route:', error);
      toast({
        title: 'Error',
        description: `No se pudo eliminar la ruta: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const getStatusVariant = (status: Route['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: Route['status']) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl font-headline">Gestión de Rutas</h1>
          <p className="text-muted-foreground">
            Administra las rutas de transporte registradas.
          </p>
        </div>
        <Dialog open={routeDialogOpen} onOpenChange={(open) => {
          setRouteDialogOpen(open);
          if (!open) {
            setEditingRoute(null);
            setRouteForm({
              name: '',
              origin: '',
              destination: '',
              vehicleId: '',
              driverId: '',
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Ruta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">
                {editingRoute ? 'Editar Ruta' : 'Agregar Nueva Ruta'}
              </DialogTitle>
              <DialogDescription>
                {editingRoute ? 'Modifica los detalles de la ruta.' : 'Completa los detalles para registrar una nueva ruta.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="route-name">Nombre de la Ruta</Label>
                <Input
                  id="route-name"
                  placeholder="Ej. Ruta Lima - Piura"
                  value={routeForm.name}
                  onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route-origin">Origen</Label>
                <Input
                  id="route-origin"
                  placeholder="Ej. Lima, Perú"
                  value={routeForm.origin}
                  onChange={(e) => setRouteForm({ ...routeForm, origin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route-destination">Destino</Label>
                <Input
                  id="route-destination"
                  placeholder="Ej. Piura, Perú"
                  value={routeForm.destination}
                  onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route-vehicle">ID del Vehículo (Opcional)</Label>
                <Input
                  id="route-vehicle"
                  placeholder="Ej. ABC-123"
                  value={routeForm.vehicleId}
                  onChange={(e) => setRouteForm({ ...routeForm, vehicleId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route-driver">ID del Conductor (Opcional)</Label>
                <Input
                  id="route-driver"
                  placeholder="Ej. C0001"
                  value={routeForm.driverId}
                  onChange={(e) => setRouteForm({ ...routeForm, driverId: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRouteDialogOpen(false);
                  setEditingRoute(null);
                  setRouteForm({
                    name: '',
                    origin: '',
                    destination: '',
                    vehicleId: '',
                    driverId: '',
                  });
                }}
                disabled={savingRoute}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveRoute} disabled={savingRoute}>
                {savingRoute ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : editingRoute ? (
                  'Actualizar Ruta'
                ) : (
                  'Crear Ruta'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Conductor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay rutas registradas
                </TableCell>
              </TableRow>
            ) : (
              routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.name}</TableCell>
                  <TableCell>{route.origin}</TableCell>
                  <TableCell>{route.destination}</TableCell>
                  <TableCell>{route.vehicleId || 'N/A'}</TableCell>
                  <TableCell>{route.driverId || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(route.status) as any}>
                      {getStatusLabel(route.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(route.createdAt.toDate(), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditRoute(route)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteRouteId(route.id)}
                          className="text-destructive"
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
      </div>

      <AlertDialog open={deleteRouteId !== null} onOpenChange={(open) => !open && setDeleteRouteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la ruta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoute}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

