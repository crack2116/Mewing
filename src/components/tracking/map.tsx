'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { Icon } from 'leaflet';
import { Button } from '@/components/ui/button';
import { Pause } from 'lucide-react';
import type { ActiveVehicle } from '@/lib/types';
import { useEffect, useState } from 'react';

// Fix for default icon path issue with webpack
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

function MapUpdater() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100); 

        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

export default function Map({ vehicles }: MapProps) {
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setMapKey(prevKey => prevKey + 1);
  }, []);

  return (
    <div className="relative h-[400px] lg:h-full w-full rounded-lg overflow-hidden border">
      <MapContainer
        key={mapKey}
        center={[-5.18, -80.63]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <MapUpdater />
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
