'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, PlayCircle, Navigation, Route, Search, Truck } from 'lucide-react';
import type { ActiveVehicle } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const piuraLocations = [
  // Piura - Calles principales
  'Piura - Avenida Grau',
  'Piura - Avenida Sánchez Cerro',
  'Piura - Avenida Loreto',
  'Piura - Avenida Bolognesi',
  'Piura - Avenida Sullana',
  'Piura - Avenida Panamericana Norte',
  'Piura - Avenida Panamericana Sur',
  'Piura - Avenida Ramón Castilla',
  'Piura - Avenida Los Libertadores',
  'Piura - Avenida El Chipe',
  'Piura - Avenida El Bosque',
  'Piura - Avenida Los Incas',
  'Piura - Avenida Túpac Amaru',
  'Piura - Avenida César Vallejo',
  'Piura - Avenida Los Héroes',
  'Piura - Avenida La Marina',
  // Piura - Jirones
  'Piura - Jirón Tacna',
  'Piura - Jirón Huancavelica',
  'Piura - Jirón Apurímac',
  'Piura - Jirón Ayacucho',
  'Piura - Jirón Cusco',
  'Piura - Jirón Lima',
  'Piura - Jirón Arequipa',
  'Piura - Jirón Trujillo',
  'Piura - Jirón Callao',
  'Piura - Jirón Puno',
  'Piura - Jirón Junín',
  'Piura - Jirón Huánuco',
  'Piura - Jirón Chiclayo',
  'Piura - Jirón Ica',
  // Piura - Zonas
  'Piura - Centro',
  'Piura - Plaza de Armas',
  'Piura - Miraflores',
  'Piura - Castilla',
  'Piura - El Chipe',
  'Piura - Los Ejidos',
  'Piura - La Arena',
  'Piura - San Martín',
  'Piura - La Unión',
  'Piura - Bellavista',
  // Castilla - Calles principales
  'Castilla - Avenida Principal',
  'Castilla - Avenida Grau',
  'Castilla - Avenida Sánchez Cerro',
  'Castilla - Avenida Los Incas',
  'Castilla - Avenida El Chipe',
  'Castilla - Avenida Panamericana',
  // Castilla - Jirones
  'Castilla - Jirón Tacna',
  'Castilla - Jirón Lima',
  'Castilla - Jirón Arequipa',
  'Castilla - Jirón Cusco',
  'Castilla - Jirón Ayacucho',
  'Castilla - Jirón Junín',
  'Castilla - Jirón Huancavelica',
  'Castilla - Jirón Apurímac',
  'Castilla - Jirón Trujillo',
  'Castilla - Jirón Puno',
  // Castilla - Zonas
  'Castilla - Centro',
  'Castilla - Plaza Principal',
  'Castilla - La Unión',
  'Castilla - Miraflores',
  // Otras ciudades
  'Sullana - Centro',
  'Sullana - Avenida Panamericana',
  'Sullana - Jirón Lima',
  'Sullana - Avenida Grau',
  'Talara - Centro',
  'Talara - Avenida Principal',
  'Paita - Centro',
  'Paita - Puerto',
  'Sechura - Centro',
  'Catacaos - Centro',
  'Catacaos - Plaza Principal',
  'La Unión - Centro',
  'Chulucanas - Centro',
  'Chulucanas - Avenida Principal',
  'Morropón - Centro',
  'Huancabamba - Centro',
  'Ayabaca - Centro',
  'Tambogrande - Centro',
  'Vice - Centro',
  'Bellavista - Centro',
];

interface TrackingActionsProps {
  vehicles?: ActiveVehicle[];
  onRouteAssigned?: (vehicleId: string, origin: string, destination: string) => void;
}

