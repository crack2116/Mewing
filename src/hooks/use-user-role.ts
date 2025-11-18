'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
        // Obtener el rol del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role as UserRole;
          setUserRole(role || 'assistant'); // Default a 'assistant' si no hay rol
        } else {
          // Si no existe en users, verificar si es admin en roles_admin
          const adminDoc = await getDoc(doc(db, 'roles_admin', user.uid));
          if (adminDoc.exists()) {
            setUserRole('admin');
          } else {
            setUserRole('assistant'); // Default
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
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

