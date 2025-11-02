"use client";

import { useState } from "react";
import { Sparkles, Bot, Zap, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getPrediction } from "@/app/actions";
import type { PredictServiceRequestStatusOutput } from "@/ai/flows/predict-service-request-status";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type PredictionCellProps = {
  requestId: string;
};

export function PredictionCell({ requestId }: PredictionCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictServiceRequestStatusOutput | null>(null);

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPrediction(requestId);
      setPrediction(result);
    } catch (e) {
      setError("An error occurred while fetching the prediction. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset state when opening
      setPrediction(null);
      setError(null);
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Sparkles className="h-4 w-4 mr-2 text-primary" />
          Predict
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
            <Bot className="h-6 w-6 text-primary" />
            AI Status Prediction
          </DialogTitle>
          <DialogDescription>
            Predict the outcome of request <span className="font-mono font-medium text-foreground">{requestId}</span> using historical data and current conditions.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
             <Alert variant="destructive">
                <Zap className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          ) : prediction ? (
            <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle className="font-bold font-headline">
                    Prediction Result
                  </AlertTitle>
                  <AlertDescription className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Predicted Status:</span>
                      <Badge>{prediction.predictedStatus}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="font-bold font-mono">{(prediction.confidenceLevel * 100).toFixed(0)}%</span>
                    </div>
                  </AlertDescription>
              </Alert>
              <div>
                <h4 className="font-semibold mb-2">Reasoning</h4>
                <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{prediction.reasoning}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Suggested Actions</h4>
                <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{prediction.suggestedActions}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10">
                <p>Click the button below to generate an AI-powered status prediction.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          {!prediction && !error && (
            <Button onClick={handlePredict} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Prediction
                </>
              )}
            </Button>
          )}
           {(prediction || error) && (
             <Button onClick={() => setIsOpen(false)} variant="outline" className="w-full">Close</Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
