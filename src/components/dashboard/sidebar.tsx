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
  Settings,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from "@/lib/placeholder-images";

const navItems = [
  { href: '/', icon: LayoutGrid, label: 'Panel de Control' },
  { href: '/services', icon: ClipboardList, label: 'Solicitudes' },
  { href: '/management', icon: Users, label: 'Gestión' },
  { href: '/tracking', icon: Map, label: 'Seguimiento' },
  { href: '/reports', icon: LineChart, label: 'Reportes' },
];

const secondaryNavItems = [
  { href: '/profile', icon: User, label: 'Mi Perfil' },
  { href: '/support', icon: LifeBuoy, label: 'Soporte' },
  { href: '/settings', icon: Settings, label: 'Configuración' },
]

export default function Sidebar() {
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

  return (
    <div className="hidden border-r bg-background md:flex md:flex-col">
        <div className="flex h-14 items-center justify-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold font-headline text-lg">
            <Truck className="h-6 w-6 text-primary" />
            <span className="">Mewing</span>
            </Link>
        </div>

        <div className="flex-1 overflow-auto py-4">
            <div className="flex flex-col justify-between h-full">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Principal</p>
                    {navItems.map(({ href, icon: Icon, label }) => (
                    <Link
                        key={label}
                        href={href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                        pathname === href ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-primary'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </Link>
                    ))}
                    <p className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase">Configuración</p>
                    {secondaryNavItems.map(({ href, icon: Icon, label }) => (
                    <Link
                        key={label}
                        href={href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                        pathname === href ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-primary'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </Link>
                    ))}
                </nav>

                <div className="mt-auto p-4">
                  <Link
                      href="#"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-muted-foreground hover:text-primary"
                  >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                  </Link>
                </div>
            </div>
        </div>
    </div>
  );
}
