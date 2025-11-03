'use client';

import { useEffect, useRef, useState } from 'react';
import L, { Icon, Map, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import type { ActiveVehicle } from '@/lib/types';

// Fix para el ícono por defecto de react-leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

const customIcon = new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa('<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 0C15.1634 0 8 7.16344 8 16C8 24.8366 15.1634 32 24 32C32.8366 32 40 24.8366 40 16C40 7.16344 32.8366 0 24 0Z" fill="hsl(var(--primary))"/><path d="M36 19L31 19L31 16L33 16L33 13L29 13L29 21L31 21L31 23L26 23L26 21L21 21L21 23L16 23L16 21L18 21L18 13L14 13L14 16L16 16L16 19L11 19L11 16L12 16L12 11L25 11L25 8L35 8L35 11L36 11L36 19Z" fill="white"/></svg>')}`,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});


interface MapProps {
  vehicles: ActiveVehicle[];
}

export default function MapWrapper({ vehicles: initialVehicles }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRefs = useRef<Map<string, Marker>>(new Map());
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) {
      return;
    }
      
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
      const marker = L.marker(vehicle.position, { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>${vehicle.id}</b><br />${vehicle.model}`);
      markerRefs.current.set(vehicle.id, marker);
    });

    const interval = setInterval(() => {
        if (!isPaused) {
            setVehicles(currentVehicles => 
                currentVehicles.map(v => ({
                    ...v,
                    position: [
                        v.position[0] + (Math.random() - 0.5) * 0.001,
                        v.position[1] + (Math.random() - 0.5) * 0.001,
                    ]
                }))
            );
        }
    }, 2000);


    return () => {
        clearInterval(interval);
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, [initialVehicles, isPaused]);

  useEffect(() => {
    vehicles.forEach(vehicle => {
      const marker = markerRefs.current.get(vehicle.id);
      if (marker) {
        marker.setLatLng(vehicle.position);
      }
    });
  }, [vehicles]);


  return (
    <div className="relative h-[400px] lg:h-full w-full rounded-lg overflow-hidden border">
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
