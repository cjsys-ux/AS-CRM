import type { VercelRequest, VercelResponse } from '@vercel/node';

// Resolved address shape consumed by AddressAutocomplete's onSelect.
type ResolvedAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  formatted: string;
  latitude?: number;
  longitude?: number;
};

async function googleDetails(placeId: string, key: string): Promise<ResolvedAddress | null> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'address_components,formatted_address,geometry');
  url.searchParams.set('key', key);
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 'OK') {
    console.error('Google Places details error:', data.status, data.error_message);
    return null;
  }
  const comps: Array<{ long_name: string; short_name: string; types: string[] }> =
    data.result?.address_components ?? [];
  const pick = (type: string, short = false): string => {
    const c = comps.find((x) => x.types.includes(type));
    return c ? (short ? c.short_name : c.long_name) : '';
  };

  const streetNumber = pick('street_number');
  const route = pick('route');
  const street = [streetNumber, route].filter(Boolean).join(' ');

  return {
    street,
    city: pick('locality') || pick('postal_town') || pick('sublocality') || '',
    state: pick('administrative_area_level_1', true),
    zip: pick('postal_code'),
    country: pick('country', true),
    formatted: data.result?.formatted_address ?? '',
    latitude: data.result?.geometry?.location?.lat,
    longitude: data.result?.geometry?.location?.lng,
  };
}

async function nominatimDetails(placeId: string): Promise<ResolvedAddress | null> {
  // placeId is the nominatim id with the `nominatim:` prefix we added.
  const id = placeId.replace(/^nominatim:/, '');
  const url = new URL('https://nominatim.openstreetmap.org/details');
  url.searchParams.set('place_id', id);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'AS-CRM/1.0 (address-autocomplete)' },
  });
  if (!res.ok) {
    // Fallback: re-search by the place id text is unsupported; bail gracefully.
    return null;
  }
  const data = await res.json();
  const addr = data.addresstags ?? data.address ?? {};
  const street = [addr['housenumber'] ?? addr['house_number'], addr['road'] ?? addr['street']]
    .filter(Boolean)
    .join(' ');
  return {
    street,
    city: addr.city || addr.town || addr.village || addr.hamlet || '',
    state: addr.state || '',
    zip: addr.postcode || '',
    country: addr.country_code ? String(addr.country_code).toUpperCase() : addr.country || '',
    formatted: data.localname || street,
    latitude: data.centroid?.coordinates?.[1],
    longitude: data.centroid?.coordinates?.[0],
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const placeId = typeof req.query.placeId === 'string' ? req.query.placeId : '';
  if (!placeId) {
    return res.status(400).json({ error: 'placeId is required.' });
  }

  try {
    const googleKey = process.env.GOOGLE_MAPS_API_KEY;
    let address: ResolvedAddress | null = null;
    if (placeId.startsWith('nominatim:')) {
      address = await nominatimDetails(placeId);
    } else if (googleKey) {
      address = await googleDetails(placeId, googleKey);
    }
    if (!address) {
      return res.status(404).json({ error: 'Address not found.' });
    }
    return res.status(200).json({ address });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to resolve address.';
    return res.status(500).json({ error: message });
  }
}
