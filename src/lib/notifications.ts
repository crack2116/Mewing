'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '@/app/management/firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Timestamp;
  link?: string;
}

/**
 * Crea una nueva notificación en Firestore
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: Notification['type'] = 'info',
  link?: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: Timestamp.now(),
      link,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Marca una notificación como leída
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Marca todas las notificaciones como leídas
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(notificationsQuery);
    
    const promises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

/**
 * Obtiene las notificaciones no leídas de un usuario
 */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Notification));
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return [];
  }
}

/**
 * Hook para usar notificaciones en componentes
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      // Cargar notificaciones iniciales
      const loadNotifications = async () => {
        try {
          const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(50)
          );
          
          const snapshot = await getDocs(notificationsQuery);
          const notifs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Notification));
          
          setNotifications(notifs);
          setUnreadCount(notifs.filter(n => !n.read).length);
        } catch (error) {
          console.error('Error loading notifications:', error);
        } finally {
          setLoading(false);
        }
      };

      loadNotifications();

      // Escuchar cambios en tiempo real
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Notification));
        
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
        setLoading(false);
      }, (error) => {
        console.error('Error listening to notifications:', error);
        setLoading(false);
      });

      return () => {
        unsubscribeNotifications();
      };
    });

    return unsubscribe();
  }, []);

  const markAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!auth.currentUser) return;
    await markAllNotificationsAsRead(auth.currentUser.uid);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  };
}

/**
 * Utilidad para formatear fecha de notificación
 */
export function formatNotificationDate(date: Timestamp | Date): string {
  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
}