export default function TrackingActions({ vehicles = [], onRouteAssigned }: TrackingActionsProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [vehicleSuggestions, setVehicleSuggestions] = useState<ActiveVehicle[]>([]);
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [open, setOpen] = useState(false);
  const vehicleInputRef = useRef<HTMLInputElement>(null);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const vehicleSuggestionsRef = useRef<HTMLDivElement>(null);
  const originSuggestionsRef = useRef<HTMLDivElement>(null);
  const destinationSuggestionsRef = useRef<HTMLDivElement>(null);

  // Filtrar vehículos disponibles
  const availableVehicles = useMemo(() => 
    vehicles.filter(v => v.status === 'Disponible'),
    [vehicles]
  );

  useEffect(() => {
    if (open) {
      // Hacer el overlay más transparente cuando el modal está abierto
      const updateOverlay = () => {
        const overlay = document.querySelector('[data-radix-dialog-overlay]') as HTMLElement;
        if (overlay) {
          overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        } else {
          // Si no existe aún, intentar de nuevo después de un breve delay
          setTimeout(updateOverlay, 10);
        }
      };
      updateOverlay();
    }
  }, [open]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        vehicleSuggestionsRef.current &&
        !vehicleSuggestionsRef.current.contains(event.target as Node) &&
        vehicleInputRef.current &&
        !vehicleInputRef.current.contains(event.target as Node)
      ) {
        setShowVehicleSuggestions(false);
      }
      if (
        originSuggestionsRef.current &&
        !originSuggestionsRef.current.contains(event.target as Node) &&
        originInputRef.current &&
        !originInputRef.current.contains(event.target as Node)
      ) {
        setShowOriginSuggestions(false);
      }
      if (
        destinationSuggestionsRef.current &&
        !destinationSuggestionsRef.current.contains(event.target as Node) &&
        destinationInputRef.current &&
        !destinationInputRef.current.contains(event.target as Node)
      ) {
        setShowDestinationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterVehicleSuggestions = (query: string): ActiveVehicle[] => {
    if (!query.trim()) return availableVehicles.slice(0, 8);
    const lowerQuery = query.toLowerCase();
    return availableVehicles.filter((vehicle) =>
      vehicle.id.toLowerCase().includes(lowerQuery) ||
      vehicle.model.toLowerCase().includes(lowerQuery) ||
      vehicle.driverId.toLowerCase().includes(lowerQuery)
    ).slice(0, 8); // Máximo 8 sugerencias
  };

  const filterSuggestions = (query: string): string[] => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) {
      // Si no hay texto, mostrar todas las opciones (limitadas a 20)
      return piuraLocations.slice(0, 20);
    }
    
    // Filtrar por coincidencia, priorizando las que empiezan con la búsqueda
    const exactMatches = piuraLocations.filter((location) =>
      location.toLowerCase().startsWith(lowerQuery)
    );
    
    const containsMatches = piuraLocations.filter((location) =>
      location.toLowerCase().includes(lowerQuery) && 
      !location.toLowerCase().startsWith(lowerQuery)
    );
    
    // Combinar: primero las que empiezan, luego las que contienen
    return [...exactMatches, ...containsMatches].slice(0, 20);
  };

  const handleVehicleChange = (value: string) => {
    setSelectedVehicle(value);
    const filtered = filterVehicleSuggestions(value);
    setVehicleSuggestions(filtered);
    setShowVehicleSuggestions(filtered.length > 0 || value.trim().length === 0);
    
    // Si el usuario escribe exactamente el formato "ID - Modelo", extraer el ID
    const match = value.match(/^([A-Z0-9-]+)\s*-\s*/);
    if (match) {
      const vehicleId = match[1];
      const vehicle = availableVehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        setSelectedVehicleId(vehicleId);
      } else {
        // Si no coincide exactamente, limpiar el ID
        setSelectedVehicleId('');
      }
    } else {
      // Si no tiene el formato esperado, buscar por ID exacto
      const vehicle = availableVehicles.find(v => v.id.toLowerCase() === value.toLowerCase().trim());
      if (vehicle) {
        setSelectedVehicleId(vehicle.id);
      } else {
        setSelectedVehicleId('');
      }
    }
  };

  const handleOriginChange = (value: string) => {
    setOrigin(value);
    const filtered = filterSuggestions(value);
    setOriginSuggestions(filtered);
    setShowOriginSuggestions(filtered.length > 0);
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    const filtered = filterSuggestions(value);
    setDestinationSuggestions(filtered);
    setShowDestinationSuggestions(filtered.length > 0);
  };

  const selectVehicle = (vehicle: ActiveVehicle) => {
    setSelectedVehicle(`${vehicle.id} - ${vehicle.model}`);
    setSelectedVehicleId(vehicle.id);
    setShowVehicleSuggestions(false);
    vehicleInputRef.current?.blur();
  };

  const selectOrigin = (location: string) => {
    setOrigin(location);
    setShowOriginSuggestions(false);
    originInputRef.current?.blur();
  };

  const selectDestination = (location: string) => {
    setDestination(location);
    setShowDestinationSuggestions(false);
    destinationInputRef.current?.blur();
  };

  const handleStartMovement = () => {
    // Aquí puedes agregar la lógica para iniciar el movimiento
    console.log('Iniciar movimiento:', { vehicleId: selectedVehicleId, vehicle: selectedVehicle, origin, destination });
    
    // Notificar que se asignó una ruta con el ID del vehículo
    if (onRouteAssigned && selectedVehicleId) {
      onRouteAssigned(selectedVehicleId, origin, destination);
    }
    
    // Cerrar el modal después de iniciar
    setOpen(false);
    // Limpiar los campos y sugerencias
    setSelectedVehicle('');
    setSelectedVehicleId('');
    setOrigin('');
    setDestination('');
    setVehicleSuggestions([]);
    setOriginSuggestions([]);
    setDestinationSuggestions([]);
    setShowVehicleSuggestions(false);
    setShowOriginSuggestions(false);
    setShowDestinationSuggestions(false);
  };

  // Limpiar campos cuando se cierra el modal sin iniciar movimiento
  useEffect(() => {
    if (!open) {
      setSelectedVehicle('');
      setSelectedVehicleId('');
      setOrigin('');
      setDestination('');
      setVehicleSuggestions([]);
      setOriginSuggestions([]);
      setDestinationSuggestions([]);
      setShowVehicleSuggestions(false);
      setShowOriginSuggestions(false);
      setShowDestinationSuggestions(false);
    }
  }, [open]);

  // Inicializar sugerencias de vehículos cuando se abre el modal
  useEffect(() => {
    if (open) {
      setVehicleSuggestions(availableVehicles.slice(0, 8));
    }
  }, [open, availableVehicles]);

  return (
    <div className="flex items-center gap-4 tracking-route-dialog">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            Asignar Rutas
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] [&>button]:hidden z-[9999] bg-card/95 backdrop-blur-sm">
          <DialogHeader className="space-y-3 pb-6 border-b border-border/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl shadow-sm">
                <Route className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="font-headline text-2xl mb-2">Asignar Rutas</DialogTitle>
                <DialogDescription className="text-sm leading-relaxed">
                  Selecciona la dirección de ida y llegada dentro de la región Piura para comenzar el seguimiento.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-3 relative">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-purple-500/10 rounded-md">
                  <Truck className="h-4 w-4 text-purple-500" />
                </div>
                <Label htmlFor="vehicle" className="text-base font-semibold">Vehículo</Label>
              </div>
              <div className="relative">
                <Input
                  ref={vehicleInputRef}
                  id="vehicle"
                  type="text"
                  value={selectedVehicle}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  onFocus={() => {
                    if (vehicleSuggestions.length > 0) {
                      setShowVehicleSuggestions(true);
                    }
                  }}
                  placeholder="Escribe el ID o modelo del vehículo (ej: ABC-123, Volvo...)"
                  className="h-12 text-base border-2 hover:border-primary/50 focus-visible:border-primary transition-colors pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                {showVehicleSuggestions && vehicleSuggestions.length > 0 && (
                  <div
                    ref={vehicleSuggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-auto"
                  >
                    {vehicleSuggestions.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => selectVehicle(vehicle)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer first:rounded-t-md last:rounded-b-md"
                      >
                        <div className="flex items-center gap-2">
                          <Truck className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-semibold">{vehicle.id}</div>
                            <div className="text-xs text-muted-foreground">{vehicle.model}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3 relative">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-500/10 rounded-md">
                  <Navigation className="h-4 w-4 text-blue-500" />
                </div>
                <Label htmlFor="origin" className="text-base font-semibold">Punto de Origen</Label>
              </div>
              <div className="relative">
                <Input
                  ref={originInputRef}
                  id="origin"
                  type="text"
                  value={origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  onFocus={() => {
                    const filtered = filterSuggestions(origin);
                    setOriginSuggestions(filtered);
                    setShowOriginSuggestions(filtered.length > 0);
                  }}
                  placeholder="Escribe la dirección de origen (ej: Piura Centro, Avenida Grau...)"
                  className="h-12 text-base border-2 hover:border-primary/50 focus-visible:border-primary transition-colors pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                {showOriginSuggestions && originSuggestions.length > 0 && (
                  <div
                    ref={originSuggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-auto"
                  >
                    {originSuggestions.map((location) => (
                      <button
                        key={location}
                        type="button"
                        onClick={() => selectOrigin(location)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer first:rounded-t-md last:rounded-b-md"
                      >
                        <div className="flex items-center gap-2">
                          <Navigation className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                          <span>{location}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3 relative">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-green-500/10 rounded-md">
                  <MapPin className="h-4 w-4 text-green-500" />
                </div>
                <Label htmlFor="destination" className="text-base font-semibold">Punto de Destino</Label>
              </div>
              <div className="relative">
                <Input
                  ref={destinationInputRef}
                  id="destination"
                  type="text"
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onFocus={() => {
                    const filtered = filterSuggestions(destination);
                    setDestinationSuggestions(filtered);
                    setShowDestinationSuggestions(filtered.length > 0);
                  }}
                  placeholder="Escribe la dirección de destino (ej: Sullana Centro, Avenida Panamericana...)"
                  className="h-12 text-base border-2 hover:border-primary/50 focus-visible:border-primary transition-colors pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                  <div
                    ref={destinationSuggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-auto"
                  >
                    {destinationSuggestions.map((location) => (
                      <button
                        key={location}
                        type="button"
                        onClick={() => selectDestination(location)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer first:rounded-t-md last:rounded-b-md"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          <span>{location}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {selectedVehicle && origin && destination && (
              <div className="p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl border-2 border-primary/30 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Route className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Asignación de ruta</p>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      <span className="text-purple-500">Vehículo:</span> {selectedVehicle}
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {origin} <span className="text-primary mx-2">→</span> {destination}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Button 
              onClick={handleStartMovement}
              disabled={!selectedVehicleId || !origin || !destination}
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Iniciar Movimiento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
