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
import { useState } from 'react';

export default function ProfilePage() {
  const profileAvatar = PlaceHolderImages.find(
    (img) => img.id === 'profile-avatar'
  );
  
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState('Usuario');
  const [userEmail, setUserEmail] = useState('e@gmail.com');

  return (
    <div className="grid gap-6 md:grid-cols-1">
      <div>
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
    </div>
  );
}
