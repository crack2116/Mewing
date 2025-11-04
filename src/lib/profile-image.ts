import { storage } from '@/app/management/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { auth } from '@/app/management/firebase';

/**
 * Obtiene la URL de la imagen de perfil desde Firebase Storage
 * @param userId - ID del usuario (opcional, si no se proporciona usa el usuario actual)
 * @returns Promise<string | null> - URL de la imagen o null si no se encuentra
 */
export async function getProfileImageUrl(userId?: string): Promise<string | null> {
  try {
    // Si no se proporciona userId, usar el usuario actual
    let targetUserId = userId;
    if (!targetUserId && auth.currentUser) {
      targetUserId = auth.currentUser.uid;
    }
    
    if (!targetUserId) {
      return null;
    }
    
    // Intentar obtener la imagen específica del usuario
    const profileRef = ref(storage, `profiles/${targetUserId}.jpg`);
    try {
      const url = await getDownloadURL(profileRef);
      return url;
    } catch (error: any) {
      // Si no existe .jpg, intentar con otros formatos
      const formats = ['png', 'jpeg', 'webp'];
      for (const format of formats) {
        try {
          const altRef = ref(storage, `profiles/${targetUserId}.${format}`);
          const url = await getDownloadURL(altRef);
          return url;
        } catch (e) {
          // Continuar con el siguiente formato
        }
      }
      
      // Si no se encuentra ninguna imagen, retornar null
      return null;
    }
  } catch (error) {
    console.error('Error al cargar imagen de perfil:', error);
    return null;
  }
}

