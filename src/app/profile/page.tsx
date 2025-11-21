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
  Edit,
  Lock,
  Settings,
  Loader2,
  X,
  User,
  Hash,
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
import { useState, useEffect } from 'react';
import { getProfileImageUrl } from '@/lib/profile-image';
import { auth, storage, db } from '@/app/management/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { onAuthStateChanged, updateProfile, updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  displayName?: string;
  email?: string;
  phone?: string;
  location?: string;
  registrationDate?: string;
  dni?: string;
  direccion?: string;
  edad?: number;
}

export default function ProfilePage() {
  const profileAvatar = PlaceHolderImages.find(
    (img) => img.id === 'profile-avatar'
  );
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: 'Usuario',
    email: 'e@gmail.com',
    phone: 'No especificado',
    location: 'Piura, Perú',
    registrationDate: '10/10/2025',
    dni: 'No especificado',
    direccion: 'No especificado',
    edad: undefined,
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Estados para modales
  const [uploadPhotoOpen, setUploadPhotoOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  
  // Estados para formularios
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Formulario de edición de perfil
  const [editForm, setEditForm] = useState({
    displayName: '',
    email: '',
    phone: '',
  });
  
  // Formulario de cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Preferencias
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailNotifications: true,
    language: 'es',
  });
  
  const { toast } = useToast();

  // Obtener usuario actual y datos del perfil
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setUserProfile({
          displayName: user.displayName || 'Usuario',
          email: user.email || 'e@gmail.com',
          phone: user.phoneNumber || 'No especificado',
          location: 'Piura, Perú',
          registrationDate: user.metadata.creationTime 
            ? new Date(user.metadata.creationTime).toLocaleDateString('es-PE')
            : '10/10/2025',
          dni: 'No especificado',
          direccion: 'No especificado',
          edad: undefined,
        });
        
        // Cargar datos adicionales de Firestore si existen
        // Buscar por email ya que los documentos tienen IDs automáticos
        try {
          if (user.email) {
            console.log('🔍 [Profile] Buscando usuario con email:', user.email);
            
            // Intentar buscar por email en la colección users
            let usersQuery = query(
              collection(db, 'users'),
              where('email', '==', user.email)
            );
            let usersSnapshot = await getDocs(usersQuery);
            
            // Si no se encuentra, buscar por username (algunos documentos usan username en lugar de email)
            if (usersSnapshot.empty) {
              console.log('🔍 [Profile] No encontrado por email, buscando por username');
              usersQuery = query(
                collection(db, 'users'),
                where('username', '==', user.email)
              );
              usersSnapshot = await getDocs(usersQuery);
            }
            
            // Si no se encuentra, intentar con email normalizado
            if (usersSnapshot.empty) {
              const normalizedEmail = user.email.trim().toLowerCase();
              console.log('🔍 [Profile] No encontrado, intentando con email normalizado:', normalizedEmail);
              usersQuery = query(
                collection(db, 'users'),
                where('email', '==', normalizedEmail)
              );
              usersSnapshot = await getDocs(usersQuery);
              
              if (usersSnapshot.empty) {
                usersQuery = query(
                  collection(db, 'users'),
                  where('username', '==', normalizedEmail)
                );
                usersSnapshot = await getDocs(usersQuery);
              }
            }
            
            // Si aún no se encuentra, buscar manualmente en todos los usuarios
            if (usersSnapshot.empty) {
              console.log('🔍 [Profile] No encontrado con query, buscando manualmente');
              const allUsersSnapshot = await getDocs(collection(db, 'users'));
              const userEmailNormalized = user.email.trim().toLowerCase();
              const matchingUser = allUsersSnapshot.docs.find(doc => {
                const data = doc.data();
                const docEmail = data.email || data.username;
                if (!docEmail) return false;
                return docEmail.trim().toLowerCase() === userEmailNormalized;
              });
              
              if (matchingUser) {
                console.log('✅ [Profile] Usuario encontrado mediante búsqueda manual');
                usersSnapshot = {
                  empty: false,
                  docs: [matchingUser]
                } as any;
              }
            }
            
            if (!usersSnapshot.empty) {
              const data = usersSnapshot.docs[0].data();
              console.log('✅ [Profile] Datos del usuario encontrado:', {
                email: data.email,
                nombres: data.nombres,
                apellidoPaterno: data.apellidoPaterno,
                apellidoMaterno: data.apellidoMaterno,
                nombresCompletos: data.nombresCompletos,
                fullData: data
              });
              
              // Construir nombre completo con nombres y apellidos
              let nombreCompleto = '';
              if (data.nombresCompletos) {
                nombreCompleto = data.nombresCompletos;
                console.log('✅ [Profile] Usando nombresCompletos:', nombreCompleto);
              } else if (data.nombres && (data.apellidoPaterno || data.apellidoMaterno)) {
                // Construir desde nombres y apellidos
                const apellidos = [data.apellidoPaterno, data.apellidoMaterno].filter(Boolean).join(' ');
                nombreCompleto = `${data.nombres} ${apellidos}`.trim();
                console.log('✅ [Profile] Construido desde nombres y apellidos:', nombreCompleto);
              } else if (data.nombres) {
                nombreCompleto = data.nombres;
                console.log('✅ [Profile] Usando solo nombres:', nombreCompleto);
              } else if (user.displayName) {
                nombreCompleto = user.displayName;
                console.log('✅ [Profile] Usando displayName de Firebase Auth:', nombreCompleto);
              } else {
                nombreCompleto = 'Usuario';
                console.log('⚠️ [Profile] No se encontraron nombres, usando default');
              }
              
              setUserProfile(prev => ({
                ...prev,
                displayName: nombreCompleto,
                email: data.email || data.username || user.email || 'e@gmail.com',
                phone: data.phone || data.contactPhone || user.phoneNumber || 'No especificado',
                dni: data.dni || 'No especificado',
                direccion: data.direccion || 'No especificado',
                edad: data.edad || undefined,
                location: data.direccion || prev.location || 'Piura, Perú',
              }));
            } else {
              console.log('⚠️ [Profile] Usuario no encontrado en Firestore, usando datos de Firebase Auth');
              // Si no se encuentra en users, usar datos de Firebase Auth
              setUserProfile(prev => ({
                ...prev,
                displayName: user.displayName || 'Usuario',
                email: user.email || 'e@gmail.com',
                phone: user.phoneNumber || 'No especificado',
              }));
            }
          } else {
            // Si no hay email, usar datos de Firebase Auth
            setUserProfile(prev => ({
              ...prev,
              displayName: user.displayName || 'Usuario',
              email: 'e@gmail.com',
              phone: user.phoneNumber || 'No especificado',
            }));
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // En caso de error, usar datos de Firebase Auth
          setUserProfile(prev => ({
            ...prev,
            displayName: user.displayName || 'Usuario',
            email: user.email || 'e@gmail.com',
            phone: user.phoneNumber || 'No especificado',
          }));
        }
        
        // Cargar imagen de perfil
        loadProfileImage();
      }
    });

    return () => unsubscribe();
  }, []);

  // Cargar imagen de perfil
  const loadProfileImage = async () => {
    try {
      const url = await getProfileImageUrl();
      if (url) {
        setProfileImageUrl(url);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    } finally {
      setLoadingImage(false);
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de imagen",
          variant: "destructive",
        });
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen debe ser menor a 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Subir foto de perfil
  const handleUploadPhoto = async () => {
    if (!selectedFile || !currentUser) return;
    
    setUploading(true);
    try {
      // Eliminar foto anterior si existe
      try {
        const oldProfileRef = ref(storage, `profiles/${currentUser.uid}.jpg`);
        await deleteObject(oldProfileRef);
      } catch (error) {
        // Ignorar error si no existe la foto anterior
        console.log('No previous photo to delete');
      }
      
      // Subir nueva foto
      const profileRef = ref(storage, `profiles/${currentUser.uid}.jpg`);
      await uploadBytes(profileRef, selectedFile);
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(profileRef);
      setProfileImageUrl(downloadURL);
      
      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada exitosamente.",
      });
      
      setUploadPhotoOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: `No se pudo subir la foto: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Guardar cambios de perfil
  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setSavingProfile(true);
    try {
      // Actualizar displayName en Firebase Auth
      if (editForm.displayName && editForm.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: editForm.displayName,
        });
      }
      
      // Actualizar email si cambió
      if (editForm.email && editForm.email !== currentUser.email) {
        await updateEmail(currentUser, editForm.email);
      }
      
      // Guardar datos adicionales en Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updateData: any = {};
      
      if (editForm.displayName) {
        updateData.nombresCompletos = editForm.displayName;
        updateData.nombres = editForm.displayName.split(' ')[0] || editForm.displayName;
      }
      
      if (editForm.email) {
        updateData.email = editForm.email;
        updateData.username = editForm.email;
      }
      
      if (editForm.phone) {
        updateData.phone = editForm.phone;
        updateData.contactPhone = editForm.phone;
      }
      
      if (Object.keys(updateData).length > 0) {
        await updateDoc(userDocRef, updateData);
      }
      
      // Actualizar estado local
      setUserProfile(prev => ({
        ...prev,
        displayName: editForm.displayName || prev.displayName,
        email: editForm.email || prev.email,
        phone: editForm.phone || prev.phone,
      }));
      
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado exitosamente.",
      });
      
      setEditProfileOpen(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      let errorMessage = 'No se pudo actualizar el perfil';
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por seguridad, necesitas iniciar sesión nuevamente para cambiar tu email.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo electrónico ya está en uso.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido.';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (!currentUser) return;
    
    // Validaciones
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }
    
    setChangingPassword(true);
    try {
      // Reautenticar usuario
      const credential = EmailAuthProvider.credential(
        currentUser.email!,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      
      // Actualizar contraseña
      await updatePassword(currentUser, passwordForm.newPassword);
      
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente.",
      });
      
      setChangePasswordOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      let errorMessage = 'No se pudo cambiar la contraseña';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'La contraseña actual es incorrecta.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La nueva contraseña es muy débil.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por seguridad, necesitas iniciar sesión nuevamente.';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Guardar preferencias
  const handleSavePreferences = async () => {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        preferences: preferences,
      });
      
      toast({
        title: "Preferencias guardadas",
        description: "Tus preferencias han sido guardadas exitosamente.",
      });
      
      setPreferencesOpen(false);
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las preferencias",
        variant: "destructive",
      });
    }
  };

  // Abrir modal de edición
  const handleEditClick = () => {
    setEditForm({
      displayName: userProfile.displayName || '',
      email: userProfile.email || '',
      phone: userProfile.phone || '',
    });
    setEditProfileOpen(true);
  };

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline">Información Personal</CardTitle>
                <CardDescription>Datos de tu cuenta de usuario.</CardDescription>
              </div>
              <Button variant="outline" onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Perfil
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                {profileImageUrl ? (
                  <AvatarImage
                    src={profileImageUrl}
                    alt="User Avatar"
                  />
                ) : profileAvatar && !loadingImage ? (
                  <AvatarImage
                    src={profileAvatar.imageUrl}
                    alt="User Avatar"
                    data-ai-hint={profileAvatar.imageHint}
                  />
                ) : null}
                <AvatarFallback>{(userProfile.displayName || 'U').charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold font-headline">{userProfile.displayName}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <Dialog open={uploadPhotoOpen} onOpenChange={setUploadPhotoOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Cambiar Foto
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Subir nueva foto</DialogTitle>
                        <DialogDescription>
                          Selecciona una imagen para tu perfil (máx. 5MB)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {previewUrl && (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setPreviewUrl(null);
                                setSelectedFile(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="photo-upload">Seleccionar archivo</Label>
                          <Input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setUploadPhotoOpen(false);
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          disabled={uploading}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleUploadPhoto}
                          disabled={!selectedFile || uploading}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Subir Foto
                            </>
                          )}
                        </Button>
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
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userProfile.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Hash className="h-6 w-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">DNI</p>
                  <p className="font-medium">{userProfile.dni}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{userProfile.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <User className="h-6 w-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Edad</p>
                  <p className="font-medium">{userProfile.edad ? `${userProfile.edad} años` : 'No especificado'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium">{userProfile.direccion}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Calendar className="h-6 w-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Fecha de Registro
                  </p>
                  <p className="font-medium">{userProfile.registrationDate}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <Shield className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold">Privacidad y Seguridad</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Tu cuenta está protegida. Puedes cambiar tu contraseña en
                  cualquier momento.
                </p>
                <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Lock className="mr-2 h-4 w-4" />
                      Cambiar Contraseña
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar Contraseña</DialogTitle>
                      <DialogDescription>
                        Ingresa tu contraseña actual y la nueva contraseña.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Contraseña Actual</Label>
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="••••••••"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          disabled={changingPassword}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="••••••••"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          disabled={changingPassword}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••••"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          disabled={changingPassword}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setChangePasswordOpen(false);
                          setPasswordForm({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                        disabled={changingPassword}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleChangePassword}
                        disabled={changingPassword}
                      >
                        {changingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cambiando...
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Cambiar Contraseña
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Edición de Perfil */}
        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
              <DialogDescription>
                Actualiza tu información personal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Nombre Completo</Label>
                <Input
                  id="display-name"
                  placeholder="Ej. Juan Pérez"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  disabled={savingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@email.com"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  disabled={savingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ej. +51 999 999 999"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  disabled={savingProfile}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditProfileOpen(false);
                  setEditForm({
                    displayName: '',
                    email: '',
                    phone: '',
                  });
                }}
                disabled={savingProfile}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Card de Configuración */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline">Configuración</CardTitle>
                <CardDescription>Preferencias de tu cuenta.</CardDescription>
              </div>
              <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Preferencias</DialogTitle>
                    <DialogDescription>
                      Configura tus preferencias de cuenta.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibir notificaciones en la aplicación
                        </p>
                      </div>
                      <Button
                        variant={preferences.notifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
                      >
                        {preferences.notifications ? "Activo" : "Inactivo"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones por Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibir notificaciones por correo electrónico
                        </p>
                      </div>
                      <Button
                        variant={preferences.emailNotifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
                      >
                        {preferences.emailNotifications ? "Activo" : "Inactivo"}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma</Label>
                      <select
                        id="language"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setPreferencesOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSavePreferences}>
                      <Settings className="mr-2 h-4 w-4" />
                      Guardar Preferencias
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notificaciones</span>
                <Badge variant={preferences.notifications ? "default" : "secondary"}>
                  {preferences.notifications ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notificaciones por Email</span>
                <Badge variant={preferences.emailNotifications ? "default" : "secondary"}>
                  {preferences.emailNotifications ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Idioma</span>
                <Badge variant="secondary">
                  {preferences.language === 'es' ? 'Español' : 'English'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
