'use client';

import { useEffect, useRef, useState } from 'react';
import L, { Icon, Map as LeafletMap, Marker, Polyline } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ActiveVehicle } from '@/lib/types';

const createCustomIcon = () => {
  const uniqueId = Math.random().toString(36).substring(7);
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64"><defs><filter id="shadow${uniqueId}" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/></filter></defs><g filter="url(#shadow${uniqueId})"><path d="M24 2C13.507 2 5 10.507 5 21c0 10 19 35 19 35s19-25 19-35C43 10.507 34.493 2 24 2z" fill="#2563eb" stroke="#ffffff" stroke-width="2.5"/><path d="M24 58L18 64L24 62L30 64L24 58Z" fill="#2563eb"/><g transform="translate(24, 24) scale(0.88)"><rect fill="#ffffff" stroke="#2563eb" stroke-width="2.5" x="-9" y="-6" width="10" height="11" rx="1.2"/><rect fill="#ffffff" stroke="#2563eb" stroke-width="2.5" x="1" y="-4" width="12" height="9" rx="1"/><rect fill="#2563eb" x="-7" y="-4" width="5" height="5" rx="0.6" opacity="0.4"/><line x1="1" y1="-6" x2="1" y2="5" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/><circle fill="#ffffff" stroke="#2563eb" stroke-width="2.5" cx="-7" cy="6" r="3"/><circle fill="#ffffff" stroke="#2563eb" stroke-width="2.5" cx="10" cy="6" r="3"/><circle fill="#2563eb" cx="-7" cy="6" r="1.5"/><circle fill="#2563eb" cx="10" cy="6" r="1.5"/></g></g></svg>`;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`,
    iconSize: [48, 64],
    iconAnchor: [24, 64],
    popupAnchor: [0, -64],
  });
};


interface MapProps {
  vehicles: ActiveVehicle[];
  selectedVehicleId?: string | null;
  canMove?: boolean;
  movingVehicleId?: string | null;
  destination?: string | null;
  onDestinationReached?: () => void;
}

