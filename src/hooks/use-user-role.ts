'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/app/management/firebase';

export type UserRole = 'admin' | 'assistant' | 'viewer' | null;

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 [useUserRole] Verificando rol para usuario:', {
          uid: user.uid,
          email: user.email
        });

        // PRIMERO: Verificar si es admin en roles_admin usando user.uid
        const adminDoc = await getDoc(doc(db, 'roles_admin', user.uid));
        console.log('🔍 [useUserRole] Verificación en roles_admin:', {
          exists: adminDoc.exists(),
          uid: user.uid
        });
        
        if (adminDoc.exists()) {
          // Usuario es admin (está en roles_admin)
          console.log('✅ [useUserRole] Usuario es ADMIN (encontrado en roles_admin)');
          setUserRole('admin');
        } else {
          // SEGUNDO: Si no es admin en roles_admin, buscar en users por email
          // Los documentos en users tienen IDs automáticos, no user.uid
          // Por eso buscamos por email
          if (user.email) {
            // Intentar primero con el email exacto
            let usersQuery = query(
              collection(db, 'users'),
              where('email', '==', user.email)
            );
            let usersSnapshot = await getDocs(usersQuery);
            
            // Si no se encuentra, intentar con email normalizado (trim y lowercase)
            if (usersSnapshot.empty) {
              const normalizedEmail = user.email.trim().toLowerCase();
              console.log('🔍 [useUserRole] No encontrado con email original, intentando con email normalizado:', normalizedEmail);
              usersQuery = query(
                collection(db, 'users'),
                where('email', '==', normalizedEmail)
              );
              usersSnapshot = await getDocs(usersQuery);
            }
            
            // Si aún no se encuentra, obtener todos los usuarios y buscar manualmente
            // (por si hay diferencias en espacios o formato)
            if (usersSnapshot.empty) {
              console.log('🔍 [useUserRole] No encontrado con query, obteniendo todos los usuarios para búsqueda manual');
              const allUsersSnapshot = await getDocs(collection(db, 'users'));
              
              // Log de todos los usuarios en la base de datos para debugging
              const allUsers = allUsersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  email: data.email,
                  emailNormalized: data.email ? data.email.trim().toLowerCase() : null,
                  role: data.role,
                  nombres: data.nombresCompletos || data.nombres || data.displayName
                };
              });
              
              console.log('📋 [useUserRole] Todos los usuarios en Firestore:', {
                total: allUsersSnapshot.docs.length,
                usuarios: allUsers,
                emails: allUsers.map(u => u.email),
                emailsNormalizados: allUsers.map(u => u.emailNormalized)
              });
              
              console.log('🔍 [useUserRole] Email buscado (normalizado):', user.email?.trim().toLowerCase());
              
              const userEmailNormalized = user.email?.trim().toLowerCase() || '';
              console.log('🔍 [useUserRole] Buscando coincidencia con email normalizado:', userEmailNormalized);
              
              const matchingUser = allUsersSnapshot.docs.find(doc => {
                const docData = doc.data();
                const docEmail = docData.email;
                if (!docEmail) {
                  console.log('⚠️ [useUserRole] Documento sin email:', doc.id);
                  return false;
                }
                
                const docEmailNormalized = docEmail.trim().toLowerCase();
                const matches = docEmailNormalized === userEmailNormalized;
                
                if (matches) {
                  console.log('✅ [useUserRole] Coincidencia encontrada:', {
                    docId: doc.id,
                    emailEnFirestore: docEmail,
                    emailEnFirestoreNormalizado: docEmailNormalized,
                    emailDelUsuario: user.email,
                    emailDelUsuarioNormalizado: userEmailNormalized,
                    role: docData.role
                  });
                } else {
                  // Log de comparación para debugging
                  if (docEmailNormalized.includes(userEmailNormalized) || userEmailNormalized.includes(docEmailNormalized)) {
                    console.log('🔍 [useUserRole] Email similar encontrado (pero no coincide exactamente):', {
                      emailEnFirestore: docEmail,
                      emailBuscado: user.email
                    });
                  }
                }
                return matches;
              });
              
              if (matchingUser) {
                console.log('✅ [useUserRole] Usuario encontrado mediante búsqueda manual');
                usersSnapshot = {
                  empty: false,
                  docs: [matchingUser]
                } as any;
              } else {
                console.log('❌ [useUserRole] No se encontró coincidencia. Email buscado:', user.email);
              }
            }
            
            console.log('🔍 [useUserRole] Resultados de búsqueda en users:', {
              found: !usersSnapshot.empty,
              count: usersSnapshot.docs.length,
              emails: usersSnapshot.docs.map(doc => doc.data().email)
            });
            
            if (!usersSnapshot.empty) {
              // Encontramos el usuario en users
              const userData = usersSnapshot.docs[0].data();
              const role = userData.role as UserRole;
              
              console.log('🔍 [useUserRole] Datos del usuario encontrado:', {
                email: userData.email,
                role: role,
                fullData: userData
              });
              
              // Si el rol es 'admin' o 'administrador', tratarlo como admin
              // (aunque no esté en roles_admin, si tiene role: 'admin' o 'administrador' en users, es admin)
              const normalizedRole = typeof role === 'string' ? role.toLowerCase().trim() : '';
              
              if (normalizedRole === 'admin' || normalizedRole === 'administrador') {
                console.log('✅ [useUserRole] Usuario es ADMIN (encontrado en users con role:', role, ')');
                setUserRole('admin');
              } else if (normalizedRole === 'assistant' || normalizedRole === 'asistente' || normalizedRole === 'viewer') {
                console.log(`✅ [useUserRole] Usuario es ${role.toUpperCase()} (encontrado en users)`);
                // Mapear 'asistente' a 'assistant' para consistencia
                setUserRole(normalizedRole === 'asistente' ? 'assistant' : (normalizedRole as UserRole));
              } else {
                // Si el rol en users no es válido o no está definido, default a assistant
                console.log('⚠️ [useUserRole] Rol no válido o no definido, default a assistant. Rol encontrado:', role);
                setUserRole('assistant');
              }
            } else {
              // Si no existe en ninguna colección, verificar si hay algún admin en roles_admin
              // y mostrar información de depuración
              console.log('⚠️ [useUserRole] Usuario no encontrado en users');
              console.log('📊 [useUserRole] Información del usuario autenticado:', {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified
              });
              
              // Verificar todos los admins en roles_admin para debugging
              // Nota: Esto puede fallar por permisos, pero intentamos de todas formas
              try {
                const allAdminsSnapshot = await getDocs(collection(db, 'roles_admin'));
                console.log('👑 [useUserRole] Todos los admins en roles_admin:', {
                  total: allAdminsSnapshot.docs.length,
                  admins: allAdminsSnapshot.docs.map(doc => ({
                    uid: doc.id,
                    data: doc.data()
                  }))
                });
              } catch (err: any) {
                console.log('⚠️ [useUserRole] No se pudo obtener lista de admins (esto es normal si no tienes permisos):', err?.code || err?.message);
                // Intentar verificar solo el usuario actual
                try {
                  const currentAdminDoc = await getDoc(doc(db, 'roles_admin', user.uid));
                  if (currentAdminDoc.exists()) {
                    console.log('✅ [useUserRole] Usuario encontrado en roles_admin (verificación individual)');
                    setUserRole('admin');
                    setLoading(false);
                    return;
                  }
                } catch (individualErr) {
                  console.log('⚠️ [useUserRole] No se pudo verificar roles_admin individual:', individualErr);
                }
              }
              
              console.log('⚠️ [useUserRole] Default a assistant (usuario no encontrado en Firestore)');
              setUserRole('assistant');
            }
          } else {
            // Si no hay email, default a assistant
            console.log('⚠️ [useUserRole] Usuario no tiene email, default a assistant');
            setUserRole('assistant');
          }
        }
      } catch (error) {
        console.error('❌ [useUserRole] Error fetching user role:', error);
        setUserRole('assistant'); // Default en caso de error
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = userRole === 'admin';
  const isAssistant = userRole === 'assistant';
  const isViewer = userRole === 'viewer';

  return {
    userRole,
    currentUser,
    loading,
    isAdmin,
    isAssistant,
    isViewer,
  };
}

