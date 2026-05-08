// GET /api/v1/traffic/monitor
import { NextRequest, NextResponse } from 'next/server';
import { checkTrafficDelay, getDistanceMatrix } from '@/lib/google-maps';
import type { LocationData } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const originLat = parseFloat(searchParams.get('originLat') || '0');
    const originLng = parseFloat(searchParams.get('originLng') || '0');
    const destLat = parseFloat(searchParams.get('destLat') || '0');
    const destLng = parseFloat(searchParams.get('destLng') || '0');

    if (!originLat || !originLng || !destLat || !destLng) {
      return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
    }

    const origin: LocationData = { lat: originLat, lng: originLng, placeId: '' };
    const dest: LocationData = { lat: destLat, lng: destLng, placeId: '' };

    const delay = await checkTrafficDelay(origin, dest);
    const matrix = await getDistanceMatrix([origin], [dest], 'car');

    return NextResponse.json({
      delayMinutes: delay,
      hasSignificantDelay: delay > 15,
      matrix: matrix[0]?.[0] || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[traffic/monitor]', error);
    return NextResponse.json({ error: 'Traffic monitoring failed' }, { status: 500 });
  }
}
