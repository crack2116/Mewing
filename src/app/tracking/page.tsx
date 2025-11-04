'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import TrackingStats from '@/components/tracking/tracking-stats';
import TrackingActions from '@/components/tracking/tracking-actions';
import ActiveVehicles from '@/components/tracking/active-vehicles';
import { activeVehicles as initialVehicles } from '@/lib/data';
import type { ActiveVehicle } from '@/lib/types';

const Map = dynamic(() => import('@/components/tracking/MapWrapper'), {
  ssr: false,
});

export default function TrackingPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [assignedVehicleId, setAssignedVehicleId] = useState<string | null>(null);
  const [routeDestination, setRouteDestination] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<ActiveVehicle[]>(initialVehicles);

  const handleRouteAssigned = (vehicleId: string, origin: string, destination: string) => {
    // Cambiar el estado del vehículo a "En tránsito"
    setVehicles(prevVehicles => 
      prevVehicles.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, status: 'En tránsito' as const }
          : vehicle
      )
    );
    
    // Guardar el ID del vehículo asignado y el destino
    setAssignedVehicleId(vehicleId);
    setRouteDestination(destination);
  };

  const handleDestinationReached = () => {
    // Cambiar el estado del vehículo de vuelta a "Disponible"
    if (assignedVehicleId) {
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => 
          vehicle.id === assignedVehicleId 
            ? { ...vehicle, status: 'Disponible' as const }
            : vehicle
        )
      );
      setAssignedVehicleId(null);
      setRouteDestination(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl font-headline">Seguimiento en Tiempo Real</h1>
        <p className="text-muted-foreground">Monitorea todos los servicios activos en el mapa.</p>
      </div>

      <TrackingStats />
      <TrackingActions vehicles={vehicles} onRouteAssigned={handleRouteAssigned} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Map 
            vehicles={vehicles} 
            selectedVehicleId={selectedVehicleId} 
            canMove={!!assignedVehicleId}
            movingVehicleId={assignedVehicleId}
            destination={routeDestination}
            onDestinationReached={handleDestinationReached}
          />
        </div>
        <div className="lg:col-span-1">
          <ActiveVehicles vehicles={vehicles} onVehicleClick={setSelectedVehicleId} selectedVehicleId={selectedVehicleId} />
        </div>
      </div>
    </div>
  );
}
