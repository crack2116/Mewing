'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { Icon } from 'leaflet';
import { Button } from '@/components/ui/button';
import { Pause } from 'lucide-react';
import type { ActiveVehicle } from '@/lib/types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const customIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS10cnVjayI+PGcgc3Ryb2tlPSIjZmZmZmZmIiBmaWxsPSIjMjU2M2ViIj48cGF0aCBkPSJNNC41IDE1LjVDMy42NyAxNSAyIDE0LjMzIDIuNSA4LjVMMyA2aDEyLjQ3Yy41MiAwIC45OC4yOCAxLjI1LjcxTDIwIDEyVjE5SDJhMiAyIDAgMCAxIDAtNHoiLz48cGF0aCBkPSJtMTYgMyAzLjQxIDQuNTkiLz48Y2lyY2xlIGN4PSI2IiBjeT0iMTkiIHI9IjIiLz48Y2lyY2xlIGN4PSIxNyIgY3k9IjE5IiByPSIyIi8+PC9nPjwvc3ZnPg==',
  iconSize: [38, 38],
});

interface MapProps {
  vehicles: ActiveVehicle[];
}

export default function Map({ vehicles }: MapProps) {
  if (typeof window === 'undefined') {
    return null; 
  }

  return (
    <div className="relative h-[400px] lg:h-full w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={[-5.18, -80.63]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={vehicle.position}
            icon={customIcon}
          >
            <Popup>
              <b>{vehicle.id}</b><br />
              {vehicle.model}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
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