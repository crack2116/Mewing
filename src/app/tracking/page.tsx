'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import TrackingStats from '@/components/tracking/tracking-stats';
import TrackingActions from '@/components/tracking/tracking-actions';
import ActiveVehicles from '@/components/tracking/active-vehicles';
import { db, auth } from '@/app/management/firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ActiveVehicle } from '@/lib/types';

const Map = dynamic(() => import('@/components/tracking/MapWrapper'), {
  ssr: false,
});

export default function TrackingPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [assignedVehicleId, setAssignedVehicleId] = useState<string | null>(null);
  const [routeDestination, setRouteDestination] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<ActiveVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Authenticate and load vehicles from Firestore
  useEffect(() => {
    let unsubscribeVehicles: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Error signing in:', error);
          setLoading(false);
        }
      } else {
        // Helper function to convert Firestore vehicle data to ActiveVehicle
        const convertVehicleData = (doc: any, index: number, totalDocs: number): ActiveVehicle => {
          const data = doc.data();
          const vehicleId = data.licensePlate || data.plate || doc.id;
          const model = data.make && data.model 
            ? `${data.make} ${data.model}`
            : data.model || 'Sin modelo';
          
          // Si tiene coordenadas, usarlas; si no, generar posiciones separadas
          let position: [number, number];
          if (data.lat && data.lng) {
            position = [data.lat, data.lng];
          } else {
            // Separar vehículos en un radio alrededor de Piura
            // Cada vehículo se posiciona en un círculo alrededor del centro
            const baseLat = -5.19449;
            const baseLng = -80.63282;
            const radius = 0.015; // Aproximadamente 1.5km para separar mejor
            const angle = (index * (360 / Math.max(totalDocs, 1))) * (Math.PI / 180);
            const offsetLat = radius * Math.cos(angle);
            const offsetLng = radius * Math.sin(angle);
            position = [baseLat + offsetLat, baseLng + offsetLng];
          }
          
          let time = 'Sin actualizar';
          if (data.lastUpdate) {
            try {
              const updateDate = data.lastUpdate.toDate ? data.lastUpdate.toDate() : new Date(data.lastUpdate);
              time = format(updateDate, 'hh:mm:ss a', { locale: es });
            } catch (e) {
              time = 'Sin actualizar';
            }
          }
          
          return {
            id: vehicleId,
            status: 'Disponible' as const,
            model: model,
            driverId: data.driverId || 'Sin conductor',
            otherId: doc.id,
            time: time,
            position: position,
          };
        };
        
        // Set up real-time listener for vehicle updates
        unsubscribeVehicles = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
          const totalDocs = snapshot.docs.length;
          const updatedVehicles: ActiveVehicle[] = snapshot.docs.map((doc, index) => 
            convertVehicleData(doc, index, totalDocs)
          );
          
          // Remove duplicates based on otherId (doc.id) to ensure uniqueness
          const uniqueVehicles = updatedVehicles.filter((vehicle, index, self) => 
            index === self.findIndex((v) => v.otherId === vehicle.otherId)
          );
          
          // Separar vehículos que tienen la misma posición (especialmente si no tienen coordenadas)
          const separatedVehicles = uniqueVehicles.map((vehicle, index) => {
            // Si el vehículo no tiene coordenadas reales (está en la posición por defecto)
            const isDefaultPosition = vehicle.position[0] === -5.19449 && vehicle.position[1] === -80.63282;
            
            // Verificar si hay otros vehículos con la misma posición
            const samePositionVehicles = uniqueVehicles.filter(v => 
              Math.abs(v.position[0] - vehicle.position[0]) < 0.0001 && 
              Math.abs(v.position[1] - vehicle.position[1]) < 0.0001 &&
              v.otherId !== vehicle.otherId
            );
            
            if (samePositionVehicles.length > 0 || isDefaultPosition) {
              // Separar este vehículo en un círculo
              const baseLat = -5.19449;
              const baseLng = -80.63282;
              const radius = 0.015;
              const angle = (index * (360 / uniqueVehicles.length)) * (Math.PI / 180);
              const offsetLat = radius * Math.cos(angle);
              const offsetLng = radius * Math.sin(angle);
              return { ...vehicle, position: [baseLat + offsetLat, baseLng + offsetLng] };
            }
            
            return vehicle;
          });
          
          // Preserve status of vehicles that are in transit
          setVehicles((prevVehicles) => {
            return separatedVehicles.map((newVehicle) => {
              const prevVehicle = prevVehicles.find(v => v.otherId === newVehicle.otherId);
              if (prevVehicle && prevVehicle.status === 'En tránsito') {
                return { ...newVehicle, status: 'En tránsito' as const };
              }
              return newVehicle;
            });
          });
          
          setLoading(false);
        }, (error) => {
          console.error('Error loading vehicles:', error);
          setLoading(false);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeVehicles) {
        unsubscribeVehicles();
      }
    };
  }, []);

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
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Cargando vehículos...</p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
