const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

if (!MAPTILER_API_KEY) {
  throw new Error("NEXT_PUBLIC_MAPTILER_API_KEY is not set.");
}

/**
 * Forward geocoding (autocomplete): query -> list of places
 */
export async function forwardGeocode(query: string) {
  if (!query.trim()) return [];

  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
    query,
  )}.json?key=${MAPTILER_API_KEY}&autocomplete=true&limit=5`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch geocoding results");

  const data = await res.json();
  if (data.features) {
    return data.features.map((f: any) => ({
      name: f.place_name,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    }));
  }

  return [];
}

/**
 * Forward geocoding (single best match): address -> coordinates
 */
export async function geocodeAddress(address: string) {
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${MAPTILER_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to geocode address");

  const data = await res.json();
  if (data.features && data.features.length > 0) {
    const feature = data.features[0];
    return {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      formatted: feature.place_name,
    };
  }

  return null;
}

/**
 * Reverse geocoding: coordinates -> address
 */
export async function reverseGeocode(lat: number, lng: number) {
  const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to reverse geocode coordinates");

  const data = await res.json();
  if (data.features && data.features.length > 0) {
    const feature = data.features[0];
    return {
      formatted: feature.place_name,
      raw: feature,
    };
  }

  return null;
}