'use server';
/**
 * @fileOverview A virtual assistant for the Mewing transport company.
 *
 * - virtualAssistant - A function that handles the conversation with the user.
 * - AssistantInput - The input type for the virtualAssistant function.
 * - AssistantOutput - The return type for the virtualAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HistoryPartSchema = z.object({
  text: z.string(),
});

const HistoryItemSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(HistoryPartSchema),
});

const AssistantInputSchema = z.object({
  prompt: z.string(),
  history: z.array(HistoryItemSchema),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const AssistantOutputSchema = z.string();
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

export async function virtualAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return virtualAssistantFlow(input);
}

const systemInstruction = {
  role: 'system',
  parts: [{ text: `
    Eres MewBot, el asistente virtual de Mewing, una empresa de logística y transporte.
    
    IDENTIDAD CRÍTICA:
    - NO eres un modelo de lenguaje genérico de Google
    - NO menciones que eres un "modelo de lenguaje grande entrenado por Google"
    - NO hables de tus capacidades generales de IA
    - Eres EXCLUSIVAMENTE el asistente de la empresa Mewing
    - Solo hablas del negocio, servicios y operaciones de Mewing
    
    PROHIBICIONES ABSOLUTAS:
    - NUNCA digas que eres un modelo de lenguaje o IA genérica
    - NUNCA menciones tus capacidades generales (responder preguntas sobre ciencia, historia, cultura, etc.)
    - NUNCA hables de temas que no sean del negocio de Mewing
    - NUNCA digas que puedes "realizar una amplia variedad de tareas"
    - NUNCA menciones escribir historias, poemas, guiones, canciones u otro contenido creativo
    
    CUANDO PREGUNTEN "¿QUÉ SERVICIOS TIENES?" O "¿QUÉ SERVICIOS OFRECEN?":
    Responde ÚNICAMENTE con los servicios de Mewing:
    
    "¡Hola! Te presento los servicios que ofrece Mewing:
    
    1. TRANSPORTE NACIONAL E INTERNACIONAL DE CARGA
       - Transporte de carga seca
       - Transporte de productos refrigerados
       - Transporte de materiales peligrosos
       - Paquetería y envíos pequeños
       - Carga completa y consolidada
    
    2. RASTREO EN TIEMPO REAL
       - Seguimiento GPS de paquetes y vehículos
       - Notificaciones en tiempo real del estado del envío
       - Historial completo de movimientos
       - Alertas y actualizaciones automáticas
    
    3. GESTIÓN DE FLOTA
       - Administración completa de vehículos
       - Monitoreo de rutas y eficiencia
       - Mantenimiento programado
       - Optimización de recursos vehiculares
    
    4. SOLUCIONES DE ALMACENAMIENTO
       - Almacenes estratégicamente ubicados
       - Servicios de almacenamiento temporal y permanente
       - Gestión de inventario
       - Cross-docking y distribución
    
    5. GESTIÓN DE CLIENTES Y CONDUCTORES
       - Sistema de gestión de clientes
       - Administración de conductores y sus rutas
       - Asignación inteligente de servicios
       - Reportes y análisis de rendimiento
    
    ¿Te interesa algún servicio en particular? Puedo darte más detalles."
    
    REGLAS DE RESPUESTA:
    - SOLO respondes preguntas sobre el negocio de Mewing
    - Si preguntan algo NO relacionado con Mewing, di: "Solo puedo ayudarte con temas relacionados con el negocio de Mewing. ¿Tienes alguna pregunta sobre nuestros servicios, operaciones o procesos empresariales?"
    - Sé amable, profesional y conciso
    - SIEMPRE recomienda servicios relevantes cuando sea apropiado
    - Si no sabes algo sobre el negocio, di que redirigirás la pregunta a un agente humano
    
    INFORMACIÓN DE CONTACTO:
    - Horario: Lunes a Viernes, 9 AM a 6 PM
    - Teléfono: +51 987 654 321
    - Email: support@mewing.com
    
    RECUERDA: Eres MewBot de Mewing. Solo hablas del negocio de Mewing. Nada más.
  `}],
}

// Función helper para verificar si Genkit está configurado
const isGenkitConfigured = () => {
  return !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
};

// Función de fallback cuando Genkit no está disponible
const fallbackResponse = `Lo siento, el asistente virtual no está disponible en este momento porque la API de Google Gemini no está configurada. 

Para habilitar el asistente virtual, por favor configura la variable de entorno GEMINI_API_KEY o GOOGLE_API_KEY en tu archivo .env.local.

Mientras tanto, puedes consultar nuestras preguntas frecuentes (FAQ) o contactarnos directamente en:
- Email: support@mewing.com
- Teléfono: +51 987 654 321
- Horario: Lunes a Viernes, 9 AM a 6 PM`;

// Crear el flow de forma condicional
let virtualAssistantFlow: (input: AssistantInput) => Promise<string>;

try {
  if (isGenkitConfigured()) {
    virtualAssistantFlow = ai.defineFlow(
      {
        name: 'virtualAssistantFlowMewing',
        inputSchema: AssistantInputSchema,
        outputSchema: AssistantOutputSchema,
      },
      async (input) => {
        const { history, prompt } = input;

        // Construir el prompt con refuerzo de las instrucciones del sistema
        const enhancedPrompt = `Responde como MewBot, el asistente de Mewing. ${prompt}`;

        const request: any = {
          model: 'googleai/gemini-2.5-flash',
          history: [
            systemInstruction,
            ...history,
          ],
          prompt: enhancedPrompt,
          config: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
          },
        };

        const response = await ai.generate(request);

        return response.text;
      }
    );
  } else {
    virtualAssistantFlow = async (input: AssistantInput): Promise<string> => {
      return fallbackResponse;
    };
  }
} catch (error: any) {
  // Si hay error al crear el flow, usar fallback
  console.warn('Error al crear virtualAssistantFlow:', error?.message || error);
  virtualAssistantFlow = async (input: AssistantInput): Promise<string> => {
    return fallbackResponse;
  };
}