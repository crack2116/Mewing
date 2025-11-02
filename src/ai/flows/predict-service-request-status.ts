'use server';

/**
 * @fileOverview Predicts the status of pending service requests using historical data and current conditions.
 *
 * - predictServiceRequestStatus - A function that predicts the status of a service request.
 * - PredictServiceRequestStatusInput - The input type for the predictServiceRequestStatus function.
 * - PredictServiceRequestStatusOutput - The return type for the predictServiceRequestStatus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictServiceRequestStatusInputSchema = z.object({
  requestId: z.string().describe('The ID of the service request.'),
  historicalData: z
    .string()
    .describe(
      'Historical data related to similar service requests, including their features and outcomes.'
    ),
  currentConditions: z
    .string()
    .describe(
      'Current conditions that may affect the service request, such as weather, traffic, or resource availability.'
    ),
});
export type PredictServiceRequestStatusInput = z.infer<
  typeof PredictServiceRequestStatusInputSchema
>;

const PredictServiceRequestStatusOutputSchema = z.object({
  predictedStatus: z
    .string()
    .describe(
      'The predicted status of the service request (e.g., pending, in progress, completed, delayed, canceled).'
    ),
  confidenceLevel: z
    .number()
    .describe(
      'The confidence level of the prediction, ranging from 0 to 1 (e.g., 0.95 for 95% confidence).'
    ),
  reasoning: z
    .string()
    .describe(
      'Explanation of why the model made this prediction, referencing specific historical data and current conditions.'
    ),
  suggestedActions: z
    .string()
    .describe(
      'Suggested actions to take based on the predicted status to ensure successful service delivery.'
    ),
});
export type PredictServiceRequestStatusOutput = z.infer<
  typeof PredictServiceRequestStatusOutputSchema
>;

export async function predictServiceRequestStatus(
  input: PredictServiceRequestStatusInput
): Promise<PredictServiceRequestStatusOutput> {
  return predictServiceRequestStatusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictServiceRequestStatusPrompt',
  input: {schema: PredictServiceRequestStatusInputSchema},
  output: {schema: PredictServiceRequestStatusOutputSchema},
  prompt: `You are an AI assistant specializing in predicting the status of service requests.

  Based on the historical data and current conditions provided, predict the likely status of the service request.

  Historical Data: {{{historicalData}}}
Current Conditions: {{{currentConditions}}}

  Consider all factors to determine the most probable status, provide a confidence level, explain your reasoning, and suggest actions to take based on the predicted status.
  Be specific with the reasoning, explaining how each piece of historical data and current condition affects the predicted status.
  Be brief, and limit the suggested actions to no more than two points.

  Ensure that your output adheres to the following JSON schema:
  ${JSON.stringify(PredictServiceRequestStatusOutputSchema.describe())}`,
});

const predictServiceRequestStatusFlow = ai.defineFlow(
  {
    name: 'predictServiceRequestStatusFlow',
    inputSchema: PredictServiceRequestStatusInputSchema,
    outputSchema: PredictServiceRequestStatusOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
