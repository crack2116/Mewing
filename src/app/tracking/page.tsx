'use client';
import dynamic from 'next/dynamic';
import TrackingStats from '@/components/tracking/tracking-stats';
import TrackingActions from '@/components/tracking/tracking-actions';
import ActiveVehicles from '@/components/tracking/active-vehicles';
import { activeVehicles } from '@/lib/data';

const Map = dynamic(() => import('@/components/tracking/map'), {
  ssr: false,
});

export default function TrackingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl font-headline">Seguimiento en Tiempo Real</h1>
        <p className="text-muted-foreground">Monitorea todos los servicios activos en el mapa.</p>
      </div>

      <TrackingStats />
      <TrackingActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Map vehicles={activeVehicles} />
        </div>
        <div className="lg:col-span-1">
          <ActiveVehicles vehicles={activeVehicles} />
        </div>
      </div>
    </div>
  );
}
