'use client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Upload,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  User,
  Lock,
  Settings,
  Edit,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { overviewData, clients, activeVehicles } from '@/lib/data';
import { useState } from 'react';

export default function ProfilePage() {
  const profileAvatar = PlaceHolderImages.find(
    (img) => img.id === 'profile-avatar'
  );
  
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState('Usuario');
  const [userEmail, setUserEmail] = useState('e@gmail.com');

  const quickActions = [
    {
      icon: User,
      title: 'Editar Perfil',
      description: 'Actualizar información',
      action: () => setIsEditing(true),
      dialog: (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Edit className="mr-2 h-4 w-4" /> Editar Perfil
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
              <DialogDescription>
                Actualiza tu información personal.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsEditing(false)}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
    },
    {
      icon: Lock,
      title: 'Cambiar Contraseña',
      description: 'Actualizar seguridad',
      dialog: (
        <Dialog>
          <DialogTrigger asChild>
             <Button variant="ghost" size="sm" className="w-full justify-start">
                <Lock className="mr-2 h-4 w-4" /> Cambiar Contraseña
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña</DialogTitle>
              <DialogDescription>
                Asegura tu cuenta con una nueva contraseña.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="current-password"
                  className="text-right"
                >
                  Actual
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="new-password"
                  className="text-right"
                >
                  Nueva
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button>Actualizar Contraseña</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
    },
    { icon: Settings, title: 'Configuración', description: 'Preferencias' },
  ];

  const statistics = [
    { title: 'Servicios Gestionados', value: overviewData.completedServices },
    { title: 'Clientes Activos', value: clients.length },
    { title: 'Vehículos Activos', value: activeVehicles.length },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-semibold md:text-3xl font-headline">
          Mi Perfil
        </h1>
        <p className="text-muted-foreground">
          Información de tu cuenta y configuración.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-headline">Información Personal</CardTitle>
            <CardDescription>Datos de tu cuenta de usuario.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                {profileAvatar && (
                  <AvatarImage
                    src={profileAvatar.imageUrl}
                    alt="User Avatar"
                    data-ai-hint={profileAvatar.imageHint}
                  />
                )}
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold font-headline">{userName}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Cambiar Foto
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Subir nueva foto</DialogTitle>
                        </DialogHeader>
                        <Input type="file" />
                        <DialogFooter>
                            <Button>Subir</Button>
                        </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Badge variant="secondary">
                    <Eye className="mr-2 h-3 w-3" />
                    Visualizador
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">No especificado</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="font-medium">Piura, Perú</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Calendar className="h-6 w-6 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fecha de Registro
                  </p>
                  <p className="font-medium">10/10/2025</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <Shield className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Privacidad y Seguridad</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tu cuenta está protegida. Puedes cambiar tu contraseña en
                  cualquier momento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) =>
              action.dialog ? (
                <div key={action.title}>{action.dialog}</div>
              ) : (
                <Button key={action.title} variant="ghost" size="sm" className="w-full justify-start">
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.title}
                </Button>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statistics.map((stat) => (
              <div
                key={stat.title}
                className="flex items-center justify-between"
              >
                <p className="text-muted-foreground">{stat.title}</p>
                <p className="font-semibold">{stat.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
