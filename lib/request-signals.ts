/**
 * The two signals only the SERVER can read honestly: the caller's IP and their
 * user agent.
 *
 * Meta counts `client_ip_address` and `client_user_agent` as match keys, and
 * they are the two that cost the most when missing: an event without them
 * loses the browser-fingerprint half of the match and the EMQ score drops
 * accordingly. The browser cannot supply its own IP, and a user agent sent up
 * in a JSON body is trivially forgeable, so both are taken from the request
 * headers instead — the same way /api/meta/event has always done it.
 *
 * Both are read from the request that the visitor's OWN browser makes —
 * /api/meta/event and /api/register — never from a server-to-server call,
 * whose headers would describe that server and ship a confidently wrong value,
 * which is worse for matching than shipping nothing.
 *
 * Header order matters. `x-forwarded-for` is a comma-separated chain in which
 * the ORIGINAL client is first and every proxy appends itself; taking the last
 * entry yields the CDN's own address. Vercel's `x-vercel-forwarded-for` and
 * Cloudflare's `cf-connecting-ip` are single-value and already resolved, so
 * they are preferred where present.
 */

const IP_HEADERS = [
  'cf-connecting-ip',
  'x-vercel-forwarded-for',
  'x-real-ip',
] as const;

/** IPv4 dotted quad, or an IPv6 form (possibly with a zone or brackets). */
function looksLikeIp(v: string): boolean {
  if (!v) return false;
  const s = v.replace(/^\[|\]$/g, '');
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(s) || /^[0-9a-f:]+$/i.test(s);
}

export function readClientIp(req: Request): string {
  for (const h of IP_HEADERS) {
    const v = (req.headers.get(h) ?? '').trim();
    if (looksLikeIp(v)) return v;
  }
  /* First entry, not last: the chain reads client → proxy → proxy. */
  const first = (req.headers.get('x-forwarded-for') ?? '')
    .split(',')[0]
    ?.trim();
  return looksLikeIp(first ?? '') ? (first as string) : '';
}

export function readClientUserAgent(req: Request): string {
  return (req.headers.get('user-agent') ?? '').trim();
}

/**
 * Where the caller is, according to the edge — not according to anything the
 * browser said.
 *
 * Vercel and Cloudflare both stamp the resolved visitor location onto every
 * request. On the landing-page events (ViewContent, atc_event) nobody has typed
 * a city or picked a country yet, so these headers are the ONLY location match
 * keys those events can carry, and country + city + region add measurably to
 * EMQ. On registration_complete the form's own answers take precedence; these
 * fill only what the form does not ask (region, postcode).
 *
 * Vercel URL-encodes the city ("Abu%20Dhabi"), so it is decoded here. Values
 * that are absent come back as empty strings and are simply not sent.
 */
export type EdgeGeo = { country: string; city: string; region: string; zip: string };

function header(req: Request, ...names: string[]): string {
  for (const n of names) {
    const v = (req.headers.get(n) ?? '').trim();
    if (v) {
      try {
        return decodeURIComponent(v);
      } catch {
        return v;
      }
    }
  }
  return '';
}

export function readEdgeGeo(req: Request): EdgeGeo {
  const country = header(req, 'x-vercel-ip-country', 'cf-ipcountry').toLowerCase();
  return {
    /* Cloudflare uses XX / T1 for unknown and Tor. Neither is a country. */
    country: /^[a-z]{2}$/.test(country) && country !== 'xx' && country !== 't1' ? country : '',
    city: header(req, 'x-vercel-ip-city', 'cf-ipcity'),
    region: header(req, 'x-vercel-ip-country-region', 'cf-region-code'),
    zip: header(req, 'x-vercel-ip-postal-code', 'cf-postal-code'),
  };
}
