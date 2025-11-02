"use server";

import { predictServiceRequestStatus } from "@/ai/flows/predict-service-request-status";
import type { PredictServiceRequestStatusOutput } from "@/ai/flows/predict-service-request-status";

export async function getPrediction(requestId: string): Promise<PredictServiceRequestStatusOutput> {
  // In a real application, this data would be fetched from a database
  // based on the requestId and other business logic.
  const mockHistoricalData = `
    - Request Type: Standard Maintenance. Average completion time: 2 days.
    - Client History: 3 previous requests, all completed on time.
    - Similar Requests (last 30 days): 15 requests, 12 completed on time, 3 delayed due to parts availability.
  `;
  const mockCurrentConditions = `
    - Technician Availability: High. Team A is fully available.
    - Parts Inventory: All necessary parts are in stock.
    - Weather Forecast: Clear skies for the next 3 days.
    - Current Workload: Moderate.
  `;

  try {
    const prediction = await predictServiceRequestStatus({
      requestId,
      historicalData: mockHistoricalData,
      currentConditions: mockCurrentConditions,
    });
    return prediction;
  } catch (error) {
    console.error("Error getting prediction:", error);
    throw new Error("Failed to get prediction from AI model.");
  }
}
