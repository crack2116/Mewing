'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/app/management/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Truck, Shield, Clock, Users, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Iniciar sesión
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente",
      });
      router.push('/');
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      let errorMessage = 'Error al autenticarse. Por favor, intenta de nuevo.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado. Verifica tu correo electrónico.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo electrónico ya está en uso.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido.';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 bg-[#0a0a0a]">
        <div className="max-w-md w-full mx-auto">
          {/* Logo and Branding - Top */}
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-headline text-white">Mewing Transport</h1>
              <p className="text-sm text-muted-foreground">Gestión Profesional</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-3 text-white">¡Bienvenido de vuelta!</h2>
            <p className="text-muted-foreground text-base">
              Accede a tu panel de control para gestionar tus servicios de transporte.
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 sm:p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/50 border-muted text-foreground h-12"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/50 border-muted text-foreground h-12"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </div>

          {/* Feature Icons */}
          <div className="flex items-center justify-center gap-12 mt-8">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Seguro</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Tiempo Real</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Colaborativo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Promotional Image */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=1800&q=80")',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-20 flex flex-col justify-end p-12 text-white">
          <h2 className="text-5xl font-bold mb-4">Transporte Profesional</h2>
          <p className="text-xl mb-8 opacity-90">
            Gestiona tu flota con tecnología avanzada y diseño elegante.
          </p>
          <div className="flex items-center gap-2 text-white/80 text-lg">
            <span>Descubre todas las funcionalidades</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

