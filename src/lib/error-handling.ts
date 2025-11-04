/**
 * Utilidades para manejo de errores mejorado
 */

export interface AppError {
  code: string;
  message: string;
  details?: any;
  retryable?: boolean;
}

/**
 * Clasifica y formatea errores de Firebase
 */
export function formatFirebaseError(error: any): AppError {
  const errorCode = error?.code || 'unknown';
  const errorMessage = error?.message || 'Error desconocido';

  // Mapeo de códigos de error comunes
  const errorMap: Record<string, { message: string; retryable: boolean }> = {
    'permission-denied': {
      message: 'No tienes permisos para realizar esta acción. Verifica las reglas de Firestore.',
      retryable: false,
    },
    'unavailable': {
      message: 'El servicio no está disponible temporalmente. Por favor, intenta de nuevo.',
      retryable: true,
    },
    'deadline-exceeded': {
      message: 'La operación tardó demasiado. Por favor, intenta de nuevo.',
      retryable: true,
    },
    'resource-exhausted': {
      message: 'Se ha excedido el límite de recursos. Por favor, intenta más tarde.',
      retryable: true,
    },
    'unauthenticated': {
      message: 'Debes iniciar sesión para realizar esta acción.',
      retryable: false,
    },
    'not-found': {
      message: 'El recurso solicitado no fue encontrado.',
      retryable: false,
    },
    'already-exists': {
      message: 'Este recurso ya existe.',
      retryable: false,
    },
    'invalid-argument': {
      message: 'Los datos proporcionados son inválidos.',
      retryable: false,
    },
    'failed-precondition': {
      message: 'La operación no se puede completar en el estado actual.',
      retryable: false,
    },
    'aborted': {
      message: 'La operación fue cancelada.',
      retryable: true,
    },
    'out-of-range': {
      message: 'Los datos están fuera del rango permitido.',
      retryable: false,
    },
    'unimplemented': {
      message: 'Esta funcionalidad aún no está implementada.',
      retryable: false,
    },
    'internal': {
      message: 'Error interno del servidor. Por favor, intenta más tarde.',
      retryable: true,
    },
    'unknown': {
      message: 'Error desconocido. Por favor, intenta de nuevo.',
      retryable: true,
    },
  };

  const mappedError = errorMap[errorCode] || errorMap['unknown'];

  return {
    code: errorCode,
    message: mappedError.message,
    details: error,
    retryable: mappedError.retryable,
  };
}

/**
 * Maneja errores de red
 */
export function formatNetworkError(error: any): AppError {
  if (error?.message?.includes('fetch')) {
    return {
      code: 'network-error',
      message: 'Error de conexión. Por favor, verifica tu conexión a internet.',
      details: error,
      retryable: true,
    };
  }

  return formatFirebaseError(error);
}

/**
 * Intenta ejecutar una función con retry automático
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const formattedError = formatFirebaseError(error);

      if (!formattedError.retryable || attempt === maxRetries) {
        throw error;
      }

      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}

/**
 * Log de errores para debugging
 */
export function logError(context: string, error: any, additionalInfo?: any): void {
  const formattedError = formatFirebaseError(error);
  
  console.error(`[${context}] Error:`, {
    code: formattedError.code,
    message: formattedError.message,
    details: formattedError.details,
    retryable: formattedError.retryable,
    additionalInfo,
    timestamp: new Date().toISOString(),
  });

  // En producción, aquí podrías enviar el error a un servicio de logging
  // como Sentry, LogRocket, etc.
}

/**
 * Maneja errores de forma consistente y muestra toast
 */
export function handleError(
  error: any,
  context: string,
  defaultMessage: string = 'Ocurrió un error inesperado'
): AppError {
  const formattedError = formatNetworkError(error);
  
  logError(context, error);
  
  return formattedError;
}

