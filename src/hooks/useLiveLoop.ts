'use client';
// NomadIQ – Live Loop Hook (background disruption monitoring)
import { useState, useEffect, useCallback, useRef } from 'react';
import type { TripAlert, LocationData } from '@/lib/types';

interface LiveLoopState {
  isMonitoring: boolean;
  lastCheck: string | null;
  alerts: TripAlert[];
  currentDelay: number;
}

const POLL_INTERVAL = 20 * 60 * 1000; // 20 minutes

export function useLiveLoop(tripId: string | null, currentLocation: LocationData | null, nextDestination: LocationData | null) {
  const [state, setState] = useState<LiveLoopState>({
    isMonitoring: false,
    lastCheck: null,
    alerts: [],
    currentDelay: 0,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkDisruptions = useCallback(async () => {
    if (!currentLocation || !nextDestination) return;

    try {
      const params = new URLSearchParams({
        originLat: String(currentLocation.lat),
        originLng: String(currentLocation.lng),
        destLat: String(nextDestination.lat),
        destLng: String(nextDestination.lng),
      });

      const res = await fetch(`/api/v1/traffic/monitor?${params}`);
      if (!res.ok) return;
      const data = await res.json();

      setState((prev) => ({
        ...prev,
        lastCheck: new Date().toISOString(),
        currentDelay: data.delayMinutes || 0,
      }));

      if (data.hasSignificantDelay && tripId) {
        const alert: TripAlert = {
          id: `alert_${Date.now()}`,
          tripId,
          type: 'traffic',
          status: 'pending',
          message: `Traffic delay of ${data.delayMinutes} minutes detected on your route.`,
          createdAt: new Date().toISOString(),
        };
        setState((prev) => ({ ...prev, alerts: [...prev.alerts, alert] }));
      }
    } catch (err) {
      console.error('[LiveLoop] Check failed:', err);
    }
  }, [currentLocation, nextDestination, tripId]);

  const startMonitoring = useCallback(() => {
    if (intervalRef.current) return;
    setState((prev) => ({ ...prev, isMonitoring: true }));
    checkDisruptions(); // Immediate check
    intervalRef.current = setInterval(checkDisruptions, POLL_INTERVAL);
  }, [checkDisruptions]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState((prev) => ({ ...prev, isMonitoring: false }));
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.filter((a) => a.id !== alertId),
    }));
  }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return { ...state, startMonitoring, stopMonitoring, dismissAlert, checkDisruptions };
}
