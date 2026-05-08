// POST /api/v1/itinerary/adapt
import { NextRequest, NextResponse } from 'next/server';
import { adaptItinerary } from '@/lib/gemini';
import type { AdaptItineraryRequest, DailyItinerary } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AdaptItineraryRequest & { currentDayItinerary: DailyItinerary };

    if (!body.tripId || !body.disruption) {
      return NextResponse.json({ error: 'Missing tripId or disruption data' }, { status: 400 });
    }

    const result = await adaptItinerary(body, body.currentDayItinerary);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[itinerary/adapt]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
