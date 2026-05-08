// ============================================================
// NomadIQ – Core Type Definitions
// ============================================================

/** Mascot visual states */
export type MascotState = 'idle' | 'thinking' | 'alert' | 'error' | 'success';

/** Supported transport modes */
export type TransportMode = 'walking' | 'public-transit' | 'two-wheeler' | 'car' | 'bicycle';

/** Energy levels for activities */
export type EnergyLevel = 'Low' | 'Medium' | 'High';

/** User pace preference */
export type PacePreference = 'relaxed' | 'moderate' | 'intense';

/** Alert types for disruptions */
export type AlertType = 'weather' | 'traffic' | 'closure' | 'safety';

/** Alert status */
export type AlertStatus = 'pending' | 'resolved' | 'dismissed';

/** Budget health indicator */
export type BudgetStatus = 'Healthy' | 'Warning' | 'Over';

// ---- User & Preferences ----

export interface UserPreferences {
  transport: TransportMode;
  diet: string[];
  pace: PacePreference;
  accessibility: boolean;
  budgetPerDay: number;
  interests: string[];
}

export interface NomadUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  preferences: UserPreferences;
  createdAt: string;
}

// ---- Itinerary & Trip ----

export interface LocationData {
  lat: number;
  lng: number;
  placeId: string;
  address?: string;
}

export interface Activity {
  id: string;
  time: string;
  endTime?: string;
  activity: string;
  description?: string;
  energyRequirement: EnergyLevel;
  energyCost: number; // 0-30 scale
  locationData: LocationData;
  category: string;
  estimatedCost?: number;
  imageUrl?: string;
  accessibilityScore?: number;
}

export interface TransportSegment {
  from: string;
  to: string;
  mode: TransportMode;
  duration: number; // minutes
  distance: number; // km
  optimizationReason: string;
}

export interface DailyItinerary {
  day: number;
  date: string;
  theme?: string;
  activities: Activity[];
  transportation: TransportSegment[];
  totalEnergyCost: number;
  totalEstimatedCost: number;
}

export interface TripBudget {
  limit: number;
  currentSpend: number;
  currency: string;
}

export interface Trip {
  id: string;
  ownerId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  active: boolean;
  itinerary: DailyItinerary[];
  fatigueMeter: number; // 0-100, current energy level
  budget: TripBudget;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

// ---- Alerts & Adaptations ----

export interface LiveAdaptation {
  id: string;
  reason: AlertType;
  changeLog: string;
  originalActivity: string;
  newActivity: string;
  timestamp: string;
}

export interface TripAlert {
  id: string;
  tripId: string;
  type: AlertType;
  status: AlertStatus;
  message: string;
  adaptation?: LiveAdaptation;
  createdAt: string;
}

// ---- API Request/Response ----

export interface GenerateItineraryRequest {
  destination: string;
  startDate: string;
  endDate: string;
  preferences: UserPreferences;
  prompt?: string;
  imageBase64?: string;
}

export interface GenerateItineraryResponse {
  tripSummary: {
    fatigueScore: number;
    budgetStatus: BudgetStatus;
    totalActivities: number;
    destination: string;
  };
  dailyItinerary: DailyItinerary[];
  transportationPlan: TransportSegment[];
  liveAdaptations: LiveAdaptation[];
}

export interface AdaptItineraryRequest {
  tripId: string;
  currentDay: number;
  currentLocation: LocationData;
  disruption: {
    type: AlertType;
    severity: number;
    details: string;
  };
}

// ---- UI State ----

export interface PlannerFormState {
  destination: string;
  startDate: string;
  endDate: string;
  prompt: string;
  uploadedImage: File | null;
  imagePreview: string | null;
}
