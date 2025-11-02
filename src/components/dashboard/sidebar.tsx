'use client';
import {
  Truck,
  LayoutGrid,
  ClipboardList,
  Users,
  LineChart,
  Settings,
  User,
  LifeBuoy,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from "@/lib/placeholder-images";

const navItems = [
  { href: '/', icon: LayoutGrid, label: 'Panel de Control' },
  { href: '/services', icon: ClipboardList, label: 'Solicitudes de Servicio' },
  { href: '/management', icon: Users, label: 'Gestión' },
  { href: '/tracking', icon: LineChart, label: 'Seguimiento en Tiempo Real' },
  { href: '/reports', icon: LineChart, label: 'Reportes' },
  { href: '/support', icon: LifeBuoy, label: 'Soporte' },
  { href: '/profile', icon: User, label: 'Mi Perfil' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
            <Truck className="h-6 w-6 text-primary" />
            <span className="">Mewing</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  pathname === href ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-3">
                 <Avatar className="h-10 w-10">
                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint} />}
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-foreground">Usuario</p>
                    <p className="text-xs text-muted-foreground">e@gmail.com</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
