/**
 * Pabbly Connect: the registration hand-off.
 *
 * Analytics tells Meta and GA4 that a registration happened. This tells the
 * automation WHO registered, so they actually receive the WhatsApp invite, the
 * joining details and the guides, and land as a row in the sheet.
 *
 * Fired from /api/register, in the same request that fires Meta's
 * registration_complete, so the two can never disagree about whether a lead
 * exists.
 *
 * ── Why this payload carries the Meta match keys too ──────────────────────
 * Pabbly is the ONLY place the full, unhashed record of a registration exists.
 * Meta receives hashes and nothing descriptive, and GA4 receives no PII at
 * all. So `fbc`, `fbp`, `client_ip_address`, `client_user_agent`,
 * `external_id` and `registration_event_id` ride along here — they are what
 * makes it possible to rebuild, replay or reconcile a Meta event later from the
 * sheet.
 */
export const pabblyReady = () => Boolean(process.env.PABBLY_WEBHOOK_URL);

export type PabblyRegistration = {
  leadId: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  countryCode: string;
  occupation: string;
  fbc: string;
  fbp: string;
  clientIp: string;
  clientUserAgent: string;
  externalId: string;
  eventSourceUrl: string;
  isTest: boolean;
  /** The event_id sent to Meta as registration_complete. */
  registrationEventId: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  fbclid: string;
  referrer: string;
  landingUrl: string;
  product: string;
  /** Where the visitor is according to the edge, independent of the form. */
  geoCountry: string;
  geoCity: string;
};

/* Every key is emitted on every call, empty string where unknown. Pabbly
   builds its field mapper from the FIRST payload it sees, so a key that is
   merely absent on the first test call cannot be mapped afterwards without
   re-running the trigger — an omitted key is far more expensive here than an
   empty one. */
const s = (v: unknown) => (v == null ? '' : String(v));

export async function sendPabblyRegistration(
  p: PabblyRegistration,
): Promise<{ ok: boolean; status: number }> {
  const url = process.env.PABBLY_WEBHOOK_URL ?? '';
  if (!url) return { ok: false, status: 0 };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      /* Flat keys, no nesting: Pabbly maps fields one level deep, and a nested
         object arrives as an unusable blob in the step mapper. */
      body: JSON.stringify({
        event: 'free_registration',
        funnel: 'dubai_free',
        product: s(p.product),
        lead_id: s(p.leadId),
        created_at: s(p.createdAt),
        first_name: s(p.firstName),
        last_name: s(p.lastName),
        name: `${s(p.firstName)} ${s(p.lastName)}`.trim(),
        email: s(p.email),
        phone: s(p.phone),
        city: s(p.city),
        country_code: s(p.countryCode),
        occupation: s(p.occupation),
        fbc: s(p.fbc),
        fbp: s(p.fbp),
        client_ip_address: s(p.clientIp),
        client_user_agent: s(p.clientUserAgent),
        external_id: s(p.externalId),
        event_source_url: s(p.eventSourceUrl),
        /* Boolean, not the string "false": a Pabbly router condition on a
           non-empty string treats "false" as true. */
        is_test: Boolean(p.isTest),
        registration_event_id: s(p.registrationEventId),
        utm_source: s(p.utmSource),
        utm_medium: s(p.utmMedium),
        utm_campaign: s(p.utmCampaign),
        utm_content: s(p.utmContent),
        utm_term: s(p.utmTerm),
        fbclid: s(p.fbclid),
        referrer: s(p.referrer),
        landing_url: s(p.landingUrl),
        geo_country: s(p.geoCountry),
        geo_city: s(p.geoCity),
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
