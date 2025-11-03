'use client';
import {
  Truck,
  LayoutGrid,
  ClipboardList,
  Users,
  LineChart,
  User,
  LifeBuoy,
  Map,
  LogOut,
  Moon,
  Sun,
  Package2,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/services', icon: ClipboardList, label: 'Services' },
  { href: '/management', icon: Users, label: 'Management' },
  { href: '/tracking', icon: Map, label: 'Tracking' },
  { href: '/reports', icon: LineChart, label: 'Reports' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6 text-primary" />
              <span className="">Mewing</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === href && "bg-muted text-primary font-semibold"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
  );
}
