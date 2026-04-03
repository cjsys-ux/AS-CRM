/**
 * Fetch JSON from Vercel `/api/*` routes (MongoDB/S3 backend).
 * Returns `fallback` when the response is not OK or the request fails.
 */
export async function apiGetJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(path);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}
