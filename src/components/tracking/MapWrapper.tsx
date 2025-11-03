'use client';

import { useEffect, useRef } from 'react';
import L, { Icon, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Pause } from 'lucide-react';
import type { ActiveVehicle } from '@/lib/types';

// Fix para el ícono por defecto de react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customIcon = new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path fill="hsl(var(--primary))" d="M12 0L24 12L12 24L0 12L12 0Z"/><path fill="hsl(var(--primary-foreground))" d="M18.5 12.5H16v-1.5c0-.83-.67-1.5-1.5-1.5h-5c-.83 0-1.5.67-1.5 1.5V11H5.5c-.83 0-1.5.67-1.5 1.5v2c0 .83.67 1.5 1.5 1.5H7v.5c0 .83.67 1.5 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5V17h3v.5c0 .83.67 1.5 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5V17h1.5c.83 0 1.5-.67 1.5-1.5v-2c0-.83-.67-1.5-1.5-1.5zM9 11.5v-1h6v1H9z"/></svg>')}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});


interface MapProps {
  vehicles: ActiveVehicle[];
}

export default function MapWrapper({ vehicles }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Initialize the map
      const map = L.map(mapContainerRef.current, {
        center: [-5.18, -80.63],
        zoom: 13,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      vehicles.forEach((vehicle) => {
        L.marker(vehicle.position, { icon: customIcon })
          .addTo(map)
          .bindPopup(`<b>${vehicle.id}</b><br />${vehicle.model}`);
      });
    }

    // Cleanup function to destroy the map instance
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [vehicles]);


  return (
    <div className="relative h-[400px] lg:h-full w-full rounded-lg overflow-hidden border">
       <div ref={mapContainerRef} className="h-full w-full" />
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="bg-card p-2 rounded-lg shadow-lg flex items-center gap-2">
          <Button size="sm" variant="secondary">
            <Pause className="mr-2 h-4 w-4" />
            Pausar
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            En vivo
          </div>
        </div>
      </div>
    </div>
  );
}
