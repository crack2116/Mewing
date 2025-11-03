'use client';
import {
  Truck,
  ClipboardList,
  Users,
  LineChart,
  Map,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';


const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/services', icon: ClipboardList, label: 'Servicios' },
  { href: '/management', icon: Users, label: 'Gestión' },
  { href: '/tracking', icon: Map, label: 'Seguimiento' },
  { href: '/reports', icon: LineChart, label: 'Reportes' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-card sm:flex">
        <div className="flex h-20 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold font-headline text-lg">
                <Truck className="h-6 w-6 text-primary" />
                <span className="">Mewing</span>
            </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                  pathname === href && "bg-muted text-primary font-semibold"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
  );
}
