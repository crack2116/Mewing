'use client';
import {
  Truck,
  ClipboardList,
  Users,
  LineChart,
  Map,
  Home,
  LifeBuoy,
  Route
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { getProfileImageUrl } from '@/lib/profile-image';
import { useUserRole } from '@/hooks/use-user-role';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/app/management/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Items de navegación para admin
const adminNavItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/services', icon: ClipboardList, label: 'Servicios' },
  { href: '/management', icon: Users, label: 'Gestión' },
  { href: '/tracking', icon: Map, label: 'Seguimiento' },
  { href: '/reports', icon: LineChart, label: 'Reportes' },
  { href: '/routes', icon: Route, label: 'Rutas' },
  { href: '/support', icon: LifeBuoy, label: 'Soporte' },
];

// Items de navegación para asistente (sin Gestión, Reportes y Rutas)
const assistantNavItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/services', icon: ClipboardList, label: 'Servicios' },
  { href: '/tracking', icon: Map, label: 'Seguimiento' },
  { href: '/support', icon: LifeBuoy, label: 'Soporte' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState('Usuario');
  const [userEmail, setUserEmail] = useState('e@gmail.com');
  const { isAdmin, isAssistant, loading: roleLoading } = useUserRole();

  // Obtener imagen de perfil y datos del usuario
  useEffect(() => {
    const loadProfileImage = async () => {
      const url = await getProfileImageUrl();
      if (url) {
        setProfileImageUrl(url);
      }
    };
    loadProfileImage();

    // Obtener datos del usuario autenticado
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Establecer valores por defecto desde Firebase Auth
        setUserName(user.displayName || 'Usuario');
        setUserEmail(user.email || 'e@gmail.com');

        // Intentar obtener datos adicionales de Firestore
        if (user.email) {
          try {
            const usersQuery = query(
              collection(db, 'users'),
              where('email', '==', user.email)
            );
            const usersSnapshot = await getDocs(usersQuery);
            
            if (!usersSnapshot.empty) {
              const userData = usersSnapshot.docs[0].data();
              setUserName(userData.nombresCompletos || userData.nombres || user.displayName || 'Usuario');
              setUserEmail(userData.email || user.email || 'e@gmail.com');
            }
          } catch (error) {
            console.error('Error loading user data in sidebar:', error);
            // Mantener valores de Firebase Auth si hay error
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Determinar qué items mostrar según el rol
  const navItems = roleLoading ? [] : (isAdmin ? adminNavItems : assistantNavItems);

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-card sm:flex overflow-hidden">
        <div className="flex h-20 items-center border-b px-4 sm:px-6 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 font-semibold font-headline text-base sm:text-lg">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="">Mewing</span>
            </Link>
        </div>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <nav className="flex-1 px-4 py-4 text-sm font-medium flex flex-col justify-between overflow-y-auto">
            <div className="space-y-1">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                    (pathname === href || (href === '/services' && pathname.startsWith('/services'))) && "bg-muted text-primary font-semibold"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
            
            {/* Perfil de usuario en la parte inferior */}
            <div className="border-t mt-auto flex-shrink-0">
              <div className="flex items-center gap-3 py-4">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  {profileImageUrl ? (
                    <AvatarImage src={profileImageUrl} alt="User Avatar" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate leading-tight">{userName}</div>
                  <div className="text-xs text-muted-foreground truncate leading-tight mt-0.5">{userEmail}</div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </aside>
  );
}
