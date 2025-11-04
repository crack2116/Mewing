// Este archivo inicializa Genkit solo si hay API key configurada
// Si no hay API key, exporta un objeto dummy que no causa errores

import {genkit} from 'genkit';

// Verificar si hay API key ANTES de intentar importar googleAI
const hasApiKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

// Crear objeto dummy que no requiere API key
const createDummyAI = () => ({
  generate: async (request: any) => {
    throw new Error('Genkit no está configurado. Por favor, configura GEMINI_API_KEY o GOOGLE_API_KEY en las variables de entorno.');
  },
  defineFlow: (config: any, handler: any) => {
    return async (input: any) => {
      throw new Error('Genkit no está configurado. Por favor, configura GEMINI_API_KEY o GOOGLE_API_KEY en las variables de entorno.');
    };
  },
});

// Intentar inicializar Genkit solo si hay API key
let aiInstance: any;

if (!hasApiKey) {
  // Si no hay API key, usar objeto dummy inmediatamente
  console.warn('⚠️ Genkit no está configurado. El asistente virtual no estará disponible.');
  console.warn('💡 Para habilitarlo, agrega GEMINI_API_KEY o GOOGLE_API_KEY en .env.local');
  aiInstance = createDummyAI();
} else {
  // Si hay API key, intentar inicializar Genkit con importación dinámica
  try {
    // Importar dinámicamente usando require para evitar errores en tiempo de evaluación del módulo
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const googleAIModule = require('@genkit-ai/google-genai');
    const { googleAI } = googleAIModule;
    
    // Intentar llamar a googleAI() - esto puede fallar si no hay API key válida
    let googleAIPlugin;
    try {
      googleAIPlugin = googleAI();
    } catch (pluginError: any) {
      throw new Error(`Error al inicializar plugin de Google AI: ${pluginError?.message || pluginError}`);
    }
    
    // Intentar inicializar con la API key
    aiInstance = genkit({
      plugins: [googleAIPlugin],
      model: 'googleai/gemini-2.5-flash',
    });
    console.log('✅ Genkit inicializado correctamente');
  } catch (error: any) {
    // Si falla (por ejemplo, API key inválida o error de inicialización), usar objeto dummy
    console.warn('⚠️ Error al inicializar Genkit:', error?.message || error);
    console.warn('💡 Usando modo dummy. Verifica que GEMINI_API_KEY o GOOGLE_API_KEY sean válidos');
    aiInstance = createDummyAI();
  }
}

export const ai = aiInstance;
