'use client';
// Musafir – Musafir AI Hook (manages mascot state + AI interactions)
import { useState, useCallback } from 'react';
import type { MascotState, GenerateItineraryRequest, GenerateItineraryResponse } from '@/lib/types';

interface MusafirAIState {
  mascotState: MascotState;
  message: string;
  isGenerating: boolean;
  result: GenerateItineraryResponse | null;
  error: string | null;
}

export function useMusafirAI() {
  const [state, setState] = useState<MusafirAIState>({
    mascotState: 'idle',
    message: "Hey! I'm Musafir. Where are we headed? ✈️",
    isGenerating: false,
    result: null,
    error: null,
  });

  const setMascotState = useCallback((mascotState: MascotState, message?: string) => {
    setState((prev) => ({ ...prev, mascotState, message: message || prev.message }));
  }, []);

  const generateTrip = useCallback(async (request: GenerateItineraryRequest) => {
    setState((prev) => ({
      ...prev,
      mascotState: 'thinking',
      message: `Planning your trip to ${request.destination}... 🗺️`,
      isGenerating: true,
      error: null,
    }));

    try {
      const res = await fetch('/api/v1/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate itinerary');
      }

      const result: GenerateItineraryResponse = await res.json();

      setState({
        mascotState: 'success',
        message: `Your ${result.tripSummary.destination} trip is ready! ${result.tripSummary.totalActivities} activities planned. 🎉`,
        isGenerating: false,
        result,
        error: null,
      });

      // Return to idle after a delay
      setTimeout(() => {
        setState((prev) => ({ ...prev, mascotState: 'idle' }));
      }, 5000);

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setState({
        mascotState: 'error',
        message: `Oops! ${message} 😅`,
        isGenerating: false,
        result: null,
        error: message,
      });

      setTimeout(() => {
        setState((prev) => ({ ...prev, mascotState: 'idle', message: "Let's try again! ✈️" }));
      }, 4000);

      throw err;
    }
  }, []);

  const adaptTrip = useCallback(async (tripId: string, disruption: { type: string; severity: number; details: string }, currentLocation: { lat: number; lng: number }) => {
    setState((prev) => ({
      ...prev,
      mascotState: 'alert',
      message: `⚠️ Disruption detected: ${disruption.details}. Adapting your plan...`,
    }));

    try {
      const res = await fetch('/api/v1/itinerary/adapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, disruption, currentLocation, currentDay: 1, currentDayItinerary: {} }),
      });

      if (!res.ok) throw new Error('Adaptation failed');
      const data = await res.json();

      setState((prev) => ({
        ...prev,
        mascotState: 'success',
        message: `✅ ${data.adaptation?.changeLog || 'Plan updated successfully!'}`,
      }));

      return data;
    } catch {
      setState((prev) => ({ ...prev, mascotState: 'error', message: '❌ Could not adapt the plan.' }));
    }
  }, []);

  return { ...state, setMascotState, generateTrip, adaptTrip };
}
