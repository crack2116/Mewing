import Overview from "@/components/dashboard/overview";
import SystemStatus from "@/components/dashboard/system-status";
import RecentRequests from "@/components/dashboard/recent-requests";
import QuickActions from "@/components/dashboard/quick-actions";

export default function Home() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Panel de Control</h1>
      </div>
       <p className="text-muted-foreground">Bienvenido de vuelta. Aquí tienes un resumen de tu operación de transporte.</p>
      <div className="flex flex-1 rounded-lg" x-chunk="dashboard-02-chunk-1">
        <div className="flex flex-col gap-8 w-full">
            <Overview />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <RecentRequests />
              </div>
              <div className="xl:col-span-1 flex flex-col gap-8">
                <SystemStatus />
                <QuickActions />
              </div>
            </div>
        </div>
      </div>
    </>
  );
}
