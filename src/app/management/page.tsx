'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { db, auth } from './firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  Building2,
  User,
  Truck,
  Users as UsersIcon,
  PlusCircle,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertCircle, Search as SearchIcon, Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// Tipos para los datos de Firestore
interface Client {
  id: string;
  name: string;
  ruc: string;
  contactName: string;
  contactEmail: string;
  address: string;
}

interface Driver {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Fallback for old data format
  licenseNumber?: string;
  license?: string; // Fallback for old data format
  contactPhone?: string;
  phone?: string; // Fallback for old data format
  dni?: string;
  licenseStatus?: string;
  fechaRegistro?: string;
}

interface Vehicle {
  id: string;
  licensePlate?: string;
  plate?: string; // Fallback for old data format
  make?: string;
  model?: string;
  capacity?: string;
  type?: string;
  tipo?: string; // Spanish version
  driverId?: string;
  lat?: number;
  lng?: number;
  lastUpdate?: string;
}

interface User {
    id: string;
    nombres?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    nombresCompletos?: string;
    username?: string;
    email?: string; // Fallback for old data format
    role?: string;
    dni?: string;
    direccion?: string;
    edad?: number;
    fechaNacimiento?: string;
    fechaRegistro?: string;
}


export default function ManagementPage() {
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Estado para el tab activo (default desde query params o 'clients')
  const [activeTab, setActiveTab] = useState<string>('clients');
  
  // Sincronizar tab activo con query params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['clients', 'drivers', 'vehicles', 'users'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Estados para paginación de clientes
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // User form state
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    dni: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: undefined as Date | undefined,
    direccion: '',
    email: '',
    password: '',
    role: 'assistant',
  });
  const [savingUser, setSavingUser] = useState(false);
  const [searchingDni, setSearchingDni] = useState(false);
  
  // Driver form state
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [driverForm, setDriverForm] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    licenseNumber: '',
    contactPhone: '',
  });
  const [savingDriver, setSavingDriver] = useState(false);
  const [searchingDriverDni, setSearchingDriverDni] = useState(false);
  const [verifyingLicense, setVerifyingLicense] = useState(false);
  
  // Vehicle form state
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    licensePlate: '',
    make: '',
    model: '',
    type: '',
    driverId: '',
  });
  const [savingVehicle, setSavingVehicle] = useState(false);
  
  // Client form state
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    ruc: '',
    name: '',
    contactName: '',
    contactEmail: '',
    address: '',
  });
  const [savingClient, setSavingClient] = useState(false);
  const [searchingRuc, setSearchingRuc] = useState(false);
  const { toast } = useToast();

  // Estados para edición y eliminación
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Function to search RUC in SUNAT API
  const searchRucInSunat = async (ruc: string) => {
    if (!ruc || ruc.length !== 11) {
      toast({
        title: "Error",
        description: "El RUC debe tener 11 dígitos",
        variant: "destructive",
      });
      return;
    }

    setSearchingRuc(true);
    try {
      // Usar API route de Next.js para evitar problemas de CORS
      const response = await fetch(`/api/sunat?ruc=${ruc}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Mapear datos de SUNAT al formulario (diferentes APIs pueden tener diferentes formatos)
      const razonSocial = data.razonSocial || data.nombre || data.name || data.razon_social || '';
      const direccion = data.direccion || data.direccionCompleta || data.address || 
                       data.direccion_completa || data.domicilio || '';
      
      if (!razonSocial) {
        throw new Error('No se encontraron datos de la empresa en SUNAT');
      }

      setClientForm({
        ...clientForm,
        ruc: ruc,
        name: razonSocial,
        address: direccion,
        // Contacto y email no los proporciona SUNAT, se deben ingresar manualmente
      });

      toast({
        title: "Datos encontrados",
        description: `Datos de ${razonSocial} cargados exitosamente desde SUNAT.`,
      });
    } catch (error: any) {
      console.error('Error searching RUC:', error);
      toast({
        title: "Error",
        description: `No se pudo consultar el RUC: ${error.message}. Por favor, completa los campos manualmente.`,
        variant: "destructive",
      });
    } finally {
      setSearchingRuc(false);
    }
  };

  // Function to generate next driver ID code (C0000, C0001, C0002, etc.)
  const generateNextDriverId = async (): Promise<string> => {
    try {
      // Obtener todos los conductores
      const driversSnapshot = await getDocs(collection(db, 'drivers'));
      
      // Extraer todos los códigos de ID que siguen el formato C0000
      const driverIds: number[] = [];
      
      driversSnapshot.docs.forEach(doc => {
        const data = doc.data();
        // Buscar el campo 'id' que tenga formato C####
        const driverId = data.id;
        if (driverId && typeof driverId === 'string' && driverId.startsWith('C')) {
          // Extraer el número después de 'C'
          const numberStr = driverId.substring(1);
          const number = parseInt(numberStr, 10);
          if (!isNaN(number)) {
            driverIds.push(number);
          }
        }
      });
      
      // Encontrar el número más alto
      const maxNumber = driverIds.length > 0 ? Math.max(...driverIds) : -1;
      
      // Generar el siguiente código (incrementar en 1)
      const nextNumber = maxNumber + 1;
      
      // Formatear con ceros a la izquierda (C0000, C0001, etc.)
      const nextId = `C${nextNumber.toString().padStart(4, '0')}`;
      
      console.log('Generando nuevo código de conductor:', {
        maxNumber,
        nextNumber,
        nextId,
        totalDrivers: driversSnapshot.docs.length
      });
      
      return nextId;
    } catch (error) {
      console.error('Error generando código de conductor:', error);
      // Si hay error, usar un código por defecto basado en timestamp
      const timestamp = Date.now();
      const fallbackId = `C${(timestamp % 10000).toString().padStart(4, '0')}`;
      return fallbackId;
    }
  };

  // Function to verify license number
  const verifyLicense = async (licenseNumber: string) => {
    if (!licenseNumber || licenseNumber.length < 8) {
      toast({
        title: "Error",
        description: "El número de licencia debe tener al menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    setVerifyingLicense(true);
    try {
      // Aquí puedes integrar con una API de verificación de licencias
      // Por ahora, solo validamos el formato básico
      // Formato típico: Q12345678 o similar
      
      const licensePattern = /^[A-Z]?\d{8,}$/i;
      if (!licensePattern.test(licenseNumber)) {
        toast({
          title: "Formato inválido",
          description: "El número de licencia debe tener el formato correcto (ej: Q12345678)",
          variant: "destructive",
        });
        setVerifyingLicense(false);
        return;
      }

      // Simular verificación (reemplazar con API real si está disponible)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Licencia verificada",
        description: `El número de licencia ${licenseNumber} ha sido verificado exitosamente.`,
      });
    } catch (error: any) {
      console.error('Error verifying license:', error);
      toast({
        title: "Error",
        description: `No se pudo verificar la licencia: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setVerifyingLicense(false);
    }
  };

  // Function to search DNI in RENIEC API (for driver form)
  const searchDriverDniInReniec = async (dni: string) => {
    if (!dni || dni.length !== 8) {
      toast({
        title: "Error",
        description: "El DNI debe tener 8 dígitos",
        variant: "destructive",
      });
      return;
    }

    setSearchingDriverDni(true);
    try {
      const response = await fetch(`/api/reniec?dni=${dni}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validar estructura de respuesta
      const nombres = data.nombres || data.nombre || '';
      const apellidoPaterno = data.apellidoPaterno || data.apellido_paterno || data.primerApellido || '';
      const apellidoMaterno = data.apellidoMaterno || data.apellido_materno || data.segundoApellido || '';
      
      if (!nombres || !apellidoPaterno || !apellidoMaterno) {
        throw new Error('Datos incompletos en la respuesta de RENIEC');
      }

      // Calcular edad y validar que sea mayor de 18 años
      let fechaNacimiento: Date | undefined = undefined;
      let edad = 0;
      
      const fechaNacStr = data.fechaNacimiento || data.fecha_nacimiento || data.birthDate;
      if (fechaNacStr) {
        fechaNacimiento = new Date(fechaNacStr);
        if (isNaN(fechaNacimiento.getTime())) {
          const parts = fechaNacStr.split('/');
          if (parts.length === 3) {
            fechaNacimiento = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        }
        
        if (!isNaN(fechaNacimiento.getTime())) {
          const today = new Date();
          edad = today.getFullYear() - fechaNacimiento.getFullYear();
          const monthDiff = today.getMonth() - fechaNacimiento.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < fechaNacimiento.getDate())) {
            edad--;
          }
        }
      }

      // Validar que sea mayor de 18 años
      if (edad > 0 && edad < 18) {
        toast({
          title: "Error de validación",
          description: `El conductor debe ser mayor de 18 años. Edad calculada: ${edad} años.`,
          variant: "destructive",
        });
        setSearchingDriverDni(false);
        return;
      }

      // Rellenar el formulario con los datos obtenidos
      setDriverForm({
        ...driverForm,
        dni: dni,
        nombres: nombres,
        apellidos: `${apellidoPaterno} ${apellidoMaterno}`.trim(),
      });

      toast({
        title: "Datos encontrados",
        description: `Datos de ${nombres} ${apellidoPaterno} cargados exitosamente.${edad > 0 ? ` Edad: ${edad} años.` : ''}`,
      });
    } catch (error: any) {
      console.error('Error searching DNI:', error);
      toast({
        title: "Error",
        description: `No se pudo consultar el DNI: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSearchingDriverDni(false);
    }
  };

  // Function to search DNI in RENIEC API
  const searchDniInReniec = async (dni: string) => {
    if (!dni || dni.length !== 8) {
      toast({
        title: "Error",
        description: "El DNI debe tener 8 dígitos",
        variant: "destructive",
      });
      return;
    }

    setSearchingDni(true);
    try {
      // Usar API route de Next.js para evitar problemas de CORS
      const response = await fetch(`/api/reniec?dni=${dni}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validar estructura de respuesta (manejar diferentes formatos de API)
      const nombres = data.nombres || data.nombre || '';
      const apellidoPaterno = data.apellidoPaterno || data.apellido_paterno || data.primerApellido || '';
      const apellidoMaterno = data.apellidoMaterno || data.apellido_materno || data.segundoApellido || '';
      
      if (!nombres || !apellidoPaterno || !apellidoMaterno) {
        throw new Error('Datos incompletos en la respuesta de RENIEC');
      }

      // Calcular edad desde fechaNacimiento (manejar diferentes formatos)
      let fechaNacimiento: Date | undefined = undefined;
      let edad = 0;
      
      const fechaNacStr = data.fechaNacimiento || data.fecha_nacimiento || data.birthDate;
      if (fechaNacStr) {
        // Intentar parsear diferentes formatos de fecha
        fechaNacimiento = new Date(fechaNacStr);
        
        // Si la fecha es inválida, intentar parsear formato DD/MM/YYYY
        if (isNaN(fechaNacimiento.getTime())) {
          const parts = fechaNacStr.split('/');
          if (parts.length === 3) {
            fechaNacimiento = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        }
        
        // Calcular edad
        if (!isNaN(fechaNacimiento.getTime())) {
          const today = new Date();
          edad = today.getFullYear() - fechaNacimiento.getFullYear();
          const monthDiff = today.getMonth() - fechaNacimiento.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < fechaNacimiento.getDate())) {
            edad--;
          }
        }
      }

      // Validar que sea mayor de 18 años (requisito obligatorio)
      if (edad > 0 && edad < 18) {
        toast({
          title: "Error de validación",
          description: `El usuario debe ser mayor de 18 años. Edad calculada: ${edad} años. No se puede registrar.`,
          variant: "destructive",
        });
        setSearchingDni(false);
        // Limpiar campos excepto el DNI
        setUserForm({
          ...userForm,
          nombres: '',
          apellidoPaterno: '',
          apellidoMaterno: '',
          fechaNacimiento: undefined,
          direccion: '',
        });
        return;
      }

      // Si no hay fecha de nacimiento o no se pudo calcular, advertir pero permitir continuar
      if (edad === 0) {
        toast({
          title: "Advertencia",
          description: "No se pudo obtener la fecha de nacimiento. Por favor, verifica manualmente que el usuario sea mayor de 18 años.",
          variant: "default",
        });
      }

      // Rellenar el formulario con los datos obtenidos
      setUserForm({
        ...userForm,
        dni: dni,
        nombres: nombres,
        apellidoPaterno: apellidoPaterno,
        apellidoMaterno: apellidoMaterno,
        fechaNacimiento: fechaNacimiento,
        direccion: data.direccion || data.direccionCompleta || data.domicilio || '',
      });

      toast({
        title: "Datos encontrados",
        description: `Datos de ${nombres} ${apellidoPaterno} cargados exitosamente.${edad > 0 ? ` Edad: ${edad} años.` : ''}`,
      });
    } catch (error: any) {
      console.error('Error searching DNI:', error);
      
      // Si la API no está disponible, mostrar un mensaje informativo
      if (error.message.includes('fetch')) {
        toast({
          title: "API no disponible",
          description: "La API de RENIEC no está configurada. Por favor, completa los campos manualmente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `No se pudo consultar el DNI: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setSearchingDni(false);
    }
  };

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      
      if (!user) {
        // Usuario no autenticado - será redirigido por ProtectedLayout
        setError("Por favor, inicia sesión para acceder a esta página.");
      }
    });

    return () => unsubscribe();
  }, []);

  // Funciones para editar y eliminar CLIENTES
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      ruc: client.ruc || '',
      name: client.name || '',
      contactName: client.contactName || '',
      contactEmail: client.contactEmail || '',
      address: client.address || '',
    });
    setClientDialogOpen(true);
  };

  const handleDeleteClient = async () => {
    console.log('handleDeleteClient called, deletingClientId:', deletingClientId);
    console.log('db:', db);
    console.log('firebaseUser:', firebaseUser);
    
    if (!deletingClientId || !db) {
      console.error('Missing deletingClientId or db');
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente. ID no válido.",
        variant: "destructive",
      });
      setDeletingClientId(null);
      return;
    }
    
    if (!firebaseUser) {
      console.error('User not authenticated');
      toast({
        title: "Error",
        description: "Debes estar autenticado para eliminar clientes.",
        variant: "destructive",
      });
      setDeletingClientId(null);
      return;
    }
    
    try {
      console.log('Attempting to delete client:', deletingClientId);
      const clientRef = doc(db, 'clients', deletingClientId);
      console.log('Client reference:', clientRef);
      
      await deleteDoc(clientRef);
      
      console.log('Client deleted successfully');
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado exitosamente.",
      });
      
      // Refresh clients list
      const clientsSnapshot = await getDocs(collection(db, 'clients'));
      const clientsData = clientsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Client));
      setClients(clientsData);
      
      setDeletingClientId(null);
    } catch (error: any) {
      console.error('Error deleting client:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'No se pudo eliminar el cliente.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'No tienes permisos para eliminar clientes. Verifica las reglas de Firestore y asegúrate de estar autenticado.';
      } else if (error.code === 'not-found') {
        errorMessage = 'El cliente no existe o ya fue eliminado.';
      } else if (error.message) {
        errorMessage = `No se pudo eliminar el cliente: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setDeletingClientId(null);
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient || !db) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente. Datos inválidos.",
        variant: "destructive",
      });
      return;
    }
    
    if (!firebaseUser) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para actualizar clientes.",
        variant: "destructive",
      });
      return;
    }
    
    setSavingClient(true);
    try {
      console.log('Updating client:', editingClient.id);
      console.log('Client data:', clientForm);
      
      const clientRef = doc(db, 'clients', editingClient.id);
      console.log('Client reference:', clientRef);
      
      const updateData = {
        ruc: clientForm.ruc.trim(),
        name: clientForm.name.trim(),
        contactName: clientForm.contactName.trim() || undefined,
        contactEmail: clientForm.contactEmail.trim() || undefined,
        address: clientForm.address.trim() || undefined,
      };
      
      console.log('Update data:', updateData);
      
      await updateDoc(clientRef, updateData);
      
      console.log('Client updated successfully');
      
      toast({
        title: "Cliente actualizado",
        description: `El cliente ${clientForm.name} ha sido actualizado exitosamente.`,
      });
      
      // Refresh clients list
      const clientsSnapshot = await getDocs(collection(db, 'clients'));
      const clientsData = clientsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Client));
      setClients(clientsData);
      
      setEditingClient(null);
      setClientForm({
        ruc: '',
        name: '',
        contactName: '',
        contactEmail: '',
        address: '',
      });
      setClientDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating client:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'No se pudo actualizar el cliente.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'No tienes permisos para actualizar clientes. Verifica las reglas de Firestore.';
      } else if (error.code === 'not-found') {
        errorMessage = 'El cliente no existe o ya fue eliminado.';
      } else if (error.message) {
        errorMessage = `No se pudo actualizar el cliente: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSavingClient(false);
    }
  };

  // Funciones para editar y eliminar CONDUCTORES
  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    const nombres = driver.firstName || driver.name || '';
    const apellidos = driver.lastName || '';
    setDriverForm({
      dni: driver.dni || '',
      nombres: nombres,
      apellidos: apellidos,
      licenseNumber: driver.licenseNumber || driver.license || '',
      contactPhone: driver.contactPhone || driver.phone || '',
    });
    setDriverDialogOpen(true);
  };

  const handleDeleteDriver = async () => {
    if (!deletingDriverId || !db) return;
    
    try {
      await deleteDoc(doc(db, 'drivers', deletingDriverId));
      toast({
        title: "Conductor eliminado",
        description: "El conductor ha sido eliminado exitosamente.",
      });
      setDeletingDriverId(null);
      // Refresh drivers list
      const driversSnapshot = await getDocs(collection(db, 'drivers'));
      const driversData = driversSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Driver));
      setDrivers(driversData);
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el conductor: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleUpdateDriver = async () => {
    if (!editingDriver || !db) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el conductor. Datos inválidos.",
        variant: "destructive",
      });
      return;
    }
    
    if (!firebaseUser) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para actualizar conductores.",
        variant: "destructive",
      });
      return;
    }
    
    setSavingDriver(true);
    try {
      console.log('Updating driver:', editingDriver.id);
      console.log('Driver data:', driverForm);
      
      const apellidosParts = driverForm.apellidos.trim().split(' ');
      const apellidoPaterno = apellidosParts[0] || '';
      const apellidoMaterno = apellidosParts.slice(1).join(' ') || '';
      
      const driverRef = doc(db, 'drivers', editingDriver.id);
      console.log('Driver reference:', driverRef);
      
      const updateData = {
        dni: driverForm.dni.trim(),
        firstName: driverForm.nombres.trim(),
        lastName: driverForm.apellidos.trim(),
        apellidoPaterno: apellidoPaterno,
        apellidoMaterno: apellidoMaterno,
        licenseNumber: driverForm.licenseNumber.trim(),
        contactPhone: driverForm.contactPhone.trim(),
      };
      
      console.log('Update data:', updateData);
      
      await updateDoc(driverRef, updateData);
      
      console.log('Driver updated successfully');
      
      toast({
        title: "Conductor actualizado",
        description: `El conductor ${driverForm.nombres} ${driverForm.apellidos} ha sido actualizado exitosamente.`,
      });
      
      // Refresh drivers list
      const driversSnapshot = await getDocs(collection(db, 'drivers'));
      const driversData = driversSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Driver));
      setDrivers(driversData);
      
      setEditingDriver(null);
      setDriverForm({
        dni: '',
        nombres: '',
        apellidos: '',
        licenseNumber: '',
        contactPhone: '',
      });
      setDriverDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating driver:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'No se pudo actualizar el conductor.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'No tienes permisos para actualizar conductores. Verifica las reglas de Firestore.';
      } else if (error.code === 'not-found') {
        errorMessage = 'El conductor no existe o ya fue eliminado.';
      } else if (error.message) {
        errorMessage = `No se pudo actualizar el conductor: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSavingDriver(false);
    }
  };

  // Funciones para editar y eliminar VEHÍCULOS
  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      licensePlate: vehicle.licensePlate || vehicle.plate || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      type: vehicle.type || vehicle.tipo || '',
      driverId: vehicle.driverId || '',
    });
    setVehicleDialogOpen(true);
  };

  const handleDeleteVehicle = async () => {
    if (!deletingVehicleId || !db) return;
    
    try {
      await deleteDoc(doc(db, 'vehicles', deletingVehicleId));
      toast({
        title: "Vehículo eliminado",
        description: "El vehículo ha sido eliminado exitosamente.",
      });
      setDeletingVehicleId(null);
      // Refresh vehicles list
      const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
      const vehiclesData = vehiclesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Vehicle));
      setVehicles(vehiclesData);
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el vehículo: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle || !db) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el vehículo. Datos inválidos.",
        variant: "destructive",
      });
      return;
    }
    
    if (!firebaseUser) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para actualizar vehículos.",
        variant: "destructive",
      });
      return;
    }
    
    setSavingVehicle(true);
    try {
      console.log('Updating vehicle:', editingVehicle.id);
      console.log('Vehicle data:', vehicleForm);
      
      const vehicleRef = doc(db, 'vehicles', editingVehicle.id);
      console.log('Vehicle reference:', vehicleRef);
      
      // Preparar datos de actualización
      // Firestore no permite undefined, así que usamos null o eliminamos campos vacíos
      const updateData: any = {
        licensePlate: vehicleForm.licensePlate.trim(),
        plate: vehicleForm.licensePlate.trim(),
        make: vehicleForm.make.trim(),
        model: vehicleForm.model.trim(),
      };
      
      // Solo agregar type/tipo si tiene valor
      const vehicleType = vehicleForm.type.trim();
      if (vehicleType) {
        updateData.type = vehicleType;
        updateData.tipo = vehicleType;
      } else {
        // Si está vacío, establecer null (Firestore permite null pero no undefined)
        updateData.type = null;
        updateData.tipo = null;
      }
      
      // Solo agregar driverId si tiene valor
      const driverIdValue = vehicleForm.driverId.trim();
      if (driverIdValue) {
        updateData.driverId = driverIdValue;
      } else {
        updateData.driverId = null;
      }
      
      console.log('Update data:', updateData);
      
      await updateDoc(vehicleRef, updateData);
      
      console.log('Vehicle updated successfully');
      
      toast({
        title: "Vehículo actualizado",
        description: `El vehículo ${vehicleForm.licensePlate} ha sido actualizado exitosamente.`,
      });
      
      // Refresh vehicles list
      const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
      const vehiclesData = vehiclesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Vehicle));
      setVehicles(vehiclesData);
      
      setEditingVehicle(null);
      setVehicleForm({
        licensePlate: '',
        make: '',
        model: '',
        type: '',
        driverId: '',
      });
      setVehicleDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'No se pudo actualizar el vehículo.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'No tienes permisos para actualizar vehículos. Verifica las reglas de Firestore.';
      } else if (error.code === 'not-found') {
        errorMessage = 'El vehículo no existe o ya fue eliminado.';
      } else if (error.message) {
        errorMessage = `No se pudo actualizar el vehículo: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSavingVehicle(false);
    }
  };

  // Funciones para editar y eliminar USUARIOS
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    const nombres = user.nombres || user.nombresCompletos?.split(' ')[0] || '';
    const apellidos = user.apellidoPaterno && user.apellidoMaterno 
      ? `${user.apellidoPaterno} ${user.apellidoMaterno}`
      : user.nombresCompletos?.split(' ').slice(1).join(' ') || '';
    
    let fechaNacimiento: Date | undefined = undefined;
    if (user.fechaNacimiento) {
      fechaNacimiento = new Date(user.fechaNacimiento);
    }
    
    setUserForm({
      dni: user.dni || '',
      nombres: nombres,
      apellidoPaterno: user.apellidoPaterno || '',
      apellidoMaterno: user.apellidoMaterno || '',
      fechaNacimiento: fechaNacimiento,
      direccion: user.direccion || '',
      email: user.email || '',
      password: '',
      role: user.role || 'assistant',
    });
    setUserDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId || !db) return;
    
    try {
      await deleteDoc(doc(db, 'users', deletingUserId));
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente.",
      });
      setDeletingUserId(null);
      // Refresh users list
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      setUsers(usersData);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el usuario: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !db) return;
    
    setSavingUser(true);
    try {
      await updateDoc(doc(db, 'users', editingUser.id), {
        dni: userForm.dni,
        nombres: userForm.nombres.trim(),
        apellidoPaterno: userForm.apellidoPaterno.trim(),
        apellidoMaterno: userForm.apellidoMaterno.trim(),
        fechaNacimiento: userForm.fechaNacimiento ? userForm.fechaNacimiento.toISOString() : undefined,
        direccion: userForm.direccion.trim() || undefined,
        email: userForm.email.trim(),
        role: userForm.role,
      });
      
      toast({
        title: "Usuario actualizado",
        description: `El usuario ${userForm.nombres} ${userForm.apellidoPaterno} ha sido actualizado exitosamente.`,
      });
      
      setEditingUser(null);
      setUserForm({
        dni: '',
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        fechaNacimiento: undefined,
        direccion: '',
        email: '',
        password: '',
        role: 'assistant',
      });
      setUserDialogOpen(false);
      
      // Refresh users list
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      setUsers(usersData);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el usuario: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSavingUser(false);
    }
  };

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      
      if (!user) {
        // Usuario no autenticado - será redirigido por ProtectedLayout
        setError("Por favor, inicia sesión para acceder a esta página.");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Wait for authentication
      if (authLoading) {
        return;
      }

      if (!firebaseUser) {
        setLoading(false);
        setError("Esperando autenticación...");
        return;
      }

      setLoading(true);
      setError(null); // Clear any previous errors
      try {
        console.log("Fetching data from Firestore...", "User:", firebaseUser.uid);
        
        // Fetch Clients
        const clientsSnapshot = await getDocs(collection(db, 'clients'));
        const clientsData = clientsSnapshot.docs.map(doc => {
          const data = doc.data();
          // Ensure we always use the Firestore document ID as the unique key
          return { ...data, id: doc.id } as Client;
        });
        // Remove duplicates based on document ID
        const uniqueClients = clientsData.filter((client, index, self) => 
          index === self.findIndex((c) => c.id === client.id)
        );
        console.log(`Clients found: ${clientsData.length} (unique: ${uniqueClients.length})`, uniqueClients);
        setClients(uniqueClients);

        // Fetch Drivers
        const driversSnapshot = await getDocs(collection(db, 'drivers'));
        console.log("Drivers snapshot:", driversSnapshot.docs.length, "documents");
        const driversData = driversSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Driver document data:", doc.id, data);
          // Ensure we always use the Firestore document ID as the unique key
          return { ...data, id: doc.id } as Driver;
        });
        // Remove duplicates based on document ID
        const uniqueDrivers = driversData.filter((driver, index, self) => 
          index === self.findIndex((d) => d.id === driver.id)
        );
        console.log(`Drivers found: ${driversData.length} (unique: ${uniqueDrivers.length})`, uniqueDrivers);
        setDrivers(uniqueDrivers);

        // Fetch Vehicles
        const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
        console.log("Vehicles snapshot:", vehiclesSnapshot.docs.length, "documents");
        const vehiclesData = vehiclesSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Vehicle document data:", doc.id, data);
          // Ensure we always use the Firestore document ID as the unique key
          return { ...data, id: doc.id } as Vehicle;
        });
        // Remove duplicates based on document ID
        const uniqueVehicles = vehiclesData.filter((vehicle, index, self) => 
          index === self.findIndex((v) => v.id === vehicle.id)
        );
        console.log(`Vehicles found: ${vehiclesData.length} (unique: ${uniqueVehicles.length})`, uniqueVehicles);
        setVehicles(uniqueVehicles);

        // Fetch Users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          // Ensure we always use the Firestore document ID as the unique key
          return { ...data, id: doc.id } as User;
        });
        // Remove duplicates based on document ID
        const uniqueUsers = usersData.filter((user, index, self) => 
          index === self.findIndex((u) => u.id === user.id)
        );
        console.log(`Users found: ${usersData.length} (unique: ${uniqueUsers.length})`, uniqueUsers);
        setUsers(uniqueUsers);

      } catch (error: any) {
        console.error("Error fetching data from Firestore:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        
        // Check if it's a permission error
        if (error?.code === 'permission-denied') {
          const errorMessage = "Error de permisos: Las reglas de seguridad de Firestore están bloqueando el acceso. Ve a Firebase Console > Firestore Database > Reglas y actualiza las reglas para permitir lectura.";
          setError(errorMessage);
          console.error("PERMISSION DENIED: Las reglas de seguridad de Firestore están bloqueando el acceso.");
          console.error("SOLUCIÓN: Ve a Firebase Console > Firestore Database > Reglas");
          console.error("Y actualiza las reglas a:");
          console.error(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
      // O para desarrollo, puedes usar temporalmente:
      // allow read, write: if true;
    }
  }
}
          `);
        } else {
          setError(`Error al cargar datos: ${error?.message || 'Error desconocido'}`);
        }
      } finally {
      setLoading(false);
      }
    };

    if (db && firebaseUser) {
    fetchData();
    } else if (!authLoading && !firebaseUser) {
      console.warn("User not authenticated");
      setLoading(false);
    } else if (!db) {
      console.warn("Firestore database not initialized");
      setLoading(false);
    }
  }, [db, firebaseUser, authLoading]);

  const filteredClients = clients.filter((client) => {
    if (!searchTerm.trim()) return true; // Si no hay término de búsqueda, mostrar todos
    
    const searchLower = searchTerm.toLowerCase().trim();
    const name = (client.name || '').toLowerCase();
    const ruc = (client.ruc || '').toLowerCase();
    const contactName = (client.contactName || '').toLowerCase();
    const contactEmail = (client.contactEmail || '').toLowerCase();
    const address = (client.address || '').toLowerCase();
    
    return (
      name.includes(searchLower) ||
      ruc.includes(searchLower) ||
      contactName.includes(searchLower) ||
      contactEmail.includes(searchLower) ||
      address.includes(searchLower)
    );
  });

  // Cálculo de paginación
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);
  
  // Resetear a página 1 cuando cambia el término de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  // Resetear a página 1 cuando cambia itemsPerPage
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [itemsPerPage, totalPages]);
  
  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      if (currentPage <= 3) {
        // Al inicio
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Al final
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // En el medio
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Cargando datos...</p>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl font-headline">
            Gestión
          </h1>
          <p className="text-muted-foreground">
            Administra clientes, conductores, vehículos y usuarios.
          </p>
        </div>
      </div>

      {authLoading ? (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Autenticando...</AlertTitle>
          <AlertDescription>
            Iniciando sesión automáticamente...
          </AlertDescription>
        </Alert>
      ) : !firebaseUser ? (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Autenticación</AlertTitle>
          <AlertDescription>
            No se pudo autenticar. Por favor, recarga la página o verifica la configuración de Firebase Authentication.
          </AlertDescription>
        </Alert>
      ) : error && error.includes('permisos') ? (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Permisos de Firestore</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{error}</p>
            <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
              <p className="font-semibold mb-2">Información:</p>
              <p className="text-sm mb-2">
                Estás autenticado como: <strong>{firebaseUser.uid}</strong> {firebaseUser.isAnonymous ? '(Anónimo)' : ''}
              </p>
              <p className="text-sm mb-2">
                Las reglas de Firestore requieren autenticación. Si el error persiste, verifica:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Que el usuario tenga permisos en las reglas de Firestore</li>
                <li>Que la colección <code className="bg-background px-1 rounded">users</code> permita <code className="bg-background px-1 rounded">list</code> (actualmente está en <code className="bg-background px-1 rounded">false</code>)</li>
                <li>Que el usuario sea admin para ver drivers y vehicles</li>
              </ul>
              <Button 
                size="sm" 
                className="mt-3"
                onClick={() => window.open('https://console.firebase.google.com/project/studio-4560916840-4310c/firestore/rules', '_blank')}
              >
                Abrir Consola de Firebase
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : error ? (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList>
          <TabsTrigger value="clients">
            <Building2 className="mr-2 h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="drivers">
            <User className="mr-2 h-4 w-4" />
            Conductores
          </TabsTrigger>
          <TabsTrigger value="vehicles">
            <Truck className="mr-2 h-4 w-4" />
            Vehículos
          </TabsTrigger>
          <TabsTrigger value="users">
            <UsersIcon className="mr-2 h-4 w-4" />
            Usuarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold font-headline">Clientes</h2>
              <p className="text-muted-foreground">
                Lista de todos los clientes registrados.
              </p>
            </div>
            <Dialog open={clientDialogOpen} onOpenChange={(open) => {
              setClientDialogOpen(open);
              if (!open) {
                setEditingClient(null);
                setClientForm({
                  ruc: '',
                  name: '',
                  contactName: '',
                  contactEmail: '',
                  address: '',
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Agregar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">{editingClient ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</DialogTitle>
                  <DialogDescription>
                    {editingClient ? 'Modifica los detalles del cliente.' : 'Completa los detalles para registrar un nuevo cliente.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3 space-y-2">
                      <Label htmlFor="client-ruc">RUC</Label>
                      <Input
                        id="client-ruc"
                        placeholder="Ej. 20123456789"
                        value={clientForm.ruc}
                        onChange={(e) => setClientForm({ ...clientForm, ruc: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="mb-0"
                        onClick={() => searchRucInSunat(clientForm.ruc)}
                        disabled={searchingRuc || !clientForm.ruc || clientForm.ruc.length !== 11}
                      >
                        {searchingRuc ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SearchIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Nombre / Razón Social</Label>
                    <Input
                      id="client-name"
                      placeholder="Ej. Empresa SAC"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-contact">Contacto</Label>
                    <Input
                      id="client-contact"
                      placeholder="Ej. Juan Pérez"
                      value={clientForm.contactName}
                      onChange={(e) => setClientForm({ ...clientForm, contactName: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Correo de Contacto</Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="Ej. contacto@empresa.com"
                      value={clientForm.contactEmail}
                      onChange={(e) => setClientForm({ ...clientForm, contactEmail: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-address">Dirección</Label>
                    <Input
                      id="client-address"
                      placeholder="Ej. Av. Principal 123, Lima, Perú"
                      value={clientForm.address}
                      onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setClientDialogOpen(false);
                      setClientForm({
                        ruc: '',
                        name: '',
                        contactName: '',
                        contactEmail: '',
                        address: '',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!clientForm.ruc || !clientForm.name) {
                        toast({
                          title: "Error",
                          description: "Por favor completa los campos obligatorios (RUC, Nombre)",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      // Verificar que el usuario esté autenticado
                      if (!firebaseUser) {
                        toast({
                          title: "Error de autenticación",
                          description: "No estás autenticado. Por favor, recarga la página.",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      setSavingClient(true);
                      try {
                        // Verificar que db esté inicializado
                        if (!db) {
                          throw new Error('Firestore no está inicializado');
                        }
                        
                        const clientData = {
                          ruc: clientForm.ruc.trim(),
                          name: clientForm.name.trim(),
                          contactName: clientForm.contactName.trim() || undefined,
                          contactEmail: clientForm.contactEmail.trim() || undefined,
                          address: clientForm.address.trim() || undefined,
                          fechaRegistro: new Date().toISOString(),
                        };
                        
                        console.log('Datos del cliente a guardar:', clientData);
                        
                        // Add client to Firestore
                        await addDoc(collection(db, 'clients'), clientData);
                        
                        toast({
                          title: "Cliente creado",
                          description: `El cliente ${clientForm.name} ha sido registrado exitosamente.`,
                        });
                        
                        // Reset form and close dialog
                        setClientForm({
                          ruc: '',
                          name: '',
                          contactName: '',
                          contactEmail: '',
                          address: '',
                        });
                        setClientDialogOpen(false);
                        
                        // Refresh clients list
                        const clientsSnapshot = await getDocs(collection(db, 'clients'));
                        const clientsData = clientsSnapshot.docs.map(doc => {
                          const data = doc.data();
                          return { ...data, id: doc.id } as Client;
                        });
                        const uniqueClients = clientsData.filter((client, index, self) => 
                          index === self.findIndex((c) => c.id === client.id)
                        );
                        setClients(uniqueClients);
                      } catch (error: any) {
                        console.error('Error creating client:', error);
                        let errorMessage = error.message || 'Error desconocido';
                        
                        if (error.code === 'permission-denied') {
                          errorMessage = 'No tienes permisos para crear clientes. Verifica las reglas de Firestore.';
                        }
                        
                        toast({
                          title: "Error",
                          description: `No se pudo crear el cliente: ${errorMessage}`,
                          variant: "destructive",
                        });
                      } finally {
                        setSavingClient(false);
                      }
                    }}
                    disabled={savingClient}
                  >
                    {savingClient ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cliente'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* AlertDialog para confirmar eliminación de cliente */}
            <AlertDialog open={deletingClientId !== null} onOpenChange={(open) => !open && setDeletingClientId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente el cliente seleccionado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteClient();
                    }} 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="relative mt-4">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, RUC, contacto o dirección..."
              className="w-full appearance-none bg-card pl-8 shadow-none md:w-1/2 lg:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mt-4 rounded-lg border bg-card text-card-foreground shadow-sm overflow-x-auto">
            {loading ? renderLoading() : (
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">RUC</TableHead>
                    <TableHead className="font-semibold">Contacto</TableHead>
                    <TableHead className="font-semibold">Dirección</TableHead>
                    <TableHead className="w-[50px]">
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Cargando clientes...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchTerm.trim() ? (
                          <div>
                            <p className="font-medium">No se encontraron clientes</p>
                            <p className="text-sm mt-1">No hay resultados para "{searchTerm}"</p>
                            <p className="text-sm mt-2">Intenta con otro término de búsqueda o agrega un nuevo cliente.</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">No hay clientes registrados</p>
                            <p className="text-sm mt-1">Agrega un nuevo cliente para comenzar.</p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedClients.map((client, index) => (
                      <TableRow key={`client-${client.id}-${index}`} className="hover:bg-muted/50">
                        <TableCell className="font-medium py-4">{client.name || 'N/A'}</TableCell>
                        <TableCell className="py-4">{client.ruc || 'N/A'}</TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">{client.contactName || 'N/A'}</div>
                            {client.contactEmail && (
                              <div className="text-sm text-muted-foreground">
                                {client.contactEmail}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="max-w-md">
                            {client.address || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClient(client)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeletingClientId(client.id)} className="text-destructive">Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
            
            {/* Controles de paginación */}
            {!loading && filteredClients.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t px-4 py-3 bg-card">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    Mostrando {startIndex + 1} - {Math.min(endIndex, filteredClients.length)} de {filteredClients.length}
                  </span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px] bg-muted border-muted hover:bg-muted">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {getPageNumbers().map((page, index) => {
                    if (page === 'ellipsis') {
                      return (
                        <Button
                          key={`ellipsis-${index}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-md cursor-default"
                          disabled
                        >
                          <span className="text-muted-foreground">...</span>
                        </Button>
                      );
                    }
                    
                    const pageNum = page as number;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="icon"
                        className={cn(
                          "h-8 w-8 rounded-md font-medium",
                          currentPage === pageNum && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                        )}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold font-headline">Conductores</h2>
            <Dialog open={driverDialogOpen} onOpenChange={(open) => {
              setDriverDialogOpen(open);
              if (!open) {
                setEditingDriver(null);
                setDriverForm({
                  dni: '',
                  nombres: '',
                  apellidos: '',
                  licenseNumber: '',
                  contactPhone: '',
                });
              }
            }}>
              <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Conductor
            </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">{editingDriver ? 'Editar Conductor' : 'Agregar Nuevo Conductor'}</DialogTitle>
                  <DialogDescription>
                    {editingDriver ? 'Modifica los detalles del conductor.' : 'Completa los detalles para registrar un nuevo conductor.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3 space-y-2">
                      <Label htmlFor="driver-dni">DNI</Label>
                      <Input
                        id="driver-dni"
                        placeholder="12345678"
                        value={driverForm.dni}
                        onChange={(e) => setDriverForm({ ...driverForm, dni: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="mb-0"
                        onClick={() => searchDriverDniInReniec(driverForm.dni)}
                        disabled={searchingDriverDni || !driverForm.dni || driverForm.dni.length !== 8}
                      >
                        {searchingDriverDni ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SearchIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="driver-nombres">Nombres</Label>
                    <Input
                      id="driver-nombres"
                      placeholder="Ej. Luis"
                      value={driverForm.nombres}
                      onChange={(e) => setDriverForm({ ...driverForm, nombres: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="driver-apellidos">Apellidos</Label>
                    <Input
                      id="driver-apellidos"
                      placeholder="Ej. Gonzales"
                      value={driverForm.apellidos}
                      onChange={(e) => setDriverForm({ ...driverForm, apellidos: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3 space-y-2">
                      <Label htmlFor="driver-license">Número de Licencia</Label>
                      <Input
                        id="driver-license"
                        placeholder="Ej. Q12345678"
                        value={driverForm.licenseNumber}
                        onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="mb-0"
                        onClick={() => verifyLicense(driverForm.licenseNumber)}
                        disabled={verifyingLicense || !driverForm.licenseNumber}
                      >
                        {verifyingLicense ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="driver-phone">Teléfono de Contacto</Label>
                    <Input
                      id="driver-phone"
                      placeholder="Ej. 987654321"
                      value={driverForm.contactPhone}
                      onChange={(e) => setDriverForm({ ...driverForm, contactPhone: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDriverDialogOpen(false);
                      setDriverForm({
                        dni: '',
                        nombres: '',
                        apellidos: '',
                        licenseNumber: '',
                        contactPhone: '',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!driverForm.dni || !driverForm.nombres || !driverForm.apellidos || !driverForm.licenseNumber) {
                        toast({
                          title: "Error",
                          description: "Por favor completa todos los campos obligatorios (DNI, Nombres, Apellidos, Número de Licencia)",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      // Verificar que el usuario esté autenticado
                      if (!firebaseUser) {
                        toast({
                          title: "Error de autenticación",
                          description: "No estás autenticado. Por favor, recarga la página.",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      setSavingDriver(true);
                      try {
                        // Generar el siguiente código de ID automáticamente
                        const driverCode = await generateNextDriverId();
                        
                        // Separar apellidos en paterno y materno
                        const apellidosParts = driverForm.apellidos.trim().split(' ');
                        const apellidoPaterno = apellidosParts[0] || '';
                        const apellidoMaterno = apellidosParts.slice(1).join(' ') || '';
                        
                        const driverData = {
                          id: driverCode, // Código generado automáticamente (C0000, C0001, etc.)
                          dni: driverForm.dni,
                          firstName: driverForm.nombres.trim(),
                          lastName: driverForm.apellidos.trim(),
                          apellidoPaterno: apellidoPaterno,
                          apellidoMaterno: apellidoMaterno,
                          licenseNumber: driverForm.licenseNumber.trim(),
                          contactPhone: driverForm.contactPhone.trim(),
                          licenseStatus: 'Activa',
                          fechaRegistro: new Date().toISOString(),
                        };
                        
                        console.log('Creando conductor con código:', driverCode);
                        
                        // Add driver to Firestore
                        await addDoc(collection(db, 'drivers'), driverData);
                        
                        toast({
                          title: "Conductor creado",
                          description: `El conductor ${driverForm.nombres} ${driverForm.apellidos} ha sido registrado exitosamente con código ${driverCode}.`,
                        });
                        
                        // Reset form and close dialog
                        setDriverForm({
                          dni: '',
                          nombres: '',
                          apellidos: '',
                          licenseNumber: '',
                          contactPhone: '',
                        });
                        setDriverDialogOpen(false);
                        
                        // Refresh drivers list
                        const driversSnapshot = await getDocs(collection(db, 'drivers'));
                        const driversData = driversSnapshot.docs.map(doc => {
                          const data = doc.data();
                          return { ...data, id: doc.id } as Driver;
                        });
                        const uniqueDrivers = driversData.filter((driver, index, self) => 
                          index === self.findIndex((d) => d.id === driver.id)
                        );
                        setDrivers(uniqueDrivers);
                      } catch (error: any) {
                        console.error('Error creating driver:', error);
                        let errorMessage = error.message || 'Error desconocido';
                        
                        // Mejorar mensaje de error para permisos
                        if (error.code === 'permission-denied') {
                          errorMessage = 'No tienes permisos para crear conductores. Verifica las reglas de Firestore o contacta al administrador.';
                        } else if (error.message?.includes('permission')) {
                          errorMessage = 'Error de permisos. Verifica que estés autenticado correctamente.';
                        }
                        
                        toast({
                          title: "Error",
                          description: `No se pudo crear el conductor: ${errorMessage}`,
                          variant: "destructive",
                        });
                      } finally {
                        setSavingDriver(false);
                      }
                    }}
                    disabled={savingDriver}
                  >
                    {savingDriver ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Conductor'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* AlertDialog para confirmar eliminación de conductor */}
            <AlertDialog open={deletingDriverId !== null} onOpenChange={(open) => !open && setDeletingDriverId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente el conductor seleccionado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteDriver} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
           <div className="mt-4 rounded-lg border bg-card text-card-foreground shadow-sm overflow-x-auto">
            {loading ? renderLoading() : (
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Licencia</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead><span className="sr-only">Acciones</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {loading ? "Cargando..." : "No se encontraron conductores. Agrega uno nuevo para comenzar."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    drivers.map((driver, index) => {
                      // Combine firstName and lastName if available, otherwise use name
                      const fullName = driver.firstName && driver.lastName 
                        ? `${driver.firstName} ${driver.lastName}`
                        : driver.name || 'Sin nombre';
                      // Use licenseNumber if available, otherwise use license
                      const license = driver.licenseNumber || driver.license || 'N/A';
                      // Use contactPhone if available, otherwise use phone
                      const phone = driver.contactPhone || driver.phone || 'N/A';
                      
                      return (
                        <TableRow key={`driver-${driver.id}-${index}`}>
                          <TableCell className="font-medium">{fullName}</TableCell>
                          <TableCell>{license}</TableCell>
                          <TableCell>{phone}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditDriver(driver)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingDriverId(driver.id)} className="text-destructive">Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold font-headline">Vehículos</h2>
            <Dialog open={vehicleDialogOpen} onOpenChange={(open) => {
              setVehicleDialogOpen(open);
              if (!open) {
                setEditingVehicle(null);
                setVehicleForm({
                  licensePlate: '',
                  make: '',
                  model: '',
                  type: '',
                  driverId: '',
                });
              }
            }}>
              <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Vehículo
            </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">{editingVehicle ? 'Editar Vehículo' : 'Agregar Nuevo Vehículo'}</DialogTitle>
                  <DialogDescription>
                    {editingVehicle ? 'Modifica los detalles del vehículo.' : 'Completa los detalles para registrar un nuevo vehículo.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-plate">Placa del Vehículo</Label>
                    <Input
                      id="vehicle-plate"
                      placeholder="Ej. ABC-123"
                      value={vehicleForm.licensePlate}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-make">Marca</Label>
                    <Input
                      id="vehicle-make"
                      placeholder="Ej. Volvo"
                      value={vehicleForm.make}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-model">Modelo</Label>
                    <Input
                      id="vehicle-model"
                      placeholder="Ej. FH"
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-type">Tipo de Vehículo</Label>
                    <Input
                      id="vehicle-type"
                      placeholder="Ej. Camión, Furgoneta"
                      value={vehicleForm.type}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-driver" className="text-xs text-muted-foreground">Conductor</Label>
                    <Input
                      id="vehicle-driver"
                      placeholder="C0000"
                      value={vehicleForm.driverId}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, driverId: e.target.value })}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVehicleDialogOpen(false);
                      setVehicleForm({
                        licensePlate: '',
                        make: '',
                        model: '',
                        type: '',
                        driverId: '',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={async () => {
                      if (editingVehicle) {
                        await handleUpdateVehicle();
                      } else {
                        if (!vehicleForm.licensePlate || !vehicleForm.make || !vehicleForm.model) {
                          toast({
                            title: "Error",
                            description: "Por favor completa todos los campos obligatorios (Placa, Marca, Modelo)",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        // Verificar que el usuario esté autenticado
                        if (!firebaseUser) {
                          toast({
                            title: "Error de autenticación",
                            description: "No estás autenticado. Por favor, recarga la página.",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        setSavingVehicle(true);
                        try {
                          // Verificar que db esté inicializado
                          if (!db) {
                            throw new Error('Firestore no está inicializado');
                          }
                          
                          // Log para diagnóstico
                          console.log('Intentando guardar vehículo:', {
                            user: firebaseUser?.uid,
                            isAnonymous: firebaseUser?.isAnonymous,
                            db: !!db
                          });
                          
                          const vehicleData = {
                            licensePlate: vehicleForm.licensePlate.trim(),
                            plate: vehicleForm.licensePlate.trim(), // Alias para compatibilidad
                            make: vehicleForm.make.trim(),
                            model: vehicleForm.model.trim(),
                            type: vehicleForm.type.trim() || undefined,
                            tipo: vehicleForm.type.trim() || undefined, // Alias para compatibilidad
                            driverId: vehicleForm.driverId.trim() || undefined,
                            fechaRegistro: new Date().toISOString(),
                          };
                          
                          console.log('Datos del vehículo a guardar:', vehicleData);
                          
                          // Add vehicle to Firestore
                          let docRef;
                          try {
                            docRef = await addDoc(collection(db, 'vehicles'), vehicleData);
                            console.log('Vehículo guardado exitosamente con ID:', docRef.id);
                          } catch (firestoreError: any) {
                          // Capturar error específico de Firestore con más detalles
                          const firestoreErrorInfo: any = {
                            error: firestoreError,
                            errorType: typeof firestoreError,
                            errorConstructor: firestoreError?.constructor?.name,
                            code: firestoreError?.code,
                            message: firestoreError?.message,
                            name: firestoreError?.name,
                            stack: firestoreError?.stack,
                          };
                          
                          // Intentar acceder a propiedades específicas de FirebaseError
                          if (firestoreError?.code) {
                            firestoreErrorInfo.code = firestoreError.code;
                          }
                          if (firestoreError?.message) {
                            firestoreErrorInfo.message = firestoreError.message;
                          }
                          if (firestoreError?.customData) {
                            firestoreErrorInfo.customData = firestoreError.customData;
                          }
                          
                          // Intentar obtener información del error de forma segura
                          try {
                            firestoreErrorInfo.errorString = String(firestoreError);
                            firestoreErrorInfo.errorJSON = JSON.stringify(firestoreError, null, 2);
                          } catch (e) {
                            firestoreErrorInfo.serializationError = 'No se pudo serializar el error';
                          }
                          
                          console.error('❌ Error de Firestore al guardar vehículo:', firestoreErrorInfo);
                          
                          // Crear un nuevo error con información más clara
                          const enhancedError: any = new Error(
                            firestoreError?.message || 
                            `Error de Firestore: ${firestoreError?.code || 'Código desconocido'}`
                          );
                          enhancedError.code = firestoreError?.code || 'unknown';
                          enhancedError.originalError = firestoreError;
                          enhancedError.name = firestoreError?.name || 'FirebaseError';
                          
                          throw enhancedError;
                        }
                        
                        toast({
                          title: "Vehículo creado",
                          description: `El vehículo ${vehicleForm.licensePlate} ha sido registrado exitosamente.`,
                        });
                        
                        // Reset form and close dialog
                        setVehicleForm({
                          licensePlate: '',
                          make: '',
                          model: '',
                          type: '',
                          driverId: '',
                        });
                        setVehicleDialogOpen(false);
                        
                        // Refresh vehicles list
                        const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
                        const vehiclesData = vehiclesSnapshot.docs.map(doc => {
                          const data = doc.data();
                          return { ...data, id: doc.id } as Vehicle;
                        });
                        const uniqueVehicles = vehiclesData.filter((vehicle, index, self) => 
                          index === self.findIndex((v) => v.id === vehicle.id)
                        );
                        setVehicles(uniqueVehicles);
                      } catch (error: any) {
                        // Capturar toda la información posible del error
                        const errorInfo = {
                          error: error,
                          errorString: String(error),
                          errorJSON: JSON.stringify(error, Object.getOwnPropertyNames(error)),
                          code: error?.code,
                          message: error?.message,
                          name: error?.name,
                          stack: error?.stack,
                          toString: error?.toString(),
                          user: firebaseUser?.uid,
                          isAnonymous: firebaseUser?.isAnonymous,
                          dbInitialized: !!db,
                        };
                        
                        console.error('Error completo al crear vehículo:', errorInfo);
                        console.error('Error object keys:', Object.keys(error || {}));
                        console.error('Error object values:', Object.values(error || {}));
                        
                        // Intentar extraer el mensaje de error de diferentes formas
                        let errorMessage = 'Error desconocido al guardar el vehículo';
                        
                        // Intentar obtener el código de error
                        const errorCode = error?.code || error?.error?.code || error?.errorCode || 
                                        (String(error).includes('permission') ? 'permission-denied' : null);
                        
                        // Intentar obtener el mensaje de error
                        const errorMsg = error?.message || error?.error?.message || error?.errorMessage || 
                                       String(error) || 'Error desconocido';
                        
                        if (errorCode === 'permission-denied' || errorCode === 'PERMISSION_DENIED' || 
                            errorMsg.includes('permission') || errorMsg.includes('Permission') ||
                            String(error).includes('permission') || String(error).includes('Missing or insufficient')) {
                          errorMessage = `❌ ERROR: Missing or insufficient permissions

🔴 PROBLEMA: Las reglas de Firestore NO están actualizadas en Firebase Console.

✅ SOLUCIÓN (3 pasos):

1️⃣ Abre este enlace:
   https://console.firebase.google.com/project/studio-4560916840-4310c/firestore/rules

2️⃣ Copia TODO el contenido del archivo:
   📁 REGLAS_FIRESTORE_COPIAR.txt
   
   (O abre firestore.rules y copia todo)

3️⃣ Pega en Firebase Console y haz clic en "Publicar"

⚠️ IMPORTANTE: Después de publicar, espera 10 segundos y recarga esta página (F5)

📊 Estado actual:
   Usuario: ${firebaseUser?.uid || 'No autenticado'}
   Autenticado: ${firebaseUser ? 'Sí' : 'No'}
   Tipo: ${firebaseUser?.isAnonymous ? 'Anónimo' : 'Autenticado'}`;
                        } else if (errorCode === 'unavailable' || errorCode === 'UNAVAILABLE' || 
                                  errorMsg.includes('unavailable')) {
                          errorMessage = 'Firestore no está disponible. Verifica tu conexión a internet.';
                        } else if (errorCode === 'unauthenticated' || errorCode === 'UNAUTHENTICATED' || 
                                  errorMsg.includes('unauthenticated')) {
                          errorMessage = 'No estás autenticado. Por favor, recarga la página (F5).';
                        } else if (errorMsg && errorMsg !== 'Error desconocido') {
                          errorMessage = `Error: ${errorMsg}`;
                        } else {
                          errorMessage = `Error desconocido. Revisa la consola del navegador (F12) para más detalles.
                          
Error: ${String(error)}
Código: ${errorCode || 'N/A'}`;
                        }
                        
                        toast({
                          title: "Error al guardar vehículo",
                          description: errorMessage,
                          variant: "destructive",
                          duration: 15000, // Mostrar por 15 segundos
                        });
                      } finally {
                        setSavingVehicle(false);
                      }
                      }
                    }}
                    disabled={savingVehicle}
                  >
                    {savingVehicle ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingVehicle ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      editingVehicle ? 'Actualizar Vehículo' : 'Guardar Vehículo'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* AlertDialog para confirmar eliminación de vehículo */}
            <AlertDialog open={deletingVehicleId !== null} onOpenChange={(open) => !open && setDeletingVehicleId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente el vehículo seleccionado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteVehicle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
           <div className="mt-4 rounded-lg border bg-card text-card-foreground shadow-sm overflow-x-auto">
            {loading ? renderLoading() : (
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Marca y Modelo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Conductor Asignado</TableHead>
                    <TableHead><span className="sr-only">Acciones</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {loading ? "Cargando..." : "No se encontraron vehículos. Agrega uno nuevo para comenzar."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    vehicles.map((vehicle, index) => {
                      // Log all available fields for debugging
                      console.log(`Vehicle ${vehicle.id} fields:`, Object.keys(vehicle));
                      console.log(`Vehicle ${vehicle.id} full data:`, vehicle);
                      
                      // Use licensePlate if available, otherwise use plate
                      const plate = vehicle.licensePlate || vehicle.plate || 'N/A';
                      // Combine make and model if available
                      const makeAndModel = vehicle.make && vehicle.model 
                        ? `${vehicle.make} ${vehicle.model}`
                        : vehicle.model || 'N/A';
                      
                      // Function to determine vehicle type based on model
                      const getVehicleType = (): string => {
                        // First, check if type or tipo is explicitly set
                        if (vehicle.type) return vehicle.type;
                        if (vehicle.tipo) return vehicle.tipo;
                        
                        // If not, derive from model name
                        const modelLower = makeAndModel.toLowerCase();
                        
                        // Camión de Carga Ligera (Light Duty)
                        if (modelLower.includes('fuso') || 
                            modelLower.includes('canter') ||
                            modelLower.includes('npr') ||
                            modelLower.includes('kia') ||
                            modelLower.includes('nissan') ||
                            modelLower.includes('toyota') ||
                            modelLower.includes('hyundai')) {
                          return 'Camión de Carga Ligera';
                        }
                        
                        // Camión de Carga Media (Medium Duty)
                        if (modelLower.includes('isuzu') ||
                            modelLower.includes('hino') ||
                            modelLower.includes('ford cargo') ||
                            modelLower.includes('cargo') ||
                            modelLower.includes('iveco daily')) {
                          return 'Camión de Carga Media';
                        }
                        
                        // Camión de Carga Pesada (Heavy Duty)
                        if (modelLower.includes('volvo') ||
                            modelLower.includes('scania') ||
                            modelLower.includes('mercedes') ||
                            modelLower.includes('actros') ||
                            modelLower.includes('iveco') ||
                            modelLower.includes('stralis') ||
                            modelLower.includes('man') ||
                            modelLower.includes('tgx') ||
                            modelLower.includes('freightliner') ||
                            modelLower.includes('peterbilt') ||
                            modelLower.includes('kenworth') ||
                            modelLower.includes('mack') ||
                            modelLower.includes('daf') ||
                            modelLower.includes('renault') ||
                            modelLower.includes('daimler')) {
                          return 'Camión de Carga Pesada';
                        }
                        
                        // Fallback to capacity if available
                        if (vehicle.capacity) return vehicle.capacity;
                        
                        return 'N/A';
                      };
                      
                      const type = getVehicleType();
                      // Use driverId if available
                      const driver = vehicle.driverId || 'N/A';
                      
                      return (
                        <TableRow key={`vehicle-${vehicle.id}-${index}`}>
                          <TableCell className="font-medium">{plate}</TableCell>
                          <TableCell>{makeAndModel}</TableCell>
                          <TableCell>{type}</TableCell>
                          <TableCell>{driver}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditVehicle(vehicle)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingVehicleId(vehicle.id)} className="text-destructive">Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold font-headline">Usuarios</h2>
            <Dialog open={userDialogOpen} onOpenChange={(open) => {
              setUserDialogOpen(open);
              if (!open) {
                setEditingUser(null);
                setUserForm({
                  dni: '',
                  nombres: '',
                  apellidoPaterno: '',
                  apellidoMaterno: '',
                  fechaNacimiento: undefined,
                  direccion: '',
                  email: '',
                  password: '',
                  role: 'assistant',
                });
              }
            }}>
              <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Usuario
            </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Modifica los detalles del usuario.' : 'Completa todos los campos para crear un nuevo usuario en el sistema.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3 space-y-2">
                      <Label htmlFor="dni">DNI</Label>
                      <Input
                        id="dni"
                        placeholder="Ej. 12345678"
                        value={userForm.dni}
                        onChange={(e) => setUserForm({ ...userForm, dni: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="mb-0"
                        onClick={() => searchDniInReniec(userForm.dni)}
                        disabled={searchingDni || !userForm.dni || userForm.dni.length !== 8}
                      >
                        {searchingDni ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SearchIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nombres">Nombres</Label>
                    <Input
                      id="nombres"
                      placeholder="Ej. Juan Carlos"
                      value={userForm.nombres}
                      onChange={(e) => setUserForm({ ...userForm, nombres: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apellidoPaterno">Apellido Paterno</Label>
                      <Input
                        id="apellidoPaterno"
                        placeholder="Ej. Pérez"
                        value={userForm.apellidoPaterno}
                        onChange={(e) => setUserForm({ ...userForm, apellidoPaterno: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
                      <Input
                        id="apellidoMaterno"
                        placeholder="Ej. González"
                        value={userForm.apellidoMaterno}
                        onChange={(e) => setUserForm({ ...userForm, apellidoMaterno: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !userForm.fechaNacimiento && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {userForm.fechaNacimiento ? (
                            format(userForm.fechaNacimiento, "dd/MM/yyyy", { locale: es })
                          ) : (
                            <span>dd/mm/aaaa</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={userForm.fechaNacimiento}
                          onSelect={(date) => setUserForm({ ...userForm, fechaNacimiento: date })}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      placeholder="Ej. Av. Principal 123, Lima, Perú"
                      value={userForm.direccion}
                      onChange={(e) => setUserForm({ ...userForm, direccion: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ej. usuario@ejemplo.com"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ingresa la contraseña"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Input
                      id="role"
                      placeholder="Ej. assistant, admin"
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUserDialogOpen(false);
                      setUserForm({
                        dni: '',
                        nombres: '',
                        apellidoPaterno: '',
                        apellidoMaterno: '',
                        fechaNacimiento: undefined,
                        direccion: '',
                        email: '',
                        password: '',
                        role: 'assistant',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={async () => {
                      if (editingUser) {
                        await handleUpdateUser();
                      } else {
                        if (!userForm.dni || !userForm.nombres || !userForm.email || !userForm.password) {
                          toast({
                            title: "Error",
                            description: "Por favor completa todos los campos obligatorios (DNI, Nombres, Email, Contraseña)",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        // Verificar que el usuario esté autenticado
                        if (!firebaseUser) {
                          toast({
                            title: "Error de autenticación",
                            description: "No estás autenticado. Por favor, recarga la página.",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        setSavingUser(true);
                        try {
                          // Create user in Firebase Auth if email and password are provided
                          let authUser = null;
                          if (userForm.email && userForm.password) {
                            try {
                              // Note: This requires Firebase Auth to be configured
                              // For now, we'll just create the Firestore document
                            } catch (authError) {
                              console.error("Error creating auth user:", authError);
                              // Continue anyway to create the Firestore document
                            }
                          }
                          
                          // Calculate age from fechaNacimiento
                          let edad = undefined;
                          if (userForm.fechaNacimiento) {
                            const today = new Date();
                            const birthDate = userForm.fechaNacimiento;
                            edad = today.getFullYear() - birthDate.getFullYear();
                            const monthDiff = today.getMonth() - birthDate.getMonth();
                            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                              edad--;
                            }
                          }
                          
                          // Create nombresCompletos
                          const nombresCompletos = `${userForm.nombres} ${userForm.apellidoPaterno} ${userForm.apellidoMaterno}`.trim();
                          
                          // Create username from email
                          const username = userForm.email;
                          
                          // Prepare user data for Firestore
                          const userData = {
                            dni: userForm.dni,
                            nombres: userForm.nombres.trim(),
                            apellidoPaterno: userForm.apellidoPaterno.trim(),
                            apellidoMaterno: userForm.apellidoMaterno.trim(),
                            nombresCompletos: nombresCompletos,
                            fechaNacimiento: userForm.fechaNacimiento ? format(userForm.fechaNacimiento, 'yyyy-MM-dd') : '',
                            edad: edad,
                            direccion: userForm.direccion.trim(),
                            username: username,
                            email: userForm.email.trim(),
                            role: userForm.role.trim() || 'assistant',
                            fechaRegistro: new Date().toISOString(),
                          };
                          
                          // Add user to Firestore
                          const docRef = await addDoc(collection(db, 'users'), userData);
                          
                          toast({
                            title: "Usuario creado",
                            description: `El usuario ${nombresCompletos} ha sido creado exitosamente.`,
                          });
                          
                          // Reset form and close dialog
                          setUserForm({
                            dni: '',
                            nombres: '',
                            apellidoPaterno: '',
                            apellidoMaterno: '',
                            fechaNacimiento: undefined,
                            direccion: '',
                            email: '',
                            password: '',
                            role: 'assistant',
                          });
                          setUserDialogOpen(false);
                          
                          // Refresh users list
                          const usersSnapshot = await getDocs(collection(db, 'users'));
                          const usersData = usersSnapshot.docs.map(doc => {
                            const data = doc.data();
                            return { ...data, id: doc.id } as User;
                          });
                          const uniqueUsers = usersData.filter((user, index, self) => 
                            index === self.findIndex((u) => u.id === user.id)
                          );
                          setUsers(uniqueUsers);
                        } catch (error: any) {
                          console.error('Error creating user:', error);
                          let errorMessage = error.message || 'Error desconocido';
                          
                          // Mejorar mensaje de error para permisos
                          if (error.code === 'permission-denied') {
                            errorMessage = 'No tienes permisos para crear usuarios. Verifica las reglas de Firestore o contacta al administrador.';
                          } else if (error.message?.includes('permission')) {
                            errorMessage = 'Error de permisos. Verifica que estés autenticado correctamente.';
                          }
                          
                          toast({
                            title: "Error",
                            description: `No se pudo crear el usuario: ${errorMessage}`,
                            variant: "destructive",
                          });
                        } finally {
                          setSavingUser(false);
                        }
                      }
                    }}
                    disabled={savingUser}
                  >
                    {savingUser ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingUser ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      editingUser ? 'Actualizar Usuario' : 'Guardar Usuario'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* AlertDialog para confirmar eliminación de usuario */}
            <AlertDialog open={deletingUserId !== null} onOpenChange={(open) => !open && setDeletingUserId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente el usuario seleccionado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
           <div className="mt-4 rounded-lg border bg-card text-card-foreground shadow-sm overflow-x-auto">
            {loading ? renderLoading() : (
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre Completo</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead><span className="sr-only">Acciones</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {loading ? "Cargando..." : "No se encontraron usuarios. Agrega uno nuevo para comenzar."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user, index) => {
                        // Use nombresCompletos if available, otherwise construct from parts
                        const fullName = user.nombresCompletos 
                          || (user.nombres && user.apellidoPaterno && user.apellidoMaterno
                            ? `${user.nombres} ${user.apellidoPaterno} ${user.apellidoMaterno}`.trim()
                            : user.nombres || user.email || 'N/A');
                        // Use username if available, otherwise use email
                        const username = user.username || user.email || 'N/A';
                        // Use role
                        const role = user.role || 'N/A';
                        // Use dni
                        const dni = user.dni || 'N/A';
                        
                        return (
                          <TableRow key={`user-${user.id}-${index}`}>
                            <TableCell className="font-medium">{fullName}</TableCell>
                            <TableCell>{username}</TableCell>
                            <TableCell>{dni}</TableCell>
                            <TableCell>{role}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeletingUserId(user.id)} className="text-destructive">Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
