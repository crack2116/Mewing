'use client';

import { useEffect, useRef, useState } from 'react';
import L, { Icon, Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import type { ActiveVehicle } from '@/lib/types';

const customIcon = new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path fill="#3B82F6" d="M12 0C7.589 0 4 3.589 4 8c0 4.411 8 16 8 16s8-11.589 8-16c0-4.411-3.589-8-8-8z"/><path fill="white" d="M17.5 9.5H16V8.25a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75V9.5h-1.5V6.25a.75.75 0 0 0-.75-.75H7.5a.75.75 0 0 0-.75.75v6.5a.75.75 0 0 0 .75.75h.5a1.5 1.5 0 0 0 3 0h2a1.5 1.5 0 0 0 3 0h.5a.75.75 0 0 0 .75-.75V9.5zM9 13.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm6 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/></svg>')}`,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
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
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    if (typeof window !== 'undefined') {
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

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    }
  }, [])

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
