/**
 * Shared CORS helpers for Edge Functions.
 * Origins are controlled via ALLOWED_ORIGINS (comma-separated).
 */

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ||
  'https://theenclosure.co.uk,https://www.theenclosure.co.uk,http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export function getAllowedOrigin(request: Request): string {
  const requestOrigin = request.headers.get('Origin');
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }
  return ALLOWED_ORIGINS[0] || 'https://theenclosure.co.uk';
}

export function buildCorsHeaders(request: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(request),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

/** Fallback static headers for callers that do not pass a Request yet */
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://theenclosure.co.uk',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: buildCorsHeaders(request) });
  }
  return null;
}
