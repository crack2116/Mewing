'use client';
import Overview from "@/components/dashboard/overview";
import RecentRequests from "@/components/dashboard/recent-requests";
import SystemStatus from "@/components/dashboard/system-status";

export default function Home() {
  return (
    <>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">
          Bienvenido de vuelta. Aquí tienes un resumen de tu operación de transporte.
        </p>
      </div>
      
      <div className="flex flex-col gap-6">
        <Overview />
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <RecentRequests />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <SystemStatus />
          </div>
        </div>
      </div>
    </>
  );
}
