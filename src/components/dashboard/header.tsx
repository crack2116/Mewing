'use client';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import Link from "next/link";
import Sidebar from "./sidebar";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useState, useEffect, useCallback } from "react";
import { getProfileImageUrl } from "@/lib/profile-image";
import { signOut } from "firebase/auth";
import { auth, db } from "@/app/management/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search, Building2, User, Truck, ClipboardList, Sun, Moon, Menu, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  type: 'client' | 'driver' | 'vehicle' | 'service';
  title: string;
  subtitle: string;
  link: string;
}

export default function Header() {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Obtener imagen de perfil desde Firebase Storage
  useEffect(() => {
    const loadProfileImage = async () => {
      const url = await getProfileImageUrl();
      if (url) {
        setProfileImageUrl(url);
      }
    };
    loadProfileImage();
  }, []);

  // Función de búsqueda global
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results: SearchResult[] = [];
    const searchLower = query.toLowerCase().trim();

    try {
      // Buscar en Clientes
      const clientsSnapshot = await getDocs(collection(db, 'clients'));
      clientsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const name = (data.name || '').toLowerCase();
        const ruc = (data.ruc || '').toLowerCase();
        const contactName = (data.contactName || '').toLowerCase();
        const address = (data.address || '').toLowerCase();
        
        if (name.includes(searchLower) || ruc.includes(searchLower) || 
            contactName.includes(searchLower) || address.includes(searchLower)) {
          results.push({
            id: doc.id,
            type: 'client',
            title: data.name || 'Sin nombre',
            subtitle: `RUC: ${data.ruc || 'N/A'}`,
            link: '/management?tab=clients',
          });
        }
      });

      // Buscar en Conductores
      const driversSnapshot = await getDocs(collection(db, 'drivers'));
      driversSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const firstName = (data.firstName || data.name || '').toLowerCase();
        const lastName = (data.lastName || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
        const license = (data.licenseNumber || data.license || '').toLowerCase();
        const dni = (data.dni || '').toLowerCase();
        const phone = (data.contactPhone || data.phone || '').toLowerCase();
        
        if (fullName.includes(searchLower) || license.includes(searchLower) || 
            dni.includes(searchLower) || phone.includes(searchLower)) {
          const displayName = data.firstName && data.lastName 
            ? `${data.firstName} ${data.lastName}`
            : data.name || 'Sin nombre';
          results.push({
            id: doc.id,
            type: 'driver',
            title: displayName,
            subtitle: `Licencia: ${data.licenseNumber || data.license || 'N/A'}`,
            link: '/management?tab=drivers',
          });
        }
      });

      // Buscar en Vehículos
      const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
      vehiclesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const plate = (data.licensePlate || data.plate || '').toLowerCase();
        const make = (data.make || '').toLowerCase();
        const model = (data.model || '').toLowerCase();
        const makeModel = `${make} ${model}`.trim().toLowerCase();
        
        if (plate.includes(searchLower) || make.includes(searchLower) || 
            model.includes(searchLower) || makeModel.includes(searchLower)) {
          const displayName = data.make && data.model 
            ? `${data.make} ${data.model}`
            : data.model || data.licensePlate || data.plate || 'Sin nombre';
          results.push({
            id: doc.id,
            type: 'vehicle',
            title: displayName,
            subtitle: `Placa: ${data.licensePlate || data.plate || 'N/A'}`,
            link: '/management?tab=vehicles',
          });
        }
      });

      // Buscar en Servicios
      const servicesSnapshot = await getDocs(collection(db, 'serviceRequests'));
      servicesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const clientId = (data.clientId || '').toLowerCase();
        const pickupLocation = (data.pickupLocation || '').toLowerCase();
        const destination = (data.destination || '').toLowerCase();
        const status = (data.status || '').toLowerCase();
        const serviceId = (data.id || doc.id || '').toLowerCase();
        
        if (clientId.includes(searchLower) || pickupLocation.includes(searchLower) || 
            destination.includes(searchLower) || status.includes(searchLower) ||
            serviceId.includes(searchLower)) {
          results.push({
            id: doc.id,
            type: 'service',
            title: `Servicio ${data.id || doc.id || 'N/A'}`,
            subtitle: `${data.pickupLocation || 'N/A'} → ${data.destination || 'N/A'}`,
            link: '/services',
          });
        }
      });

      setSearchResults(results.slice(0, 10)); // Limitar a 10 resultados
    } catch (error) {
      console.error('Error en búsqueda global:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return <Building2 className="h-4 w-4" />;
      case 'driver':
        return <User className="h-4 w-4" />;
      case 'vehicle':
        return <Truck className="h-4 w-4" />;
      case 'service':
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return 'Cliente';
      case 'driver':
        return 'Conductor';
      case 'vehicle':
        return 'Vehículo';
      case 'service':
        return 'Servicio';
      default:
        return 'Resultado';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setSearchOpen(false);
    setSearchQuery('');
    router.push(result.link);
  };

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/services', label: 'Servicios' },
    { href: '/management', label: 'Gestión' },
    { href: '/tracking', label: 'Seguimiento' },
    { href: '/reports', label: 'Reportes' },
    { href: '/support', label: 'Soporte' },
    { href: '/profile', label: 'Perfil' },
  ];

  const currentPage = navItems.find(item => pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/'))?.label || 'Página';

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center border-b bg-background px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden flex-shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs p-0 w-full">
          <Sidebar />
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex mr-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Panel</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
        <PopoverTrigger asChild>
          <div className="relative flex-1 ml-auto mr-8 min-w-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar clientes, conductores, vehículos, servicios..."
              className="w-full rounded-lg bg-background pl-8 text-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => {
                if (searchQuery) {
                  setSearchOpen(true);
                }
              }}
            />
            {isSearching && (
              <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <ScrollArea className="h-[300px]">
            {searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No se encontraron resultados para "{searchQuery}"
              </div>
            )}
            {searchResults.length === 0 && searchQuery.length < 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Escribe al menos 2 caracteres para buscar
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="p-2">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
      <div className="flex items-center gap-4 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex-shrink-0">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <NotificationCenter />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full flex-shrink-0"
            >
              <Avatar className="h-9 w-9">
                {profileImageUrl ? (
                  <AvatarImage src={profileImageUrl} alt="User Avatar" />
                ) : userAvatar ? (
                  <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint} />
                ) : null}
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full cursor-pointer">Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/support" className="w-full cursor-pointer">Soporte</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={async () => {
                try {
                  await signOut(auth);
                  router.push('/login');
                } catch (error) {
                  console.error('Error al cerrar sesión:', error);
                }
              }}
            >
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
