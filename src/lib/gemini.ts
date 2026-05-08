// NomadIQ – Gemini AI Engine
import type { GenerateItineraryRequest, GenerateItineraryResponse, AdaptItineraryRequest, DailyItinerary, LiveAdaptation, TransportSegment, EnergyLevel } from './types';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

const SYSTEM_PROMPT = `You are NomadIQ, an elite AI travel planner. Generate hyper-personalized travel itineraries.
RULES: Every activity needs real place names, GPS coords, energy_requirement (Low/Medium/High), energy_cost (0-30). Respect transport/pace/diet/accessibility preferences. Insert rest when energy>70. Keep budget realistic.
OUTPUT strict JSON: { "trip_summary": { "fatigue_score": number, "budget_status": "Healthy"|"Warning"|"Over", "total_activities": number, "destination": string }, "daily_itinerary": [{ "day": number, "date": "YYYY-MM-DD", "theme": string, "activities": [{ "id": string, "time": "HH:MM", "end_time": "HH:MM", "activity": string, "description": string, "energy_requirement": "Low"|"Medium"|"High", "energy_cost": number, "location_data": { "lat": number, "lng": number, "place_id": string, "address": string }, "category": string, "estimated_cost": number, "accessibility_score": number }], "transportation": [{ "from": string, "to": string, "mode": string, "duration": number, "distance": number, "optimization_reason": string }], "total_energy_cost": number, "total_estimated_cost": number }], "transportation_plan": [{ "mode": string, "optimization_reason": string }], "live_adaptations": [] }`;

const ADAPT_PROMPT = `You are NomadIQ's Disruption Engine. Given itinerary + disruption, generate shadow plan replacing only affected activities. Keep similar energy/budget/proximity. Output JSON: { "adapted_activities": [...], "change_log": string, "reason": "weather"|"traffic"|"closure"|"safety" }`;

function buildPayload(system: string, user: string, imageBase64?: string) {
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [{ text: system }, { text: user }];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
    parts.push({ text: 'Analyze this image for travel destinations and incorporate into the itinerary.' });
  }
  return { contents: [{ parts }], generationConfig: { temperature: 0.7, topP: 0.9, topK: 40, maxOutputTokens: 8192, responseMimeType: 'application/json' } };
}

function clean(raw: string): unknown {
  let s = raw.trim();
  if (s.startsWith('```')) s = s.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(s);
}

function mapEnergy(l: string): EnergyLevel {
  const n = l?.toLowerCase();
  return n === 'high' ? 'High' : n === 'medium' ? 'Medium' : 'Low';
}

export async function generateItinerary(req: GenerateItineraryRequest): Promise<GenerateItineraryResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const userPrompt = `Plan trip to ${req.destination} from ${req.startDate} to ${req.endDate}. Transport: ${req.preferences.transport}, Pace: ${req.preferences.pace}, Diet: ${req.preferences.diet.join(', ') || 'None'}, Accessibility: ${req.preferences.accessibility ? 'Required' : 'No'}, Budget/day: $${req.preferences.budgetPerDay}, Interests: ${req.preferences.interests.join(', ') || 'General'}. ${req.prompt || ''}`;

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload(SYSTEM_PROMPT, userPrompt, req.imageBase64)) });
  if (!res.ok) throw new Error(`Gemini error: ${res.status} – ${await res.text()}`);
  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error('Empty Gemini response');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = clean(content) as any;

  const dailyItinerary: DailyItinerary[] = (p.daily_itinerary || []).map((d: Record<string, unknown>) => ({
    day: d.day as number, date: d.date as string, theme: d.theme as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activities: ((d.activities as any[]) || []).map((a: Record<string, unknown>) => ({
      id: a.id || `act_${d.day}_${Math.random().toString(36).slice(2,6)}`,
      time: a.time, endTime: a.end_time, activity: a.activity, description: a.description,
      energyRequirement: mapEnergy(a.energy_requirement as string), energyCost: a.energy_cost,
      locationData: { lat: (a.location_data as Record<string, unknown>)?.lat || 0, lng: (a.location_data as Record<string, unknown>)?.lng || 0, placeId: (a.location_data as Record<string, unknown>)?.place_id || '', address: (a.location_data as Record<string, unknown>)?.address },
      category: a.category, estimatedCost: a.estimated_cost, accessibilityScore: a.accessibility_score,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transportation: ((d.transportation as any[]) || []).map((t: Record<string, unknown>) => ({ from: t.from, to: t.to, mode: t.mode, duration: t.duration, distance: t.distance, optimizationReason: t.optimization_reason })) as TransportSegment[],
    totalEnergyCost: d.total_energy_cost as number, totalEstimatedCost: d.total_estimated_cost as number,
  }));

  const s = p.trip_summary || {};
  return {
    tripSummary: { fatigueScore: s.fatigue_score || 50, budgetStatus: s.budget_status || 'Healthy', totalActivities: s.total_activities || 0, destination: s.destination || req.destination },
    dailyItinerary,
    transportationPlan: (p.transportation_plan || []).map((t: Record<string, unknown>) => ({ from: '', to: '', mode: t.mode, duration: 0, distance: 0, optimizationReason: t.optimization_reason })) as TransportSegment[],
    liveAdaptations: (p.live_adaptations || []) as LiveAdaptation[],
  };
}

export async function adaptItinerary(req: AdaptItineraryRequest, currentDay: DailyItinerary): Promise<{ adaptedDay: DailyItinerary; adaptation: LiveAdaptation }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
  const userPrompt = `Day ${req.currentDay}: ${JSON.stringify(currentDay)}\nDISRUPTION: ${req.disruption.type}, severity ${req.disruption.severity}/10, ${req.disruption.details}. User at ${req.currentLocation.lat},${req.currentLocation.lng}. Generate shadow plan.`;
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload(ADAPT_PROMPT, userPrompt)) });
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error('Empty adaptation response');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = clean(content) as any;
  return { adaptedDay: { ...currentDay }, adaptation: { id: `adapt_${Date.now()}`, reason: p.reason, changeLog: p.change_log, originalActivity: '', newActivity: '', timestamp: new Date().toISOString() } };
}
