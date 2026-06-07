// Musafir – Google Maps Helpers
import type { LocationData, TransportMode } from './types';

const MAPS_BASE = 'https://maps.googleapis.com/maps/api';

function getServerKey(): string {
  const key = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('Google Maps API key not configured');
  return key;
}

const TRANSPORT_MAP: Record<TransportMode, string> = {
  'walking': 'walking',
  'public-transit': 'transit',
  'two-wheeler': 'driving', // Google doesn't have motorcycle mode; we use driving
  'car': 'driving',
  'bicycle': 'bicycling',
};

export interface DirectionsResult {
  duration: number; // minutes
  distance: number; // km
  polyline: string;
  steps: Array<{ instruction: string; distance: string; duration: string }>;
}

export async function getDirections(
  origin: LocationData,
  destination: LocationData,
  mode: TransportMode
): Promise<DirectionsResult> {
  const key = getServerKey();
  const travelMode = TRANSPORT_MAP[mode];
  const url = `${MAPS_BASE}/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${travelMode}&key=${key}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions API error: ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as any;

  if (data.status !== 'OK' || !data.routes?.length) {
    return { duration: 0, distance: 0, polyline: '', steps: [] };
  }

  const route = data.routes[0];
  const leg = route.legs[0];

  return {
    duration: Math.round(leg.duration.value / 60),
    distance: Math.round((leg.distance.value / 1000) * 10) / 10,
    polyline: route.overview_polyline?.points || '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    steps: (leg.steps || []).slice(0, 10).map((s: any) => ({
      instruction: s.html_instructions?.replace(/<[^>]*>/g, '') || '',
      distance: s.distance?.text || '',
      duration: s.duration?.text || '',
    })),
  };
}

export interface DistanceMatrixResult {
  duration: number;
  distance: number;
  trafficDuration?: number;
}

export async function getDistanceMatrix(
  origins: LocationData[],
  destinations: LocationData[],
  mode: TransportMode
): Promise<DistanceMatrixResult[][]> {
  const key = getServerKey();
  const origStr = origins.map(o => `${o.lat},${o.lng}`).join('|');
  const destStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');
  const travelMode = TRANSPORT_MAP[mode];
  const url = `${MAPS_BASE}/distancematrix/json?origins=${origStr}&destinations=${destStr}&mode=${travelMode}&departure_time=now&key=${key}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Distance Matrix error: ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.rows || []).map((row: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (row.elements || []).map((el: any) => ({
      duration: el.status === 'OK' ? Math.round(el.duration.value / 60) : 0,
      distance: el.status === 'OK' ? Math.round((el.distance.value / 1000) * 10) / 10 : 0,
      trafficDuration: el.duration_in_traffic ? Math.round(el.duration_in_traffic.value / 60) : undefined,
    }))
  );
}

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  types: string[];
}

export async function searchNearbyPlaces(
  location: LocationData,
  query: string,
  radius: number = 2000
): Promise<PlaceSearchResult[]> {
  const key = getServerKey();
  const url = `${MAPS_BASE}/place/textsearch/json?query=${encodeURIComponent(query)}&location=${location.lat},${location.lng}&radius=${radius}&key=${key}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Places API error: ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.results || []).slice(0, 10).map((p: any) => ({
    placeId: p.place_id,
    name: p.name,
    address: p.formatted_address,
    lat: p.geometry?.location?.lat,
    lng: p.geometry?.location?.lng,
    rating: p.rating,
    types: p.types || [],
  }));
}

/** Check for traffic delays on a route; returns delay in minutes vs normal */
export async function checkTrafficDelay(
  origin: LocationData,
  destination: LocationData
): Promise<number> {
  const result = await getDistanceMatrix([origin], [destination], 'car');
  if (!result[0]?.[0]) return 0;
  const { duration, trafficDuration } = result[0][0];
  if (!trafficDuration) return 0;
  return Math.max(0, trafficDuration - duration);
}
