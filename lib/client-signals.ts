'use client';

/**
 * The identifiers a browser can supply to the server for event matching.
 *
 * `external_id` is ours: a stable random id per browser, so events from the
 * same person across a session join up even before they give us an email.
 * `_fbc` / `_fbp` are Meta's own cookies. `_fbc` only exists if the visitor
 * arrived with an fbclid, so we synthesise it from the URL on first landing,
 * exactly as Meta's own pixel would.
 */

const EXTERNAL_ID_KEY = 'kz_external_id';

export function getOrCreateExternalId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existing = localStorage.getItem(EXTERNAL_ID_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(EXTERNAL_ID_KEY, id);
    return id;
  } catch {
    return '';
  }
}

export function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

/** Meta's format: fb.1.<timestamp>.<fbclid> */
export function captureFbclid(): void {
  if (typeof window === 'undefined') return;
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  if (!fbclid || readCookie('_fbc')) return;
  const value = `fb.1.${Date.now()}.${fbclid}`;
  document.cookie = `_fbc=${value}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`;
}

export function readUtm() {
  if (typeof window === 'undefined') return {};
  const q = new URLSearchParams(window.location.search);
  const pick = (k: string) => q.get(k) || undefined;
  return {
    source: pick('utm_source'),
    medium: pick('utm_medium'),
    campaign: pick('utm_campaign'),
    content: pick('utm_content'),
    term: pick('utm_term'),
  };
}

/**
 * GA4's client id, pulled out of the _ga cookie.
 *
 * The cookie looks like `GA1.1.1234567890.1699999999` and GA4 wants only the
 * last two parts joined: `1234567890.1699999999`. Sending the whole cookie
 * makes the server event land as a separate unattributed session.
 */
export function readGaClientId(): string {
  const raw = readCookie('_ga');
  if (!raw) return '';
  const parts = raw.split('.');
  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : '';
}

/** Everything a server event route needs from the browser, in one object. */
export function collectSignals() {
  return {
    externalId: getOrCreateExternalId(),
    gaClientId: readGaClientId(),
    fbc: readCookie('_fbc') || undefined,
    fbp: readCookie('_fbp') || undefined,
    eventSourceUrl: typeof window !== 'undefined' ? window.location.href : '',
    utm: readUtm(),
  };
}
