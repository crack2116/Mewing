import Overview from "@/components/dashboard/overview";
import SystemStatus from "@/components/dashboard/system-status";
import RecentRequests from "@/components/dashboard/recent-requests";
import QuickActions from "@/components/dashboard/quick-actions";

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Panel de Control</h1>
        <p className="text-sm text-muted-foreground">Bienvenido de vuelta.</p>
      </div>
      
      <div className="flex flex-col gap-6 mt-4">
        <Overview />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Columna Izquierda */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <SystemStatus />
          </div>

          {/* Columna Central */}
          <div className="lg:col-span-2">
            <RecentRequests />
          </div>

          {/* Columna Derecha */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <QuickActions />
          </div>
        </div>
      </div>
    </>
  );
}
