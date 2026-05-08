// POST /api/v1/itinerary/generate
import { NextRequest, NextResponse } from 'next/server';
import { generateItinerary } from '@/lib/gemini';
import type { GenerateItineraryRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateItineraryRequest;

    if (!body.destination || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: 'Missing required fields: destination, startDate, endDate' }, { status: 400 });
    }

    const defaults = {
      transport: 'public-transit' as const,
      diet: [],
      pace: 'moderate' as const,
      accessibility: false,
      budgetPerDay: 100,
      interests: [],
    };
    body.preferences = { ...defaults, ...body.preferences };

    const result = await generateItinerary(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[itinerary/generate]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
