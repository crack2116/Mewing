import Header from "@/components/dashboard/header";
import Overview from "@/components/dashboard/overview";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentRequests from "@/components/dashboard/recent-requests";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl grid gap-8">
          <h1 className="text-3xl font-bold font-headline text-foreground">
            Dashboard
          </h1>
          <Overview />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <RecentRequests />
            </div>
            <div className="xl:col-span-1">
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
