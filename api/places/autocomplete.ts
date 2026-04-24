import type { VercelRequest, VercelResponse } from '@vercel/node';

// Normalized suggestion shape consumed by AddressAutocomplete.
// Provider is 'google' when GOOGLE_MAPS_API_KEY is configured, else falls
// back to 'nominatim' (OpenStreetMap) so the UI still works with no key.
type Suggestion = {
  placeId: string;
  provider: 'google' | 'nominatim';
  description: string;
  mainText?: string;
  secondaryText?: string;
};

async function googleSuggestions(query: string, key: string): Promise<Suggestion[]> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  url.searchParams.set('input', query);
  url.searchParams.set('types', 'address');
  url.searchParams.set('key', key);
  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const data = await res.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error('Google Places autocomplete error:', data.status, data.error_message);
    return [];
  }
  return (data.predictions ?? []).slice(0, 8).map((p: any) => ({
    placeId: p.place_id,
    provider: 'google' as const,
    description: p.description,
    mainText: p.structured_formatting?.main_text,
    secondaryText: p.structured_formatting?.secondary_text,
  }));
}

async function nominatimSuggestions(query: string): Promise<Suggestion[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '8');
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'AS-CRM/1.0 (address-autocomplete)' },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as any[];
  return data.map((r) => ({
    placeId: `nominatim:${r.place_id}`,
    provider: 'nominatim' as const,
    description: r.display_name,
    mainText: r.display_name.split(',')[0]?.trim(),
    secondaryText: r.display_name.split(',').slice(1).join(',').trim(),
  }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q.length < 3) {
    return res.status(200).json({ suggestions: [], provider: 'none' });
  }

  try {
    const googleKey = process.env.GOOGLE_MAPS_API_KEY;
    const suggestions = googleKey
      ? await googleSuggestions(q, googleKey)
      : await nominatimSuggestions(q);
    return res.status(200).json({
      suggestions,
      provider: googleKey ? 'google' : 'nominatim',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch suggestions.';
    return res.status(500).json({ error: message });
  }
}
