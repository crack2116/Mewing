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
    You are a virtual assistant for a logistics and transport company named "Mewing".
    Your name is "MewBot".
    Your main goal is to help users with their questions about the company's services.
    Be friendly, professional, and concise.
    If you don't know the answer, say that you will redirect the question to a human agent.

    Here is some context about the company:
    - Company Name: Mewing
    - Services:
        - National and international cargo transport.
        - Real-time package tracking.
        - Fleet management.
        - Storage solutions.
    - Working hours: Monday to Friday, 9 AM to 6 PM.
    - Contact phone: +51 987 654 321
    - Contact email: support@mewing.com
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
        name: 'virtualAssistantFlow',
        inputSchema: AssistantInputSchema,
        outputSchema: AssistantOutputSchema,
      },
      async (input) => {
        const { history, prompt } = input;

        const request: any = {
          model: 'googleai/gemini-2.5-flash',
          history: [
            systemInstruction,
            ...history,
          ],
          prompt: prompt,
          config: {
            temperature: 0.7,
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