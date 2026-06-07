// Musafir – Fatigue Logic Engine
import type { Activity, DailyItinerary, EnergyLevel } from './types';

const ENERGY_COSTS: Record<EnergyLevel, number> = { Low: 8, Medium: 18, High: 28 };
const MAX_DAILY_ENERGY = 100;
const FATIGUE_THRESHOLD = 70;
const REST_ACTIVITY: Omit<Activity, 'id' | 'time' | 'endTime' | 'locationData'> = {
  activity: '☕ Rest & Recharge',
  description: 'Take a break – grab coffee, sit in a park, or just breathe.',
  energyRequirement: 'Low',
  energyCost: -15, // Restores energy
  category: 'rest',
  estimatedCost: 5,
};

/** Calculate cumulative energy cost for a list of activities */
export function calculateDailyEnergy(activities: Activity[]): number {
  return activities.reduce((sum, a) => sum + a.energyCost, 0);
}

/** Get the user's current battery level (inverted: 100 = fully rested) */
export function getBatteryLevel(activities: Activity[]): number {
  const spent = calculateDailyEnergy(activities);
  return Math.max(0, Math.min(100, MAX_DAILY_ENERGY - spent));
}

/** Get battery color based on level */
export function getBatteryColor(level: number): string {
  if (level > 60) return '#22d3ee'; // neon cyan
  if (level > 30) return '#f59e0b'; // neon amber
  return '#ef4444'; // neon red
}

/** Get battery status label */
export function getBatteryStatus(level: number): string {
  if (level > 70) return 'Energized';
  if (level > 40) return 'Moderate';
  if (level > 20) return 'Tired';
  return 'Exhausted';
}

/** Check if a rest break should be injected after this activity index */
export function shouldInjectRest(activities: Activity[], afterIndex: number): boolean {
  const spent = activities.slice(0, afterIndex + 1).reduce((s, a) => s + a.energyCost, 0);
  return spent >= FATIGUE_THRESHOLD;
}

/** Create a rest activity at a given time near a location */
export function createRestActivity(time: string, nearLat: number, nearLng: number): Activity {
  return {
    ...REST_ACTIVITY,
    id: `rest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    time,
    endTime: incrementTime(time, 30),
    locationData: { lat: nearLat, lng: nearLng, placeId: '', address: 'Nearby café or park' },
  };
}

/** Optimize a day's schedule by injecting rest periods where needed */
export function optimizeDayForFatigue(day: DailyItinerary): DailyItinerary {
  const optimized: Activity[] = [];
  let cumulativeEnergy = 0;
  let restInjected = false;

  for (let i = 0; i < day.activities.length; i++) {
    const act = day.activities[i];
    cumulativeEnergy += act.energyCost;
    optimized.push(act);

    if (cumulativeEnergy >= FATIGUE_THRESHOLD && !restInjected) {
      const restTime = act.endTime || incrementTime(act.time, 60);
      const rest = createRestActivity(restTime, act.locationData.lat, act.locationData.lng);
      optimized.push(rest);
      cumulativeEnergy += rest.energyCost; // Negative, reduces fatigue
      restInjected = true;
    }
  }

  return {
    ...day,
    activities: optimized,
    totalEnergyCost: optimized.reduce((s, a) => s + a.energyCost, 0),
  };
}

/** Suggest a low-energy alternative swap */
export function suggestLowEnergyAlternative(activity: Activity): Partial<Activity> {
  const alternatives: Record<string, string> = {
    'hiking': 'scenic viewpoint visit',
    'museum': 'café culture walk',
    'adventure': 'local market browsing',
    'sports': 'garden stroll',
    'nightlife': 'sunset watching',
  };
  const cat = activity.category.toLowerCase();
  const alt = Object.entries(alternatives).find(([k]) => cat.includes(k));
  return {
    activity: alt ? `🌿 ${alt[1].charAt(0).toUpperCase() + alt[1].slice(1)}` : '🌿 Relaxed Alternative',
    energyRequirement: 'Low',
    energyCost: ENERGY_COSTS.Low,
    category: 'relaxed-alternative',
  };
}

/** Increment a time string by N minutes */
function incrementTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

/** Get default energy cost for an energy level */
export function getDefaultEnergyCost(level: EnergyLevel): number {
  return ENERGY_COSTS[level];
}
