import Overview from "@/components/dashboard/overview";
import RecentRequests from "@/components/dashboard/recent-requests";
import SalesChart from "@/components/dashboard/sales-chart";

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Panel de Control</h1>
      </div>
      
      <div className="flex flex-col gap-6 mt-6">
        <Overview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          <div className="lg:col-span-1">
            <RecentRequests />
          </div>
        </div>
      </div>
    </>
  );
}