export default function MapWrapper({ vehicles: initialVehicles, selectedVehicleId, canMove = false, movingVehicleId = null, destination = null, onDestinationReached }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Map<string, Marker>>(new Map());
  const polylineRefs = useRef<Map<string, Polyline>>(new Map());
  const pathHistoryRef = useRef<Map<string, L.LatLng[]>>(new Map());
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [isPaused, setIsPaused] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);
  const [movementCount, setMovementCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') {
        return;
    }
    
    if (!mapContainerRef.current || mapRef.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, {
        center: [-5.18, -80.63],
        zoom: 13,
        scrollWheelZoom: false,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    initialVehicles.forEach((vehicle) => {
        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6;">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${vehicle.id}</div>
            <div style="font-size: 13px; margin: 4px 0;"><strong>Conductor:</strong> ${vehicle.driverId}</div>
            <div style="font-size: 13px; margin: 4px 0;"><strong>Vehículo:</strong> ${vehicle.model}</div>
            <div style="font-size: 13px; margin: 4px 0;"><strong>Estado:</strong> ${vehicle.status}</div>
            <div style="font-size: 13px; margin: 4px 0;"><strong>Actualizado:</strong> ${vehicle.time}</div>
          </div>
        `;
        
        const marker = L.marker(vehicle.position, { icon: createCustomIcon() })
        .addTo(map)
        .bindPopup(popupContent);
        markerRefs.current.set(vehicle.id, marker);
        
        // Inicializar historial de ruta con la posición inicial (pero no crear polyline aún)
        pathHistoryRef.current.set(vehicle.id, [L.latLng(vehicle.position[0], vehicle.position[1])]);
        
        // NO crear polilínea roja aquí - solo se creará cuando se asigne una ruta
    });

    return () => {
        if (mapRef.current) {
          // Limpiar todas las polilíneas
          polylineRefs.current.forEach((polyline) => {
            if (mapRef.current) {
              mapRef.current.removeLayer(polyline);
            }
          });
          polylineRefs.current.clear();
          pathHistoryRef.current.clear();
          
          mapRef.current.remove();
          mapRef.current = null;
        }
    }
  }, [initialVehicles]);

  useEffect(() => {
    if (!canMove || !movingVehicleId) return; // No mover los vehículos si no se ha asignado una ruta
    
    const interval = setInterval(() => {
      if (!isPaused && !hasNotified) {
        setMovementCount(prev => prev + 1);
        
        setVehicles((currentVehicles) =>
          currentVehicles.map((v) => {
            // Solo mover el vehículo asignado
            if (v.id === movingVehicleId) {
              return {
                ...v,
                position: [
                  v.position[0] + (Math.random() - 0.5) * 0.001,
                  v.position[1] + (Math.random() - 0.5) * 0.001,
                ],
              };
            }
            return v; // Los demás vehículos permanecen en su posición
          })
        );
      }
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [isPaused, canMove, movingVehicleId, hasNotified]);

  // Detectar cuando el vehículo llega al destino (simulado después de 15 movimientos)
  useEffect(() => {
    if (!canMove || !movingVehicleId || !destination || hasNotified) return;

    // Simular llegada al destino después de 15 movimientos (aproximadamente 30 segundos)
    if (movementCount >= 15) {
      setHasNotified(true);
      
      // Mostrar notificación
      toast({
        title: "Vehículo llegó al destino",
        description: `El vehículo ha llegado a ${destination}. No te olvides asignar más rutas.`,
        duration: 5000,
      });

      // Notificar al componente padre
      if (onDestinationReached) {
        setTimeout(() => {
          onDestinationReached();
          setHasNotified(false);
          setMovementCount(0);
        }, 1000);
      }
    }
  }, [movementCount, canMove, movingVehicleId, destination, hasNotified, toast, onDestinationReached]);

  // Resetear contadores cuando cambia el vehículo o destino
  useEffect(() => {
    setMovementCount(0);
    setHasNotified(false);
  }, [movingVehicleId, destination]);


  useEffect(() => {
    vehicles.forEach((vehicle) => {
      const marker = markerRefs.current.get(vehicle.id);
      let polyline = polylineRefs.current.get(vehicle.id);
      const pathHistory = pathHistoryRef.current.get(vehicle.id);
      
      if (marker) {
        const currentLatLng = L.latLng(vehicle.position[0], vehicle.position[1]);
        const previousLatLng = pathHistory && pathHistory.length > 0 ? pathHistory[pathHistory.length - 1] : null;
        
        // Actualizar contenido del popup
        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6;">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${vehicle.id}</div>
            <div style="font-size: 13px; margin: 4px 0;"><strong>Conductor:</strong> ${vehicle.driverId}</div>
            <div style="font-size: 13px; margin: 4px 0;"><strong>Vehículo:</strong> ${vehicle.model}</div>
            <div style="font-size: 13px; margin: 4px 0;"><strong>Estado:</strong> ${vehicle.status}</div>
            <div style="font-size: 13px; margin: 4px 0;"><strong>Actualizado:</strong> ${vehicle.time}</div>
          </div>
        `;
        marker.setPopupContent(popupContent);
        
        // Actualizar posición del marcador
        marker.setLatLng(vehicle.position);
        
        // Solo crear/actualizar polyline si el vehículo está en movimiento (canMove y es el movingVehicleId)
        const isMoving = canMove && movingVehicleId === vehicle.id;
        
        if (isMoving) {
          // Crear polyline si no existe y el vehículo está en movimiento
          if (!polyline && mapRef.current) {
            polyline = L.polyline(
              [[vehicle.position[0], vehicle.position[1]]],
              {
                color: '#ef4444',
                weight: 3,
                opacity: 0.7,
                smoothFactor: 1
              }
            ).addTo(mapRef.current);
            polylineRefs.current.set(vehicle.id, polyline);
          }
          
          // Solo agregar al historial si la posición cambió significativamente
          if (!previousLatLng || currentLatLng.distanceTo(previousLatLng) > 0.0001) {
            // Actualizar historial de ruta
            if (pathHistory) {
              pathHistory.push(currentLatLng);
            } else {
              pathHistoryRef.current.set(vehicle.id, [currentLatLng]);
            }
            
            // Actualizar polyline con el nuevo historial (solo si existe y está en movimiento)
            if (polyline) {
              const currentHistory = pathHistoryRef.current.get(vehicle.id) || [currentLatLng];
              const latlngs = currentHistory.map(latlng => [latlng.lat, latlng.lng]);
              polyline.setLatLngs(latlngs);
            }
          }
        } else {
          // Si el vehículo no está en movimiento, eliminar la polyline si existe
          if (polyline && mapRef.current) {
            mapRef.current.removeLayer(polyline);
            polylineRefs.current.delete(vehicle.id);
            // Resetear historial cuando se detiene el movimiento
            pathHistoryRef.current.set(vehicle.id, [L.latLng(vehicle.position[0], vehicle.position[1])]);
          }
        }
      }
    });
  }, [vehicles, canMove, movingVehicleId]);

  useEffect(() => {
    if (selectedVehicleId && mapRef.current) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      const marker = markerRefs.current.get(selectedVehicleId);
      
      if (vehicle && marker) {
        mapRef.current.setView(vehicle.position, 15, {
          animate: true,
          duration: 0.5
        } as L.ZoomPanOptions);
        
        setTimeout(() => {
          marker.openPopup();
        }, 500);
      }
    }
  }, [selectedVehicleId, vehicles]);

  return (
    <div className="relative h-[400px] lg:h-full w-full rounded-lg overflow-hidden border z-0">
      <div ref={mapContainerRef} className="h-full w-full" />
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="bg-card p-2 rounded-lg shadow-lg flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
            {isPaused ? 'Reanudar' : 'Pausar'}
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
            {isPaused ? 'Pausado' : 'En vivo'}
          </div>
        </div>
      </div>
    </div>
  );
}
