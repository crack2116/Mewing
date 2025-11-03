'use client';

import { useEffect, useRef, useState } from 'react';
import L, { Icon, Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import type { ActiveVehicle } from '@/lib/types';

const customIcon = new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <!-- Círculo blanco con borde azul oscuro -->
        <circle cx="24" cy="24" r="20" fill="#ffffff" stroke="#1e40af" stroke-width="2.5"/>
        <!-- Cabina del camión -->
        <rect fill="#2563eb" x="14" y="18" width="10" height="8" rx="1"/>
        <!-- Carrocería del camión -->
        <rect fill="#2563eb" x="24" y="20" width="8" height="6" rx="0.5"/>
        <!-- Ventana del camión -->
        <rect fill="#ffffff" x="16" y="20" width="6" height="4" rx="0.5"/>
        <!-- Ruedas del camión -->
        <circle fill="#1e40af" cx="18" cy="28" r="2.5"/>
        <circle fill="#1e40af" cx="28" cy="28" r="2.5"/>
        <circle fill="#ffffff" cx="18" cy="28" r="1.5"/>
        <circle fill="#ffffff" cx="28" cy="28" r="1.5"/>
      </g>
    </svg>
  `)}`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
});


interface MapProps {
  vehicles: ActiveVehicle[];
}

export default function MapWrapper({ vehicles: initialVehicles }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Map<string, Marker>>(new Map());
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [isPaused, setIsPaused] = useState(false);

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
        const marker = L.marker(vehicle.position, { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>${vehicle.id}</b><br />${vehicle.model}`);
        markerRefs.current.set(vehicle.id, marker);
    });

    return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
    }
  }, [initialVehicles]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setVehicles((currentVehicles) =>
          currentVehicles.map((v) => ({
            ...v,
            position: [
              v.position[0] + (Math.random() - 0.5) * 0.001,
              v.position[1] + (Math.random() - 0.5) * 0.001,
            ],
          }))
        );
      }
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [isPaused]);


  useEffect(() => {
    vehicles.forEach((vehicle) => {
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
