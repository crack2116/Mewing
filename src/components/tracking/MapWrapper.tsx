'use client';

import { useEffect, useRef, useState } from 'react';
import L, { Icon, Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import type { ActiveVehicle } from '@/lib/types';

const customIcon = new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 32 46"><path fill="#022a4d" d="M15.5 45.75c.31.32.73.5 1.16.5.43 0 .85-.18 1.16-.5C18.14 45.42 32 30.01 32 16.5 32 7.39 24.84 0 16 0S0 7.39 0 16.5C0 30.01 13.86 45.42 15.5 45.75z"/><path fill="#1d63ff" d="M16 43c.4 0 .78-.17 1.05-.45C17.34 42.25 30 28.18 30 16A14 14 0 1 0 2 16c0 12.18 12.66 26.25 12.95 26.55c.27.28.65.45 1.05.45z"/><path fill="#fff" d="M22.4 17.3h-2.5v-2c0-1-1-2-2-2h-3.8c-1 0-2 1-2 2v2H9.6c-1 0-1.5.5-1.5 1.5v5c0 1 .5 1.5 1.5 1.5h.7c.3-1.2 1.4-2 2.7-2s2.4.8 2.7 2h3.4c.3-1.2 1.4-2 2.7-2s2.4.8 2.7 2h.7c1 0 1.5-.5 1.5-1.5v-5c0-1-.5-1.5-1.5-1.5zM13 21a1 1 0 1 1-2 0a1 1 0 0 1 2 0zm6 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0z"/></svg>')}`,
    iconSize: [40, 60],
    iconAnchor: [20, 60],
    popupAnchor: [0, -60],
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
