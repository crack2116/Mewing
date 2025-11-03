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
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMyNTYzZWIiIGQ9Ik00MyAxOWgtNGEyIDIgMCAwIDEtMi0yVjlhMiAyIDAgMCAxIDItMmg0djEybTAtMjRoLTRhMiAyIDAgMCAwLTItMnYtMmEyIDIgMCAwIDEgMi0yaDR2NlptLTggMThIMzlhMiAyIDAgMCAxLTItMlY5YTkgOSAwIDAgMC05LTlIMTRhNCA0IDAgMCAwLTQgNGwtMiA5SDEzYTMgMyAwIDAgMSAzIDNoM2EyIDIgMCAxIDEgMCA0SDZhMiAyIDAgMSAwIDAgNGg0YTQgNCAwIDEgMCA4IDBoMTRhMiAyIDAgMSAxIDAgNGgtMmEyIDIgMCAxIDEgMCA0aDJhNCA0IDAgMSAwIDgtMGguNSIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xMyA4djJoM3Y0aDdWNkgxM2EyIDIgMCAwIDAtMiAydjEuNWE1IDUgMCAwIDEgMi4yLTFoNC44djZIMzBhMyAzIDAgMCAxIDMgM3YxMWgyVjEzaC00djEyaDR2LTFoLTJhMyAzIDAgMCAxIDAtNmg0djRoLTRhMyAzIDAgMSAxIDAtNmgyVjIxaC0zdi00aC00djRoLTJ2M2g1djJoM3YtMmgydjJoMnYtMmgydjJoM3YtN2gtNnYtM2g2di00aC02VjhoM3YyWm0tMy0zaDR2MmgtNFY1WiIvPjxwYXRoIGZpbGw9IiMyNTYzZWIiIGQ9Ik0xOCAyM2gydjJoLTJ2LTJabTQtMmgtMnYyaDJ2LTJabTQtMmgtMnYyaDJ2LTJabTQtMmgtMnYyaDJ2LTJaIi8+PC9nPjwvc3ZnPg==',
  iconSize: [38, 38],
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
