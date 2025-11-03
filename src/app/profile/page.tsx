import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Upload, Eye, Mail, Phone, MapPin, Calendar, Shield, User, Lock, Settings } from "lucide-react";

export default function ProfilePage() {
    const profileAvatar = PlaceHolderImages.find(img => img.id === 'profile-avatar');
  
    const quickActions = [
        { icon: User, title: 'Editar Perfil', description: 'Actualizar información' },
        { icon: Lock, title: 'Cambiar Contraseña', description: 'Actualizar seguridad' },
        { icon: Settings, title: 'Configuración', description: 'Preferencias' },
    ];

    const statistics = [
        { title: 'Servicios Gestionados', value: 0 },
        { title: 'Clientes Activos', value: 0 },
        { title: 'Vehículos Activos', value: 0 },
    ];

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">Mi Perfil</h1>
            <p className="text-muted-foreground">Información de tu cuenta y configuración.</p>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="font-headline">Información Personal</CardTitle>
                    <CardDescription>Datos de tu cuenta de usuario.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24">
                           {profileAvatar && <AvatarImage src={profileAvatar.imageUrl} alt="User Avatar" data-ai-hint={profileAvatar.imageHint} />}
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold font-headline">Usuario</h2>
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                <Button variant="outline">
                                    <Upload className="mr-2" />
                                    Cambiar Foto
                                </Button>
                                <Badge variant="secondary"><Eye className="mr-2 h-3 w-3"/>Visualizador</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                            <Mail className="h-6 w-6 text-muted-foreground mt-1" />
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">e@gmail.com</p>
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
                                <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                                <p className="font-medium">10/10/2025</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                        <Shield className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold">Privacidad y Seguridad</h3>
                            <p className="text-sm text-muted-foreground mt-1">Tu cuenta está protegida con autenticación de Firebase. Puedes cambiar tu contraseña en cualquier momento.</p>
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
                <CardContent className="space-y-4">
                    {quickActions.map((action) => (
                         <div key={action.title} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">{action.title}</p>
                                    <p className="text-sm text-muted-foreground">{action.description}</p>
                                </div>
                            </div>
                         </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {statistics.map((stat) => (
                        <div key={stat.title} className="flex items-center justify-between">
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
