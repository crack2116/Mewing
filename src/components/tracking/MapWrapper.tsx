'use client';

import { useEffect, useRef, useState } from 'react';
import L, { Icon, Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import type { ActiveVehicle } from '@/lib/types';

const customIcon = new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="48" height="48"><path d="M56.31,33.17l-1.9-9.48a4,4,0,0,0-4-3.19H40V16.33a4,4,0,0,0-4-4H10a4,4,0,0,0-4,4v24a4,4,0,0,0,4,4H36a4,4_0,0,0,4-4V35.5h8.41a4,4,0,0,0,4-3.19L56,26.5" fill="#3b82f6" /><path d="M32,16.33V40.33H10V16.33H32m4-4H10a4,4,0,0,0-4,4v24a4,4,0,0,0,4,4H36a4,4,0,0,0,4-4V16.33a4,4,0,0,0-4-4Z" fill="#3b82f6" /><path d="M40,20.5H50.41a4,4,0,0,1,4,3.19l1.9,9.48-1.9,5.81a4,4,0,0,1-4,3.19H40Z" fill="#3b82f6" /><circle cx="15" cy="40.33" r="5" fill="white"/><circle cx="31" cy="40.33" r="5" fill="white"/></svg>')}`,
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
